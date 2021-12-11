<template>
  <div @click="setActiveObject" class="w-full overflow-y-auto py-2 overflow-y-auto h-full pr-6 bg-gray-200" id='FormEditorArea'
       @keydown.delete="deleteObjects()" tabindex="0">
    <canvas class="shadow-lg rounded-lg" id="formCanvas"></canvas>
  </div>
  <loading-modal
      v-if="
        $store.getters.countImageSrc < $store.state.totalForms ||
        showLoadingModal
      "
  ></loading-modal>
</template>

<script>
import {fabric} from "fabric";
import loadingModal from "./loadingModal.vue";
import helpers from "../mixins"

export default {
  name: 'FormEditorArea',
  inject: ['$globals'],
  components: {loadingModal},
  inheritAttrs: false,
  mixins: [helpers],


  methods: {
    deleteObjects() {
      this.$globals.canvas.getActiveObjects().forEach((obj) => {
        if(obj.isAnchor){
          this.deleteAllObjects()
          this.$store.dispatch('deleteAllAnchors')
        }else{
          this.$globals.canvas.remove(obj)
          this.$store.commit('deleteFormReadArea', obj.name)
        }
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
    },
  },

  watch: {
    selectedFormId: function () {
      this.updateCanvas()
    },
    selectedFormSrc: function () {
      this.updateCanvas()
    },
    'selectedFormAnchors': {
      handler: function () {
        if(this.selectedForm.isAnchorProcessed){
          return
        }
        this.$globals.canvas.getObjects().forEach((obj) => {
          if(obj.get('type') === 'line'){
            this.$globals.canvas.remove(obj)
          }
        });
        if (this.$store.getters.selectedFormAnchorsCount === 4) {
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
    this.updateCanvas()
    this.$store.commit('mutateProperty', ['canvasHeight', document.getElementById('FormEditorArea').offsetHeight])
    this.$globals.canvas.on("object:modified", () => {
      this.$globals.canvas.getActiveObjects().forEach((area) => {
        this.$store.commit('updateFormReadArea', area)
      });
    });
  }
}
</script>

<style >
.canvas-container, .upper-canvas, #formCanvas {
  margin: auto;
}
/* width */
::-webkit-scrollbar {
  width: 16px;
  height: 16px;
}

/* Track */
::-webkit-scrollbar-track {
  border-radius: 100vh;
  background: #edf2f7;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 100vh;
  border: 3px solid #edf2f7;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>