<template>
  <div class="h-full bg-white shadow flex flex-row" data-rich-editor-target="toolbar" id="FormToolbar">
    <div class="h-full relative z-20 flex justify-center flex-wrap flex-row sm:flex-row items-center">
      <menu-icon v-on:click="collapsePanel()" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
    </div>
    <div class="w-5/6 h-full relative z-20 flex justify-center flex-wrap flex-row sm:flex-row items-center">
      <anchor-icon v-if="!showAnchorsToolbar" v-on:click="addAnchor()" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
      <read-anchor-icon v-if="$store.getters.selectedFormAnchorsCount === 4 && showAnchorsToolbar" v-on:click="processAnchors" />
      <anchor-icon v-if="!showAnchorsToolbar" v-on:click="detectCorners" />
      <cancelIcon v-if="showAnchorsToolbar" v-on:click="deleteObjects" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
      <qr-icon v-if="!showAnchorsToolbar" v-on:click="addField('rgb(110,214,36,0.3)','QR')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
      <ocr-icon v-if="!showAnchorsToolbar" v-on:click="addField('rgb(158,68,226,0.3)','OCR')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
      <omr-icon v-if="!showAnchorsToolbar" v-on:click="addField('rgb(33,239,160,0.3)','OMR')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
      <cut-icon v-if="!showAnchorsToolbar" v-on:click="addField('rgb(255,117,140,0.3)','cuts')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
    </div>
  </div>
</template>

<script>

import qrIcon from  './Icons/qrIcon.vue'
import ocrIcon from  './Icons/ocrIcon.vue'
import omrIcon from  './Icons/omrIcon.vue'
import cutIcon from  './Icons/cutIcon.vue'
import anchorIcon from  './Icons/anchorIcon.vue'
import readAnchorIcon from './Icons/readAnchorIcon.vue'
import cancelIcon from './Icons/canelIcon.vue'
import menuIcon from './Icons/MenuIcon.vue'
import {fabric} from "fabric";
import helpers from "../mixins"

export default {
  name: 'FormToolbar',
  inject: ['$globals'],
  mixins: [helpers],
  components: {qrIcon, ocrIcon, omrIcon, cutIcon, anchorIcon, cancelIcon, readAnchorIcon, menuIcon},

  data: function () {
    return {
      isPanelCollapsed: false,
    }
  },

  methods: {
    addField(color, type) {
      let area = this.getFabricRect(this.canvasWidth / 2, this.canvasHeight / 2, color)
      let name = `${type}-${Math.random().toString(36).slice(7)}`
      this.addArea(area, name, false)
    },

    addAnchor() {
      if(this.isFormAnchorProcessed){
        this.$store.commit('updateFormProp', [this.selectedFormId, 'isAnchorProcessed', false])
        this.selectedForm.updateFormSrc(this.selectedForm.src_original)
        return
      }
      this.$store.commit('mutateProperty', ['anchors', {hasAnchors: true, anchorType: 'object'}])
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
    },

    deleteObjects(){
      this.deleteAllObjects(false)
      this.$store.dispatch('deleteAllAnchors')
      this.$store.commit('mutateProperty', ['anchors', {hasAnchors: false, anchorType: ''}])
    },

    processAnchors(){
      this.$store.dispatch('processAllFormAnchors')
      this.deleteAllObjects(true)
    },

    collapsePanel(){
      let collapsePanel = this.isPanelCollapsed ? '120px 1fr 0px' : '0px 1fr 0px'
      this.$emit('form-columns',  collapsePanel)
      this.isPanelCollapsed = !this.isPanelCollapsed
    },

    detectCorners(){
      if(this.isFormAnchorProcessed){
        this.$store.commit('updateFormProp', [this.selectedFormId, 'isAnchorProcessed', false])
        this.selectedForm.updateFormSrc(this.selectedForm.src_original)
        return
      }
      this.$store.commit('mutateProperty', ['anchors', {hasAnchors: true, anchorType: 'corners'}])
      this.selectedForm.detectSheetCorners()
    }

  },

}
</script>