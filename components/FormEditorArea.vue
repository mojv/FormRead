<template>
  <div class="form-area-grid-display">
    <div class="w-full py-1 overflow-y-auto h-full pr-6" id='FormEditorArea' @keydown.delete="deleteObjects()" tabindex="0">                
      <canvas class="shadow-lg rounded-lg" id="formCanvas"></canvas>       
    </div>    
    <form-options-panel @addArea="addArea($event)" @selectArea="selectArea($event)" />
  </div>
</template>

<script>
import { fabric } from "fabric";
import FormOptionsPanel from "./FormOptionsPanel.vue"

const canvas = new fabric.Canvas('formCanvas')

export default {  
  name: 'FormEditorArea',
  components: {FormOptionsPanel},

  data: function () {
    return {
      canvas: null,
      renderForce: 0 
    }
  },

  methods: {    
    updateCanvas(){
      let imgSrc = this.forms[this.selectedFormId].src;
      fabric.Image.fromURL(imgSrc, img => {
        let height = this.canvasHeight
        let width = img.width*this.canvasHeight/img.height
        this.$store.commit('setCanvasWidth', width) 
        this.canvas.setDimensions({width:width, height:height});
        let canvas = this.canvas
        this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / img.width,
            scaleY: canvas.height / img.height
        });
      });
    },

    addArea([area, name]){ 
      area.toObject = (function(toObject) {
        return function() {
          return fabric.util.object.extend(toObject.call(this), {
            name: this.name
          });
        };
      })(area.toObject);
      area.name = name;
      this.canvas.add(area);
      this.updateFormReadAreas()
      this.canvas.setActiveObject(area)
      this.canvas.requestRenderAll()
    },

    deleteObjects(e){
      console.log('asdf')
      this.canvas.getActiveObjects().forEach((obj) => {
        this.canvas.remove(obj)
       });
      this.canvas.discardActiveObject().renderAll()
      this.updateFormReadAreas()
    },

    updateFormReadAreas(){
      this.$store.commit('updateFormReadAreas', this.canvas.toObject().objects)  
    },

    selectArea(index){
      this.canvas.setActiveObject(this.canvas.item(index))
      this.canvas.requestRenderAll()
    }
  },

  computed: {
    forms: function () {
      return this.$store.state.forms
    },
    selectedFormId: function () {
      return this.$store.state.selectedFormId
    },
    formReadAreas: function() {
      return this.$store.state.formReadAreas
    },
    canvasHeight: function() {
      return this.$store.state.canvasHeight
    }
  },

  watch: {
    selectedFormId: function (newId, oldId) {
      this.updateCanvas()
    }
  },

  mounted() { 
    fabric.Object.prototype.set({
        transparentCorners: false,
    }); 
    delete fabric.Object.prototype.controls.mtr 
    this.canvas = new fabric.Canvas('formCanvas');
    this.updateCanvas()
    this.$store.commit('setCanvasHeight', document.getElementById('FormEditorArea').offsetHeight)
    this.canvas.on("object:modified", () => {        
        this.updateFormReadAreas()
    });
  }
}
</script>

<style scope>
.canvas-container, .upper-canvas, #formCanvas{
  margin: auto;
}

.form-area-grid-display{
  display: grid;
  grid-template-columns: 70% 30%;
}
</style>