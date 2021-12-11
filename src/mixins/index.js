// define a mixin object

export default {
    methods: {
        updateCanvas() {
            let imgSrc = this.selectedFormSrc;
            fabric.Image.fromURL(imgSrc, img => {
                let height = this.canvasHeight
                let width = img.width * this.canvasHeight / img.height
                this.$store.commit('mutateProperty', ['canvasWidth', width])
                this.$globals.canvas.setDimensions({width: width, height: height});
                let canvas = this.$globals.canvas
                this.$globals.canvas.setBackgroundImage(img, this.$globals.canvas.renderAll.bind(canvas), {
                    scaleX: canvas.width / img.width,
                    scaleY: canvas.height / img.height
                });
            });
        },
        deleteAllObjects(onlyCanvas){
            this.$globals.canvas.getObjects().forEach((obj) => {
                this.$globals.canvas.remove(obj)
                if(!onlyCanvas){
                    this.$store.commit('deleteFormReadArea', obj.name)
                }
            });
        },
        uploadImagesFiles: function (evt, fromCam) {
            let files = evt.target.files;
            let context = this

            for (let file of files) {
                var reader = new FileReader();

                //IIFE to set closure
                reader.onload = (function (theFile, VueContext) {
                    return function (e) {
                        let src = e.target.result
                        VueContext.$store.commit('addForm', [theFile.name, src, fromCam])
                        VueContext.pages--
                    };
                })(file, context);

                reader.readAsDataURL(file);
            }
        }
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
            return this.$store.state.anchors.hasAnchors && !this.$store.state.anchors.areAnchorsRead
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
    }
}
