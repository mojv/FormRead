import {store} from "./index";
import Tesseract from 'tesseract.js';
import {Html5Qrcode} from "html5-qrcode"
import {Html5QrcodeSupportedFormats} from "html5-qrcode"

// import {imread, MatVector, Mat, cvtColor, COLOR_RGBA2GRAY, threshold, THRESH_BINARY, findContours, RETR_EXTERNAL, RETR_LIST, CHAIN_APPROX_SIMPLE, Scalar, drawContours, LINE_8, contourArea, arcLength, approxPolyDP, Point, matFromArray, Size, getPerspectiveTransform, warpPerspective, INTER_LINEAR, BORDER_CONSTANT, imshow, CV_32FC2, boundingRect} from 'opencv.js';

export default class formClass {
    constructor(formId, src, fromCam, VueContext, markAsSelected) {
        this.id = formId
        this.src_original = src;
        this.src = '';
        this.canvas = null
        this.anchors = {}
        this.isAnchorProcessed = false
        this.hasError = false
        this.omrQuestions = {}
        this.results = {}
        if(fromCam){
            store.commit('mutateProperty', ['anchors', {hasAnchors: true, anchorType: 'corners'}])
        }
        this.setCanvasFromSrc(src, false).then(() => this.markAsSelected(VueContext, markAsSelected))
    }

    markAsSelected(VueContext, markAsSelected){
        store.commit('mutateProperty', ['totalForms', Object.keys(store.state.forms).length])
        if(markAsSelected){
            store.commit('selectForm', this.id )
            VueContext.updateCanvas(true)
        }
    }

    async setCanvasFromSrc(src, isAnchorError){
        this.src = src
        this.canvas = await document.createElement('canvas')
        let image = new Image()
        image.src = src
        await image.decode();
        this.canvas.height = image.height; this.canvas.width = image.width
        let ctx = this.canvas.getContext('2d');
        await ctx.drawImage(image,0,0);
        if(store.state.anchors.hasAnchors && !this.isAnchorProcessed && !isAnchorError){
            await this.processAnchors()
        }
    }

    async detectSheetCorners() {
        let cv_src = cv.imread(this.canvas)
        let imgArea = this.canvas.height * this.canvas.width
        let [contours, hierarchy] = this.getContours(cv_src)

        this.findExternalSheetCorners(contours)
        cv_src.delete();
        contours.delete();
        hierarchy.delete();
    }

    async updateSrc(dst) {
        // display images in canvas
        await cv.imshow(this.canvas, dst);
        let new_src = await this.canvas.toDataURL()
        store.commit('updateFormProp', [this.id, 'src', new_src])
        store.commit('updateFormProp', [this.id, 'isAnchorProcessed', true])
        dst.delete()
    }

    getContours(src, isCanny = false) {
        let dst = src.clone();
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        let retr_mode
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);

        if(isCanny){
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
            let ksize = new cv.Size(5, 5);
            cv.GaussianBlur(dst, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
            cv.Canny(dst, dst, 75, 200, 3, false);
            retr_mode = cv.RETR_EXTERNAL
        }else{
            cv.threshold(dst, dst, 120, 200, cv.THRESH_BINARY);
            retr_mode = cv.RETR_LIST
        }
        cv.findContours(dst, contours, hierarchy, retr_mode, cv.CHAIN_APPROX_SIMPLE);
        dst.delete();
        return [contours, hierarchy]
    }

    filterContoursByArea(contours, LowerLimit, upperLimit){
        let boundingRects = []

        for (let i = 0; i < contours.size(); ++i) {
            let cnt = contours.get(i);
            let boundRect = cv.boundingRect(cnt)
            let cntArea = boundRect.width * boundRect.height
            boundRect.left = boundRect.x; delete boundRect.x
            boundRect.top = boundRect.y; delete boundRect.y
            if (cntArea > LowerLimit && cntArea < upperLimit){
                boundingRects.push(boundRect)
            }
        }

        boundingRects.sort((item1, item2) => {
            return (item1.width * item1.height > item2.width * item2.height) ? -1 : (item1.width * item1.height < item2.width * item2.height) ? 1 : 0;
        })

        return boundingRects
    }

    setDefaultAnchors(){
        store.commit('updateFormProp', [this.id, 'hasError', true])
        this.updateFormSrc(this.src_original, true)
        this.anchors['anchor-0'] = [0.05 , 0.05]
        this.anchors['anchor-1'] = [0.95 , 0.05]
        this.anchors['anchor-2'] = [0.05 , 0.95]
        this.anchors['anchor-3'] = [0.95 , 0.95]
        store.commit('updateFormProp', [this.id, 'anchors', this.anchors])
        return false;
    }

