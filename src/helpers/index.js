import {store} from '../store'


export default {
    updateCanvas() {
        let imgSrc = store.state.forms[store.state.selectedFormId].src;
        fabric.Image.fromURL(imgSrc, img => {
            let height = store.state.canvasHeight
            let width = img.width * store.state.canvasHeight / img.height
            store.commit('setCanvasWidth', width)
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
}