// define a mixin object

import {fabric} from "fabric";
import {store} from "../store";

export default {
    methods: {
        selectForm(formId) {
            this.$store.commit('selectForm', formId)
            if(document.body.offsetWidth < 700){
                this.$emit('collapse-columns', 'scrollList')
            }
            this.updateCanvas()
            this.updateOmrBubbles(true)
        },
        showResultsTable(){
            this.$store.commit('mutateProperty', ['showResults', !this.showResults])
        },
        updateCanvas(shouldReloadAreas) {
            fabric.Image.fromURL(this.selectedFormSrc, img => {
                let height = document.getElementById('FormEditorArea').offsetHeight
                let width  = document.body.offsetWidth
                if(img.height/img.width <  height/width){
                    height = img.height * width / img.width
                    this.$store.commit('mutateProperty', ['canvasWidth', width])
                    this.$store.commit('mutateProperty', ['canvasHeight', height])
                }else{
                    width = img.width * height / img.height
                    this.$store.commit('mutateProperty', ['canvasWidth', width])
                    this.$store.commit('mutateProperty', ['canvasHeight', height])
                }

                this.$globals.canvas.setDimensions({width: width, height: this.canvasHeight});
                let canvas = this.$globals.canvas
                this.$globals.canvas.setBackgroundImage(img, this.$globals.canvas.renderAll.bind(canvas), {
                    scaleX: canvas.width / img.width,
                    scaleY: canvas.height / img.height
                });
                this.drawAnchorLines()
                if(shouldReloadAreas){
                    this.loadFabricAreasToCanvas()
                    this.updateOmrBubbles(true)
                }
            });
        },
        deleteAllAnchorObjects(onlyCanvas) {
            this.$globals.canvas.getObjects().forEach((obj) => {
                if(['anchor', 'cornerControl'].includes(obj.type)){
                    this.$globals.canvas.remove(obj)
                    if (!onlyCanvas) {
                        this.$store.commit('deleteFormReadArea', obj.name)
                    }
                }
            });
        },
        uploadImagesFiles: function (evt) {
            let files = evt.target.files
            let context = this
            let markAsSelected = true
            this.$store.commit('mutateProperty', ['showLoadingModal', true])
            this.totalFormsUploaded = files.length
            this.counterFormUploaded = 0
            let counter  = 0
            let totalFiles = files.length
            if(this.$page.props.user === null && files.length > 10){
                this.totalFormsUploaded = 10
                totalFiles = 10
            }

            for (let file of files) {
                var reader = new FileReader()

                //IIFE to set closure
                reader.onload = (function (theFile, VueContext, markAsSelected, count) {
                    return function (e) {
                        let src = e.target.result
                        VueContext.$store.commit('addForm', [theFile.name, src, false, VueContext, markAsSelected])
                        VueContext.counterFormUploaded++
                        if(VueContext.counterFormUploaded >= VueContext.totalFormsUploaded - 1){
                            VueContext.$store.commit('mutateProperty', ['showLoadingModal', false])
                        }
                    };
                })(file, context, markAsSelected)
                markAsSelected = false
                reader.readAsDataURL(file)
                counter++
                if(counter === totalFiles){
                    break
                }
            }
        },
        drawAnchorLines: function () {
            if(this.$store.state.totalForms === 0){
                return
            }
            this.deleteAnchorsLines()
            if (this.selectedForm.isAnchorProcessed) {
                return
            }
            if (this.$store.getters.selectedFormAnchorsCount === 4) {
                let corner1 = [this.selectedFormAnchors['anchor-0'][0] * this.canvasWidth, this.selectedFormAnchors['anchor-0'][1] * this.canvasHeight]
                let corner2 = [this.selectedFormAnchors['anchor-1'][0] * this.canvasWidth, this.selectedFormAnchors['anchor-1'][1] * this.canvasHeight]
                let corner3 = [this.selectedFormAnchors['anchor-2'][0] * this.canvasWidth, this.selectedFormAnchors['anchor-2'][1] * this.canvasHeight]
                let corner4 = [this.selectedFormAnchors['anchor-3'][0] * this.canvasWidth, this.selectedFormAnchors['anchor-3'][1] * this.canvasHeight]
                let line1 = this.makeLine([corner1[0], corner1[1], corner2[0], corner2[1]])
                let line2 = this.makeLine([corner2[0], corner2[1], corner4[0], corner4[1]])
                let line3 = this.makeLine([corner4[0], corner4[1], corner3[0], corner3[1]])
                let line4 = this.makeLine([corner3[0], corner3[1], corner1[0], corner1[1]])
                this.$globals.canvas.add(line1, line2, line3, line4);
                this.$globals.canvas.add(
                    this.makeCornerControl(corner1[0], corner1[1], line1, line4, 'anchor-0'),
                    this.makeCornerControl(corner2[0], corner2[1], line2, line1, 'anchor-1'),
                    this.makeCornerControl(corner3[0], corner3[1], line3, line4, 'anchor-2'),
                    this.makeCornerControl(corner4[0], corner4[1], line2, line3, 'anchor-3')
                );
            }
        },
        deleteAnchorsLines() {
            this.$globals.canvas.getObjects().forEach((obj) => {
                if (obj.get('type') === 'line' || obj.get('type') === 'circle') {
                    this.$globals.canvas.remove(obj)
                }
            });
        },
        activateCam() {
            this.$store.commit('mutateProperty', ['isFromCamMode', true])
            this.$emit('activateCam', true)
        },
        addFabricArea(area, name, isAnchor, type) {
            area.toObject = (function (toObject) {
                return function () {
                    return fabric.util.object.extend(toObject.call(this), {
                        name: this.name,
                        type: this.type,
                        isAnchor: this.isAnchor
                    });
                };
            })(area.toObject);
            area.name = name
            area.type = type
            area.isAnchor = isAnchor;
            this.$globals.canvas.add(area);
            this.$store.commit('updateFormReadArea', [area, true])
            if(type !== 'OmrBubble'){
                this.$globals.canvas.setActiveObject(area)
            }
            this.$globals.canvas.requestRenderAll()
        },
        getFabricRect(left, top, width, height, fillColor, strokeColor = false, evented = true) {
            let props = {
                width: width,
                height: height,
                left: left,
                top: top,
                fill: fillColor,
                borderColor: 'red',
                cornerColor: 'green',
                cornerSize: 6,
                transparentCorners: false,
                selectable: evented,
                evented: evented
            }
            if(strokeColor !== false){
                props['stroke'] =  strokeColor
            }
            return new fabric.Rect(props)
        },
        updateOmrBubbles(recalculate){
            this.$globals.canvas.getObjects().forEach((obj) => {
                if (obj.type === 'OmrBubble') {
                    this.$globals.canvas.remove(obj)
                }
            });
            if (recalculate) {
                for(let [_,area] of Object.entries(this.formReadAreas)){
                    if(area.type === 'OMR'){
                        let orientation = store.state.formReadAreas[area.name]['omrOrientation']
                        this.selectedForm.omrRead(area.name, false, orientation)
                    }
                }
            }
            for (let bubble of this.omrBubbles){
                let left = bubble.left * this.canvasWidth
                let top = bubble.top * this.canvasHeight
                let width = bubble.width * this.canvasWidth
                let height = bubble.height * this.canvasHeight
                let fillColor = 'rgb(0, 0, 0, 0)'
                let strokeColor = 'red'
                if(bubble.blackPixelsRatio > store.state.formReadAreas[bubble.areaName]['omrThreshold']){
                    fillColor = 'rgb(0, 200, 0, 0.3)'
                    strokeColor =  'green'
                }
                let area = this.getFabricRect(left,top, width, height, fillColor, strokeColor, false)
                this.addFabricArea(area, '', false, 'OmrBubble')
            }
        },
        getAnswerByThreshold(questions, index, areaName){
            if(questions === undefined || questions[index] === undefined){
                return
            }
            let responses = []
            let responsesForced = []
            let labels = store.state.formReadAreas[areaName]['questionLabels']
            let hasError = false
            if(questions[index].length !==  store.state.formReadAreas[areaName].omrQuestions[index].length){
                hasError = true
            }
            for(let option in questions[index]){
                if(questions[index][option].forceAnswer){
                    responsesForced.push(labels[option])
                }
                if(questions[index][option].blackPixelsRatio > store.state.formReadAreas[areaName]['omrThreshold']){
                    responses.push(labels[option])
                }
            }
            if(hasError){
                return 'error'
            }
            if(responsesForced.length > 0){
                return responsesForced.join()
            }
            return responses.join()
        },
        loadFabricAreasToCanvas(){
            this.$globals.canvas.getObjects().forEach((obj) => {
                this.$globals.canvas.remove(obj)
            });
            for(let [_,area] of Object.entries(this.formReadAreas)){
              if(!area.isAnchor){
                  let fabricArea = this.getFabricRect(
                      area.left * this.canvasWidth,
                      area.top * this.canvasHeight,
                      area.width * this.canvasWidth,
                      area.height * this.canvasHeight,
                      area.fill
                  )
                  fabricArea.toObject = (function (toObject) {
                      return function () {
                          return fabric.util.object.extend(toObject.call(this), {
                              name: this.name,
                              type: this.type,
                              isAnchor: this.isAnchor
                          });
                      };
                  })(fabricArea.toObject);
                  fabricArea.name = area.name
                  fabricArea.type = area.type
                  fabricArea.isAnchor = area.isAnchor
                  this.$globals.canvas.add(fabricArea)
              }
            }
        },
        deleteAnchorObjects(){
            if(this.showAnchorsToolbar){
                this.deleteAllAnchorObjects(false)
                this.$store.dispatch('deleteAllAnchors')
                this.$store.commit('mutateProperty', ['anchors', {hasAnchors: false, anchorType: ''}])
            }
        },
        selectArea(result){
            let area = this.$store.state.formReadAreas[result.areaName]
            let [areaCanvas, _] = this.$store.state.forms[result.formId].getAreaCanvas(area)
            return  areaCanvas.toDataURL()
        },
        selectOMRArea(result){
            let firstBubble = this.$store.state.forms[result.formId].omrQuestions[result.areaName][result.questionIndex][0]
            let lastBubble = this.$store.state.forms[result.formId].omrQuestions[result.areaName][result.questionIndex].slice(-1)[0]
            let questionArea = {
                top: firstBubble.top - firstBubble.height/2,
                left: firstBubble.left - firstBubble.width/2,
                width: (lastBubble.left - firstBubble.left) + firstBubble.width*2,
                height: (lastBubble.top - firstBubble.top) + firstBubble.height*2
            }
            let [areaCanvas, _] = this.$store.state.forms[result.formId].getAreaCanvas(questionArea)
            return areaCanvas.toDataURL()
        },
        overrideValue(e, result){
            this.$store.state.forms[result.formId].results[result.areaName] = e.target.value
        },
        overrideOMRValue(e, result){
            let optionIndex = result.options.findIndex((element) => element === e.target.value)
            for(let i in this.$store.state.forms[result.formId].omrQuestions[result.areaName][result.questionIndex]){
                this.$store.state.forms[result.formId].omrQuestions[result.areaName][result.questionIndex][i]['forceAnswer'] = false
            }
            this.$store.state.forms[result.formId].omrQuestions[result.areaName][result.questionIndex][optionIndex]['forceAnswer'] = true
        },
    },

    computed: {
        formName: {
            get: function () {
                return this.$store.state.formName
            },
            set(value){
                this.$store.commit('mutateProperty', ['formName', value])
            }
        },
        formReadAreas: function () {
            return this.$store.state.formReadAreas
        },
        canvasHeight: function () {
            return this.$store.state.canvasHeight
        },
        canvasWidth: function () {
            return this.$store.state.canvasWidth
        },
        anchors: function () {
            return Object.keys(this.formReadAreas).filter(area => area.includes('anchor'))
        },
        showAnchorsToolbar: function () {
            return this.$store.state.anchors.hasAnchors && !this.isFormAnchorProcessed
        },
        forms: function () {
            return this.$store.state.forms
        },
        selectedFormId: function () {
            return this.$store.state.selectedFormId
        },
        selectedFormSrc: function () {
            if(this.$store.state.totalForms === 0){
                return ''
            }
            return this.$store.state.forms[this.selectedFormId].src
        },
        selectedFormAnchors: function () {
            if(this.$store.state.totalForms === 0){
                return ''
            }
            return this.$store.state.forms[this.selectedFormId].anchors
        },
        selectedForm: function () {
            return this.$store.state.forms[this.selectedFormId]
        },
        showLoadingModal: function () {
            return this.$store.state.showLoadingModal
        },
        isFormAnchorProcessed: function () {
            if(this.selectedForm === undefined){
                return false
            }
            return this.selectedForm.isAnchorProcessed
        },
        formsCant: function () {
            return Object.keys(this.$store.state.forms).length
        },
        showResults: function () {
            return this.$store.state.showResults
        },
        omrBubbles: function () {
            if(this.$store.state.totalForms === 0){
                return ''
            }
            let omrBubbles = []
            for(let omrField in this.selectedForm.omrQuestions){
                for(let question of this.selectedForm.omrQuestions[omrField]){
                    for (let option of question){
                        option['areaName'] = omrField
                        omrBubbles.push(option)
                    }
                }
            }
            return omrBubbles
        },
        fabricActiveObject: function () {
            return this.$store.state.fabricActiveObject
        },
        results: function (){
            let results = []
            let areas = {}
            for(let [areaName, area] of Object.entries(this.formReadAreas)){
                if(!area.isAnchor){
                    areas[areaName] = area
                }
            }
            let sortedAreas = Object.keys(areas).map((key) => areas[key])
            sortedAreas = sortedAreas.sort((area1, area2) => {
                return area1.columnPosition > area2.columnPosition ? 1 : -1
            })
            for(let [_, form] of Object.entries(this.forms)){
                let row = {}
                row.file_name = {value: form.id, type: 'id'}
                for(let [_, area] of sortedAreas.entries()){
                    if(area.type === 'OMR'){
                        for(let index in area.omrQuestions){
                            row[area.name + '-' + index] = {
                                value: this.getAnswerByThreshold(form.omrQuestions[area.name], index, area.name),
                                type: 'select',
                                options: store.state.formReadAreas[area.name]['questionLabels'],
                                formId: form.id,
                                questionIndex: index,
                                areaName: area.name
                            }
                        }
                    }else{
                        row[area.name] = {
                            value: form.results[area.name],
                            type: 'text',
                            areaName: area.name,
                            formId: form.id
                        }
                    }
                }
                results.push(row)
            }
            return results
        }
    }
}
