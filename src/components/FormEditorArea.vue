<template>
  <div @click="setActiveObject" class="w-full overflow-y-auto py-2 overflow-y-auto h-full pr-6 bg-gray-200 flex justify-center items-center"
       id='FormEditorArea'
       @keydown.delete="deleteObjects()" tabindex="0">
    <canvas class="shadow-lg rounded-lg" id="formCanvas"></canvas>
  </div>
  <loading-modal
      v-if="
        $store.getters.countImageSrc < $store.state.totalForms ||
        showLoadingModal
      "
  />
  <anchor-zoom-window v-if="anchorZoomShow" :src="anchorZoomSrc"/>
</template>

<script>
import {fabric} from "fabric";
import loadingModal from "./loadingModal.vue";
import helpers from "../mixins"
import AnchorZoomWindow from "../components/AnchorZoomWindow.vue"
import {store} from "../store";

export default {
  name: 'FormEditorArea',
  inject: ['$globals'],
  components: {loadingModal, AnchorZoomWindow},
  inheritAttrs: false,
  mixins: [helpers],

  data: function () {
    return {
      cornerControlRadius: 10,
      anchorZoomSrc: '',
      anchorZoomShow: false,
    }
  },

  methods: {
    deleteObjects() {
      this.$globals.canvas.getActiveObjects().forEach((obj) => {
        if (obj.isAnchor) {
          this.deleteAllAnchorObjects(false)
          this.$store.dispatch('deleteAllAnchors')
        } else {
          this.$globals.canvas.remove(obj)
          this.$store.commit('deleteFormReadArea', obj.name)
          if (obj.type === 'OMR') {
            this.$store.dispatch('deleteOmrQuestionFromAllForms', obj.name)
          }
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
        left: left - this.cornerControlRadius,
        top: top - this.cornerControlRadius,
        strokeWidth: 1,
        radius: this.cornerControlRadius,
        fill: 'gray',
        stroke: 'red'
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
      cornerControl.hasControls = false
      cornerControl.hasBorders = false
      cornerControl.line1 = line1
      cornerControl.line2 = line2
      return cornerControl
    },
    updateOmrBubbles(recalculate){
      this.$globals.canvas.getObjects().forEach((obj) => {
        if (obj.type === 'OmrBubble') {
          this.$globals.canvas.remove(obj)
        }
        if (obj.type === 'OMR' && recalculate) {
          let orientation = store.state.formReadAreas[obj.name]['omrOrientation']
          this.selectedForm.omrRead(obj.name, !recalculate, orientation)
        }
      });
      for (let bubble of this.omrBubbles){
        let left = bubble.left * this.canvasWidth
        let top = bubble.top * this.canvasHeight
        let width = bubble.width * this.canvasWidth
        let height = bubble.height * this.canvasHeight
        let fillColor = 'rgb(0, 0, 0, 0)'
        let strokeColor = 'red'
        if(bubble.blackPixelsRatio > 0.4){
          fillColor = 'rgb(0, 200, 0, 0.3)'
          strokeColor =  'green'
        }
        let area = this.getFabricRect(left,top, width, height, fillColor, strokeColor, false)
        this.addFabricArea(area, '', false, 'OmrBubble')
      }
    }
  },

  watch: {
    selectedFormId: function () {
      this.updateCanvas()
      this.updateOmrBubbles(true)
    },
    selectedFormSrc: function () {
      this.updateCanvas()
    },
    'selectedFormAnchors': {
      handler: function () {
        this.drawAnchorLines()
      },
      deep: true
    },
    omrBubbles: function (){
      this.updateOmrBubbles(false)
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
    this.$globals.canvas.on("object:modified", () => {
      this.anchorZoomShow = false
      this.$globals.canvas.getActiveObjects().forEach((area) => {
        this.$store.commit('updateFormReadArea', area)
        if (area.isAnchor) {
          this.selectedForm.findAnchors(area.name)
        }
        if (area.type === 'OMR') {
          this.$store.dispatch('deleteOmrQuestionFromAllForms', area.name)
          let orientation = store.state.formReadAreas[area.name]['omrOrientation']
          this.selectedForm.omrRead(area.name, true,  orientation)
        }
        if (area.isCornerControl) {
          let left = (area.left + this.cornerControlRadius) / this.canvasWidth
          let top = (area.top + this.cornerControlRadius) / this.canvasHeight
          this.selectedForm.anchors[area.name] = [left, top]
          this.$store.commit('updateFormProp', [this.selectedFormId, 'anchors', this.selectedForm.anchors])
        }
      });
    });
    this.$globals.canvas.on('object:moving', (e) => {
      let p = e.target;
      if (p.isCornerControl) {
        this.anchorZoomShow = true
        let left = p.left + this.cornerControlRadius
        let top = p.top + this.cornerControlRadius
        this.anchorZoomSrc = this.selectedForm.getAnchorZoomSrc(left / this.canvasWidth, top / this.canvasHeight)
        if (p.name === 'anchor-2' || p.name === 'anchor-3') {
          p.line1 && p.line1.set({'x2': left, 'y2': top});
          p.line2 && p.line2.set({'x1': left, 'y1': top});
        } else {
          p.line1 && p.line1.set({'x1': left, 'y1': top});
          p.line2 && p.line2.set({'x2': left, 'y2': top});
        }
      }
      this.$globals.canvas.renderAll();
    })
  }
}
</script>

<style>
.canvas-container, .upper-canvas, #formCanvas {
  margin: auto;
}

.enableScroll{
  pointer-events: none;
  touch-action: manipulation !important;
}

</style>