    findExternalSheetCorners(contours) {
        let foundContour = new cv.MatVector();
        let sortableContours = this.sortContours(contours);

        //Ensure the top area contour has 4 corners (NOTE: This is not a perfect science and likely needs more attention)
        let approx = new cv.Mat();

        if(sortableContours.length === 0){
            return this.setDefaultAnchors()
        }

        cv.approxPolyDP(sortableContours[0].contour, approx, .05 * sortableContours[0].perimiterSize, true);

        if (approx.rows === 4) {
            foundContour = approx;
        } else {
            return this.setDefaultAnchors()
        }

        //Find the corners
        //foundCountour has 2 channels (seemingly x/y), has a depth of 4, and a type of 12.  Seems to show it's a CV_32S "type", so the valid data is in data32S??
        let corner1 = new cv.Point(foundContour.data32S[0], foundContour.data32S[1]);
        let corner2 = new cv.Point(foundContour.data32S[2], foundContour.data32S[3]);
        let corner3 = new cv.Point(foundContour.data32S[4], foundContour.data32S[5]);
        let corner4 = new cv.Point(foundContour.data32S[6], foundContour.data32S[7]);

        //Order the corners
        let cornerArray = [{corner: corner1}, {corner: corner2}, {corner: corner3}, {corner: corner4}];
        //Sort by Y position (to get top-down)
        cornerArray.sort((item1, item2) => {
            return (item1.corner.y < item2.corner.y) ? -1 : (item1.corner.y > item2.corner.y) ? 1 : 0;
        }).slice(0, 5);

        for(let [index, item] of cornerArray.entries()){
            let left = item.corner.x / this.canvas.width
            let top =  item.corner.y / this.canvas.height
            this.anchors['anchor-' + index] = [left , top]
        }
        store.commit('updateFormProp', [this.id, 'anchors', this.anchors])

        approx.delete();
        return cornerArray
    }

    sortContours(contours){
        //Get area for all contours so we can find the biggest
        let sortableContours = [];

        for (let i = 0; i < contours.size(); i++) {
            let cnt = contours.get(i);
            let area = cv.contourArea(cnt, false);
            let perim = cv.arcLength(cnt, false);

            sortableContours.push(new SortableContour({areaSize: area, perimiterSize: perim, contour: cnt}));
        }

        //Sort 'em
        return sortableContours.sort((item1, item2) => {
            return (item1.areaSize > item2.areaSize) ? -1 : (item1.areaSize < item2.areaSize) ? 1 : 0;
        }).slice(0, 5);
    }

