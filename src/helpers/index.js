import {store} from '../store'


export default{
    updateCanvas(){
        let imgSrc = store.state.forms[store.state.selectedFormId].src;
        fabric.Image.fromURL(imgSrc, img => {
          let height = store.state.canvasHeight
          let width = img.width*store.state.canvasHeight/img.height
          store.commit('setCanvasWidth', width) 
          this.gobalsProperties.canvas.setDimensions({width:width, height:height});
          let canvas = this.gobalsProperties.canvas
          this.gobalsProperties.canvas.setBackgroundImage(img, this.gobalsProperties.canvas.renderAll.bind(canvas), {
              scaleX: canvas.width / img.width,
              scaleY: canvas.height / img.height
          });
        });
    },
        
    updateFormReadAreas(){
      store.commit('updateFormReadAreas', this.gobalsProperties.canvas.toObject().objects)  
    },
}