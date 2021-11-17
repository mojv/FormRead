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
}