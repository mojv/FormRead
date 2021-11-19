<template>
  <div @click="setActiveObject" class="w-full overflow-y-auto py-1 overflow-y-auto h-full pr-6" id='FormEditorArea'
       @keydown.delete="deleteObjects()" tabindex="0">
    <canvas class="shadow-lg rounded-lg" id="formCanvas"></canvas>
  </div>
</template>

<script>
import {fabric} from "fabric";
import helpers from "../helpers"

export default {
  name: 'FormEditorArea',
  inject: ['$globals'],

  data: function () {
    return {
      renderForce: 0
    }
  },

  methods: {
    deleteObjects() {
      this.$globals.canvas.getActiveObjects().forEach((obj) => {
        this.$globals.canvas.remove(obj)
        this.$store.commit('deleteFormReadArea', obj.name)
      });
      this.$globals.canvas.discardActiveObject().renderAll()

    },
    makeLine(coords) {
     return new fabric.Line(coords, {
       fill: 'red',
       stroke: 'red',
       strokeWidth: 2,
       selectable: false,
       evented: false,
     });
    }
  },

  computed: {
    forms: function () {
      return this.$store.state.forms
    },
    selectedFormId: function () {
      return this.$store.state.selectedFormId
    },
    selectedFormSrc: function () {
      return this.$store.state.forms[this.selectedFormId].src
    },
    selectedFormAnchorsCount: function () {
      return Object.keys(this.$store.state.forms[this.selectedFormId].anchors).length
    },
    selectedFormAnchors: function () {
      return this.$store.state.forms[this.selectedFormId].anchors
    },
    formReadAreas: function () {
      return this.$store.state.formReadAreas
    },
    canvasHeight: function () {
      return this.$store.state.canvasHeight
    },
    canvasWidth: function () {
      return this.$store.state.canvasWidth
    }
  },

  watch: {
    selectedFormId: function () {
      helpers.updateCanvas.call(this)
    },
    selectedFormSrc: function () {
      helpers.updateCanvas.call(this)
    },
    'selectedFormAnchors': {
      handler: function () {
        this.$globals.canvas.getObjects().forEach((obj) => {
          if(obj.get('type') === 'line'){
            this.$globals.canvas.remove(obj)
          }
        });
        if (this.selectedFormAnchorsCount === 4) {
          let line1 = this.makeLine([this.selectedFormAnchors['anchor-0'][0]*this.canvasWidth, this.selectedFormAnchors['anchor-0'][1]*this.canvasHeight, this.selectedFormAnchors['anchor-1'][0]*this.canvasWidth, this.selectedFormAnchors['anchor-1'][1]*this.canvasHeight])
          let line2 = this.makeLine([this.selectedFormAnchors['anchor-1'][0]*this.canvasWidth, this.selectedFormAnchors['anchor-1'][1]*this.canvasHeight, this.selectedFormAnchors['anchor-3'][0]*this.canvasWidth, this.selectedFormAnchors['anchor-3'][1]*this.canvasHeight])
          let line3 = this.makeLine([this.selectedFormAnchors['anchor-3'][0]*this.canvasWidth, this.selectedFormAnchors['anchor-3'][1]*this.canvasHeight, this.selectedFormAnchors['anchor-2'][0]*this.canvasWidth, this.selectedFormAnchors['anchor-2'][1]*this.canvasHeight])
          let line4 = this.makeLine([this.selectedFormAnchors['anchor-2'][0]*this.canvasWidth, this.selectedFormAnchors['anchor-2'][1]*this.canvasHeight, this.selectedFormAnchors['anchor-0'][0]*this.canvasWidth, this.selectedFormAnchors['anchor-0'][1]*this.canvasHeight])
          this.$globals.canvas.add(line1, line2, line3, line4);
        }
      },
      deep: true
    },
  },

  mounted() {
    fabric.Object.prototype.set({
      transparentCorners: true,
    });
    delete fabric.Object.prototype.controls.mtr
    this.$globals.canvas = new fabric.Canvas('formCanvas')
    this.$globals.canvas.uniformScaling = false
    helpers.updateCanvas.call(this)
    this.$store.commit('setCanvasHeight', document.getElementById('FormEditorArea').offsetHeight)
    this.$globals.canvas.on("object:modified", () => {
      this.$globals.canvas.getActiveObjects().forEach((area) => {
        this.$store.commit('updateFormReadArea', area)
      });
    });
  }
}
</script>

<style>
.canvas-container, .upper-canvas, #formCanvas {
  margin: auto;
}

</style>