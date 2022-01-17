// define a mixin object

import {fabric} from "fabric";

export default {
    methods: {
        updateCanvas() {
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
            let files = evt.target.files;
            let context = this

            for (let file of files) {
                var reader = new FileReader();

                //IIFE to set closure
                reader.onload = (function (theFile, VueContext) {
                    return function (e) {
                        let src = e.target.result
                        VueContext.$store.commit('addForm', [theFile.name, src, false])
                        VueContext.pages--
                    };
                })(file, context);

                reader.readAsDataURL(file);
            }
        },
        drawAnchorLines: function () {
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
            this.$store.commit('updateFormReadArea', area)
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
    },

    computed: {
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
            return this.$store.state.forms[this.selectedFormId].src
        },
        selectedFormAnchors: function () {
            return this.$store.state.forms[this.selectedFormId].anchors
        },
        selectedForm: function () {
            return this.$store.state.forms[this.selectedFormId]
        },
        showLoadingModal: function () {
            return this.$store.state.showLoadingModal
        },
        isFormAnchorProcessed: function () {
            return this.selectedForm.isAnchorProcessed
        },
        formsCant: function () {
            return Object.keys(this.$store.state.forms).length
        },
        omrBubbles: function () {
            let omrBubbles = []
            for(let omrField in this.selectedForm.omrQuestions){
                for(let question of this.selectedForm.omrQuestions[omrField]){
                    omrBubbles = omrBubbles.concat(question)
                }
            }
            return omrBubbles
        },
    }
}
