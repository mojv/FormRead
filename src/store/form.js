import {store} from "./index";
// import {imread, MatVector, Mat, cvtColor, COLOR_RGBA2GRAY, threshold, THRESH_BINARY, findContours, RETR_EXTERNAL, RETR_LIST, CHAIN_APPROX_SIMPLE, Scalar, drawContours, LINE_8, contourArea, arcLength, approxPolyDP, Point, matFromArray, Size, getPerspectiveTransform, warpPerspective, INTER_LINEAR, BORDER_CONSTANT, imshow, CV_32FC2, boundingRect} from 'opencv.js';

export default class formClass {
    constructor(formId, src, fromCam) {
        this.id = formId
        this.src_original = src;
        this.src = '';
        this.canvas = null
        this.anchors = {}
        this.hasError = false
        if(fromCam){
            this.edgesTransformation(src)
        }else{
            this.src = src
            this.setCanvasFromSrc(src)
        }
    }

    async setCanvasFromSrc(src){
        this.canvas = await document.createElement('canvas')
        let image = new Image()
        image.src = src
        await image.decode();
        this.canvas.height = image.height; this.canvas.width = image.width
        let ctx = this.canvas.getContext('2d');
        ctx.drawImage(image,0,0);
    }


    async edgesTransformation(src) {
        this.canvas = await document.createElement('canvas')
        let image = new Image()
        image.src = src
        await image.decode();
        let imgArea = image.height * this.canvas.width
        let cv_src = cv.imread(image)
        let [contours] = this.getContours(cv_src, imgArea, false)
        let cornerArray = this.findExternalSheetCorners(contours)
        if(cornerArray){
            let dst = this.fourPointsTransform(cv_src, cornerArray)
            this.updateSrc(dst)
        }
    }

    async updateSrc(dst) {
        // display images in canvas
        await cv.imshow(this.canvas, dst);
        let new_src = this.canvas.toDataURL()
        store.commit('updateFormProp', [this.id, 'src', new_src])
    }

    getContours(src, imgArea, draw) {
        let dst = src.clone();
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
        cv.threshold(dst, dst, 120, 200, cv.THRESH_BINARY);
        cv.findContours(dst, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
        let boundingRects = []
        if (draw) {
            for (let i = 0; i < contours.size(); ++i) {
                let cnt = contours.get(i);
                let cntArea = cv.contourArea(cnt, false)

                if (cntArea/imgArea < 0.95){
                    boundingRects.push(cv.boundingRect(cnt))
                    let color = new cv.Scalar(255, 0, 0, 255);
                    cv.drawContours(src, contours, i, color, 2, cv.LINE_8, hierarchy, 100);
                }
            }
        }
        return [contours, hierarchy, src, boundingRects]
    }

    findExternalSheetCorners(contours) {
        let foundContour = new cv.MatVector();

        //Get area for all contours so we can find the biggest
        let sortableContours = [];

        for (let i = 0; i < contours.size(); i++) {
            let cnt = contours.get(i);
            let area = cv.contourArea(cnt, false);
            let perim = cv.arcLength(cnt, false);

            sortableContours.push(new SortableContour({areaSize: area, perimiterSize: perim, contour: cnt}));
        }

        //Sort 'em
        sortableContours = sortableContours.sort((item1, item2) => {
            return (item1.areaSize > item2.areaSize) ? -1 : (item1.areaSize < item2.areaSize) ? 1 : 0;
        }).slice(0, 5);

        //Ensure the top area contour has 4 corners (NOTE: This is not a perfect science and likely needs more attention)
        let approx = new cv.Mat();
        cv.approxPolyDP(sortableContours[0].contour, approx, .05 * sortableContours[0].perimiterSize, true);

        if (approx.rows === 4) {
            foundContour = approx;
        } else {
            store.commit('updateFormProp', [this.id, 'hasError', true])
            store.commit('updateFormProp', [this.id, 'src', this.src_original])
            return false;
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

        return cornerArray
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
            store.commit('setSheetAspectRatio', theWidth / theHeight)
            store.commit('setCanvasWidth', store.state.canvasHeight * theWidth / theHeight)
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
        return transformed;
    }

    async findAnchors(areaName) {
        let area = store.state.formReadAreas[areaName]
        let [areaCanvas, imgArea] = this.getAreaCanvas(area)
        let cv_src = await cv.imread(areaCanvas)
        let [,,, boundingRects] = this.getContours(cv_src, imgArea, true)

        if(boundingRects.length === 1){
            let left = area.left + (boundingRects[0].x + boundingRects[0].width/2) / this.canvas.width
            let top =  area.top  + (boundingRects[0].y + boundingRects[0].height/2)/ this.canvas.height
            this.anchors[areaName] = [left , top]
        }else {
            delete this.anchors[areaName]
        }
        // override anchor so it is reactive
        store.commit('updateFormProp', [this.id, 'anchors', this.anchors])
    }

    async processAnchors(){
        if(Object.keys(this.anchors).length === 0){
            await this.findAnchors('anchor-0')
            await this.findAnchors('anchor-1')
            await this.findAnchors('anchor-3')
            await this.findAnchors('anchor-2')
        }
        if(Object.keys(this.anchors).length === 4){
            let corner1 = new cv.Point(this.anchors['anchor-0'][0]*this.canvas.width, this.anchors['anchor-0'][1]*this.canvas.height);
            let corner2 = new cv.Point(this.anchors['anchor-1'][0]*this.canvas.width, this.anchors['anchor-1'][1]*this.canvas.height);
            let corner3 = new cv.Point(this.anchors['anchor-3'][0]*this.canvas.width, this.anchors['anchor-3'][1]*this.canvas.height);
            let corner4 = new cv.Point(this.anchors['anchor-2'][0]*this.canvas.width, this.anchors['anchor-2'][1]*this.canvas.height);

            let cornerArray = [{corner: corner1}, {corner: corner2}, {corner: corner3}, {corner: corner4}];
            let cv_src = await cv.imread(this.canvas)
            let dst = this.fourPointsTransform(cv_src, cornerArray)
            this.updateSrc(dst)
        }else {
            store.commit('updateFormProp', [this.id, 'hasError', true])
            store.commit('updateFormProp', [this.id, 'src', this.src_original])
        }

    }

    getAreaCanvas(area) {
        let ctx = this.canvas.getContext('2d');

        let width = area.width * this.canvas.width
        let height = area.height * this.canvas.height
        let left = area.left * this.canvas.width
        let top =  area.top * this.canvas.height

        let areaImgData = ctx.getImageData(left, top, width, height);
        let canvasArea = document.createElement('canvas');
        let ctx_area = canvasArea.getContext('2d');
        canvasArea.width = width;
        canvasArea.height = height;
        ctx_area.putImageData(areaImgData, 0, 0);

        let imgArea = width * height
        return [canvasArea, imgArea]
    };

}

class SortableContour {
    constructor(fields) {
        Object.assign(this, fields);
    }
}