    fourPointsTransform(src, cornerArray) {
        //Determine left/right based on x position of top and bottom 2
        let tl = cornerArray[0].corner.x < cornerArray[1].corner.x ? cornerArray[0] : cornerArray[1];
        let tr = cornerArray[0].corner.x > cornerArray[1].corner.x ? cornerArray[0] : cornerArray[1];
        let bl = cornerArray[2].corner.x < cornerArray[3].corner.x ? cornerArray[2] : cornerArray[3];
        let br = cornerArray[2].corner.x > cornerArray[3].corner.x ? cornerArray[2] : cornerArray[3];

        //Calculate the max width/height
        let widthBottom = Math.hypot(br.corner.x - bl.corner.x, br.corner.y - bl.corner.y);
        let widthTop = Math.hypot(tr.corner.x - tl.corner.x, tr.corner.y - tl.corner.y);
        let theWidth = (widthBottom > widthTop) ? widthBottom : widthTop;
        var theHeight

        if (store.state.sheetAspectRatio === null) {
            let heightRight = Math.hypot(tr.corner.x - br.corner.x, tr.corner.y - br.corner.y);
            let heightLeft = Math.hypot(tl.corner.x - bl.corner.x, tr.corner.y - bl.corner.y);
            theHeight = (heightRight > heightLeft) ? heightRight : heightLeft;
            store.commit('mutateProperty', ['sheetAspectRatio', theWidth / theHeight])
            store.commit('mutateProperty', ['canvasWidth', store.state.canvasHeight * theWidth / theHeight])
        } else {
            theHeight = theWidth / store.state.sheetAspectRatio;
        }

        //Transform!
        let finalDestCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, theWidth - 1, 0, theWidth - 1, theHeight - 1, 0, theHeight - 1]); //
        let srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [tl.corner.x, tl.corner.y, tr.corner.x, tr.corner.y, br.corner.x, br.corner.y, bl.corner.x, bl.corner.y]);
        let dsize = new cv.Size(theWidth, theHeight);
        let M = cv.getPerspectiveTransform(srcCoords, finalDestCoords)

        let transformed = new cv.Mat();
        cv.warpPerspective(src, transformed, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
        src.delete(); srcCoords.delete(); finalDestCoords.delete(); M.delete();
        return transformed;
    }

    async findAnchors(areaName) {
        if(this.hasError){
            return
        }
        let area = store.state.formReadAreas[areaName]
        let [areaCanvas, imgArea] = this.getAreaCanvas(area)
        let cv_src = await cv.imread(areaCanvas)
        let [contours, hierarchy]  = this.getContours(cv_src)
        let boundingRects = this.filterContoursByArea(contours,0, imgArea * 0.95)

        if(boundingRects.length > 0){
            let left = area.left + (boundingRects[0].left + boundingRects[0].width/2) / this.canvas.width
            let top =  area.top  + (boundingRects[0].top + boundingRects[0].height/2)/ this.canvas.height
            this.anchors[areaName] = [left , top]
        }else {
            delete this.anchors[areaName]
        }
        // override anchor so it is reactive
        store.commit('updateFormProp', [this.id, 'anchors', this.anchors])
        cv_src.delete(); contours.delete(); hierarchy.delete();
    }

    async processAnchors(){
        if(Object.keys(this.anchors).length === 0){
            if(store.state.anchors.anchorType === 'corners'){
                await this.detectSheetCorners()
            }else{
                await this.findAnchors('anchor-0')
                await this.findAnchors('anchor-1')
                await this.findAnchors('anchor-3')
                await this.findAnchors('anchor-2')
            }
        }
        if(Object.keys(this.anchors).length === 4){
            let corner1 = new cv.Point(this.anchors['anchor-0'][0]*this.canvas.width, this.anchors['anchor-0'][1]*this.canvas.height);
            let corner2 = new cv.Point(this.anchors['anchor-1'][0]*this.canvas.width, this.anchors['anchor-1'][1]*this.canvas.height);
            let corner3 = new cv.Point(this.anchors['anchor-3'][0]*this.canvas.width, this.anchors['anchor-3'][1]*this.canvas.height);
            let corner4 = new cv.Point(this.anchors['anchor-2'][0]*this.canvas.width, this.anchors['anchor-2'][1]*this.canvas.height);

            let cornerArray = [{corner: corner1}, {corner: corner2}, {corner: corner3}, {corner: corner4}];
            let cv_src = await cv.imread(this.canvas)
            let dst = this.fourPointsTransform(cv_src, cornerArray)
            await this.updateSrc(dst)
        }else {
            for(let name of ['anchor-0','anchor-1','anchor-3','anchor-2']){
                if(this.anchors[name] === undefined){
                    this.anchors[name] = [store.state.formReadAreas[name].left, store.state.formReadAreas[name].top]
                }
            }
            store.commit('updateFormProp', [this.id, 'anchors', this.anchors])
            store.commit('updateFormProp', [this.id, 'hasError', true])
            this.updateFormSrc(this.src_original, true)
        }

    }

    getAreaCanvas(area) {
        let width = area.width * this.canvas.width
        let height = area.height * this.canvas.height
        let left = area.left * this.canvas.width
        let top =  area.top * this.canvas.height

        let canvasArea = this.getCanvasCut(left, top, width, height)

        let imgArea = width * height
        return [canvasArea, imgArea]
    }

    getCanvasCut(left, top, width, height){
        let ctx = this.canvas.getContext('2d');

        let areaImgData = ctx.getImageData(left, top, width, height);
        let canvasArea = document.createElement('canvas');
        let ctx_area = canvasArea.getContext('2d');
        canvasArea.width = width;
        canvasArea.height = height;
        ctx_area.putImageData(areaImgData, 0, 0);

        return canvasArea
    }

    async getSrcFromCvObject(dst) {
        // display images in canvas
        let canvas = await document.createElement('canvas')
        await cv.imshow(canvas, dst);
        console.log(canvas.toDataURL())
    }

    async updateFormSrc(src, isAnchorError){
        await this.setCanvasFromSrc(src, isAnchorError)
        store.commit('updateFormProp', [this.id, 'src', src])
    }

    getAnchorZoomSrc(centerLeft, centerTop){
        let width = this.canvas.width * 0.05
        let left = centerLeft * this.canvas.width - (width/2)
        let top =  centerTop * this.canvas.height - (width/2)

        let canvasArea = this.getCanvasCut(left, top, width, width)
        let ctx_area = canvasArea.getContext('2d');
        ctx_area.beginPath();
        ctx_area.strokeStyle = "red"; // Green path
        ctx_area.moveTo((width / 2) - (0.1 * width), width / 2);
        ctx_area.lineTo((width / 2) + (0.1 * width), width / 2);
        ctx_area.moveTo(width / 2, (width / 2) - (0.1 * width));
        ctx_area.lineTo(width / 2, (width / 2) + (0.1 * width));
        ctx_area.closePath();
        ctx_area.stroke();
        return canvasArea.toDataURL()
    }

    async formRead(){
        for(let [, area] of Object.entries(store.state.formReadAreas)){
            if (area.type === 'OCR'){
                this.ocrRead(area)
            }else if(area.type === 'BCR'){
                this.bcrRead(area)
            }else if(area.type === 'OMR'){
                this.omrRead(area.name, false, store.state.formReadAreas[area.name].omrOrientation)
            }
        }
    }

    async ocrRead(area){
        let [areaCanvas, ] = this.getAreaCanvas(area)
        // var worker = Tesseract.createWorker();
        // await worker.load();
        // await worker.loadLanguage('eng');
        // await worker.initialize('eng');
        // await worker.setParameters({
        //     tessedit_char_whitelist: 'X-0123456789',
        //     preserve_interword_spaces: '0',
        // });
        // const { data: { text } } = await worker.recognize(areaCanvas);
        // this.results[area.name] = text
        // store.commit('updateFormProp', [this.id, 'results', this.results])
        // await worker.terminate();

        const { data: { text } } = await Tesseract.recognize(
            areaCanvas,
            'eng',
        )

        this.results[area.name] = text
        store.commit('updateFormProp', [this.id, 'results', this.results])

    }

    async bcrRead(area){
        let [areaCanvas, ] = this.getAreaCanvas(area)
        let canvasZoom = document.createElement('canvas')
        canvasZoom.width = 220
        canvasZoom.height = areaCanvas.height* 220/areaCanvas.width
        let context = canvasZoom.getContext('2d');
        context.drawImage(areaCanvas, 0, 0, canvasZoom.width, canvasZoom.height);
        let formatsToSupport = [Html5QrcodeSupportedFormats[area.bcrType]];
        let file = this.dataURLtoFile(canvasZoom.toDataURL())

        const html5QrCode = new Html5Qrcode(/* element id */
            "reader",
            { formatsToSupport: formatsToSupport }
        );

        html5QrCode.scanFile(file, true).then(decodedText => {
            this.results[area.name] = decodedText
        }).catch(err => {
            this.results[area.name] = 'error'
        });
    }

    dataURLtoFile(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], 'filename', {type:mime});
    }

    omrRead(areaName, isSetUp, orientation){
        let area = store.state.formReadAreas[areaName]
        if(isSetUp || this.omrQuestions[area.name] === undefined){
            if(!this.findOMRBubbles(area, orientation, isSetUp)){
                store.state.formReadAreas[areaName]['omrQuestions'] = []
                store.state.formReadAreas[areaName]['questionLabels'] = []
                store.state.formReadAreas[areaName]['firstQuestionBubbleImgs'] = []
                return
            }
            for(let [i, question] of this.omrQuestions[area.name].entries()){
                for(let [j, option] of question.entries()){
                    let [areaCanvas, imgArea] = this.getAreaCanvas(option)
                    let cv_src = cv.imread(areaCanvas)
                    this.omrQuestions[area.name][i][j]['blackPixelsRatio'] = this.getBlackPixelsRatio(cv_src, imgArea, areaCanvas)
                    this.omrQuestions[area.name][i][j]['forceAnswer'] = false
                    cv_src.delete()
                }
            }
        }
        if(isSetUp && this.omrQuestions[areaName].length !== 0){
            store.state.formReadAreas[area.name]['omrOrientation'] = orientation
            store.state.formReadAreas[areaName]['omrQuestions'] = this.omrQuestions[areaName]
            store.commit('mutateProperty', ['formReadAreas', store.state.formReadAreas])
            let optionsLength = this.omrQuestions[areaName][0].length
            let currentLabels = store.state.formReadAreas[areaName]['questionLabels']
            if(currentLabels === undefined || currentLabels.length !== optionsLength){
                store.state.formReadAreas[areaName]['questionLabels'] = Array.from(Array(optionsLength).keys()).map((val) =>  String(val))
            }
            store.state.formReadAreas[areaName]['firstQuestionBubbleImgs'] = this.getFirstQuestionBubbleImgs(areaName)
        }
    }

    findOMRBubbles(area, orientation, isSetUp){
        let [areaCanvas, imgArea] = this.getAreaCanvas(area)
        let cv_src = cv.imread(areaCanvas)
        let [contours, hierarchy] = this.getContours(cv_src, true)
        if(contours.size() === 0){
            return false
        }
        let boundingRects = this.filterContoursByArea(contours, 0, imgArea*0.95)
        boundingRects = this.filterBubbles(boundingRects, area, isSetUp)
        this.omrQuestions[area.name] = this.groupBubblesByQuestion(boundingRects, orientation)
        boundingRects.map((rect) => {
            rect.left = area.left + rect.left / this.canvas.width;
            rect.top = area.top + rect.top / this.canvas.height;
            rect.width = rect.width / this.canvas.width;
            rect.height = rect.height / this.canvas.height;
            rect.blackPixelsRatio = 0
            return rect
        })
        store.commit('updateFormProp', [this.id, 'omrQuestions', this.omrQuestions])
        cv_src.delete(); contours.delete(); hierarchy.delete()
        return true
    }

    groupBubblesByQuestion(boundingRects, orientation){
        var axis_1 = 'left'; var axis_2 = 'top'
        if(orientation === 'vertical'){
            axis_1 = 'top'; axis_2 = 'left'
        }
        boundingRects = boundingRects.sort(function(a,b){
            if(Math.abs(a[axis_2] - b[axis_2]) < a.width/2){
                return a[axis_1] - b[axis_1]
            }
            return a[axis_2] - b[axis_2]
        })
        let question = []
        let questions = []
        let temp = 0
        for(let i = 0; i < boundingRects.length; i++){
            if(i !== 0 && boundingRects[i][axis_1] < boundingRects[i-1][axis_1]){
                questions[temp] = question
                temp++
                question = []
            }
            question = question.concat(boundingRects[i])
            if(i === boundingRects.length - 1){
                questions[temp] = question
            }
        }
        return questions
    }

    filterBubbles(boundingRects, area, isSetUp) {
        // delete really stretched rects
        boundingRects = boundingRects.filter((rect)=>{
            return rect.width/rect.height > 0.25 && rect.width/rect.height < 4
        })
        if(isSetUp && area.autoBubbleSize){
            store.state.formReadAreas[area.name]['omrBubblesDimensions'] = {width: boundingRects[0].width, height: boundingRects[0].height}
        }
        // filter only really similar bubbles
        boundingRects = boundingRects.filter((rect)=>{
            let cond1 = rect.width > store.state.formReadAreas[area.name]['omrBubblesDimensions'].width*0.6
            let cond2 = rect.width < store.state.formReadAreas[area.name]['omrBubblesDimensions'].width*1.4
            let cond3 = rect.height > store.state.formReadAreas[area.name]['omrBubblesDimensions'].height*0.6
            let cond4 = rect.height < store.state.formReadAreas[area.name]['omrBubblesDimensions'].height*1.4

            return cond1 && cond2 && cond3 && cond4
        })
        // delete duplicate bubbles

        for(let [pos1, rect1] of boundingRects.entries()){
            for(let [pos2, rect2]  of boundingRects.entries()){
                if(pos1 !== pos2 && boundingRects[pos1].repeat === undefined){
                    let cond1 = Math.abs(rect1.left - rect2.left) < rect1.width/2
                    let cond2 = Math.abs(rect1.top - rect2.top) < rect1.height/2
                    if(cond1 && cond2){
                        boundingRects[pos2]['repeat'] = true
                    }
                }
            }
        }
        boundingRects = boundingRects.filter((rect)=>{
            return rect.repeat === undefined
        })

        return boundingRects
    }

    getBlackPixelsRatio(src, imgArea, areaCanvas) {
        let dst = src.clone();
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
        cv.threshold(dst, dst, 120, 200, cv.THRESH_BINARY);
        // cv.imshow(areaCanvas, dst)
        // console.log(areaCanvas.toDataURL())
        let blackPixelsRatio = 1 - (cv.countNonZero(dst) / imgArea)
        dst.delete()
        return blackPixelsRatio
    }

    getFirstQuestionBubbleImgs(areaName) {
        let bubbleImgs = []
        for(let option of this.omrQuestions[areaName][0]){
            let [areaCanvas] = this.getAreaCanvas(option)
            bubbleImgs.push(areaCanvas.toDataURL())
        }
        return bubbleImgs
    }
}

class SortableContour {
    constructor(fields) {
        Object.assign(this, fields);
    }
}
