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
import {store} from "../store";

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
    makeCornerControl(left, top, line1, line2, name) {
      var cornerControl = new fabric.Circle({
        left: left-12,
        top: top-12,
        strokeWidth: 5,
        radius: 12,
        fill: '#fff',
        stroke: '#666'
      });
      cornerControl.toObject = (function (toObject) {
        return function () {
          return fabric.util.object.extend(toObject.call(this), {
            name: this.name,
            isCornerControl: this.isAnchor
          });
        };
      })(cornerControl.toObject);
      cornerControl.name = name;
      cornerControl.isCornerControl = true
      cornerControl.hasControls = cornerControl.hasBorders = false
      cornerControl.line1 = line1
      cornerControl.line2 = line2
      return cornerControl
    }
  },

  watch: {
    selectedFormId: function () {
      this.updateCanvas()
    },
    selectedFormSrc: function () {
      this.updateCanvas()
    },
    'selectedFormAnchors': {
      handler: function () {this.drawAnchorLines()},
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
        if(area.isAnchor){
          this.selectedForm.findAnchors(area.name)
        }
        if(area.isCornerControl){
          let left = (area.left+12) / this.canvasWidth
          let top =  (area.top+12) / this.canvasHeight
          this.selectedForm.anchors[area.name] = [left , top]
          store.commit('updateFormProp', [this.selectedFormId, 'anchors',  this.selectedForm.anchors])
        }
      });
    });
    this.$globals.canvas.on('object:moving', (e) => {
      let p = e.target;
      if(p.name === 'anchor-2' || p.name === 'anchor-3'){
        p.line1 && p.line1.set({ 'x2': p.left+12, 'y2': p.top+12 });
        p.line2 && p.line2.set({ 'x1': p.left+12, 'y1': p.top+12 });
      }else{
        p.line1 && p.line1.set({ 'x1': p.left+12, 'y1': p.top+12 });
        p.line2 && p.line2.set({ 'x2': p.left+12, 'y2': p.top+12 });
      }
      this.$globals.canvas.renderAll();
    })
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