<template>
  <div class="h-full bg-white shadow" data-rich-editor-target="toolbar">
    <div class="h-full relative z-20 flex justify-center flex-wrap flex-row sm:flex-row items-center	">
      <anchor-icon class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" v-if="anchors.length < 4" v-on:click="addAnchor()" ></anchor-icon>
      <qr-icon     class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" v-on:click="addField('rgb(110,214,36,0.3)','QR')"></qr-icon>
      <ocr-icon    class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" v-on:click="addField('rgb(158,68,226,0.3)','OCR')"></ocr-icon>
      <omr-icon    class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" v-on:click="addField('rgb(33,239,160,0.3)','OMR')"></omr-icon>
      <cut-icon    class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" v-on:click="addField('rgb(255,117,140,0.3)','cuts')"></cut-icon>
    </div>
  </div>
</template>

<script>

import qrIcon from  './Icons/qrIcon.vue'
import ocrIcon from  './Icons/ocrIcon.vue'
import omrIcon from  './Icons/omrIcon.vue'
import cutIcon from  './Icons/cutIcon.vue'
import anchorIcon from  './Icons/anchorIcon.vue'
import {fabric} from "fabric";

export default {
  name: 'FormToolbar',
  inject: ['$globals'],

  components: {qrIcon, ocrIcon, omrIcon, cutIcon, anchorIcon},

  methods: {
    addField(color, type) {
      let area = this.getFabricRect(this.canvasWidth / 2, this.canvasHeight / 2, color)
      let name = `${type}-${Math.random().toString(36).slice(7)}`
      this.addArea(area, name, false)
    },

    addAnchor() {
      let color = 'rgb(0,198,251,0.3)'
      let positions = [
        [50, 50],
        [this.canvasWidth - 100, 50],
        [50, this.canvasHeight - 100],
        [this.canvasWidth - 100, this.canvasHeight - 100]
      ]
      for (let i in positions) {
        if (this.anchors.filter(anchor => anchor.name === 'anchor-' + i).length === 0) {
          let area = this.getFabricRect(positions[i][0], positions[i][1], color)
          let name = 'anchor-' + i
          this.addArea(area, name, true)
        }
      }
    },

    addArea(area, name, isAnchor) {
      area.toObject = (function (toObject) {
        return function () {
          return fabric.util.object.extend(toObject.call(this), {
            name: this.name,
            isAnchor: this.isAnchor
          });
        };
      })(area.toObject);
      area.name = name;
      area.isAnchor = isAnchor;
      this.$globals.canvas.add(area);
      this.$store.commit('updateFormReadArea', area)
      this.$globals.canvas.setActiveObject(area)
      this.$globals.canvas.requestRenderAll()
    },

    getFabricRect(left, top, color) {
      return new fabric.Rect({
        width: 50,
        height: 50,
        left: left,
        top: top,
        fill: color,
        borderColor: 'red',
        cornerColor: 'green',
        cornerSize: 6,
        transparentCorners: false
      })
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
    }
  },

}
</script>