<template>
  <div class="h-full bg-white shadow flex flex-row" data-rich-editor-target="toolbar" id="FormToolbar">
    <div class="h-full relative z-20 flex justify-center flex-wrap flex-row sm:flex-row items-center">
      <menu-icon :orientation="'left'" @click="$emit('collapse-columns', 'scrollList')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
    </div>
    <div v-if="!isMoveActivated"  class="w-full h-full relative z-20 flex justify-center flex-wrap flex-row sm:flex-row items-center">
      <div class="dropdown" v-if="!showAnchorsToolbar" >
        <anchor-icon @click="" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
        <ul class="dropdown-menu absolute hidden text-gray-700 pt-1">
          <li @click="addAnchor"><a class="rounded-t bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap" href="#">Object</a></li>
          <li @click="detectCorners" class=""><a class="bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap" href="#">Corners</a></li>
        </ul>
      </div>
      <read-anchor-icon v-if="$store.getters.selectedFormAnchorsCount === 4 && showAnchorsToolbar" v-on:click="processAnchors" />
      <cancelIcon v-if="showAnchorsToolbar" @click="deleteObjects" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
      <qr-icon v-if="!showAnchorsToolbar" @click="addField('rgb(110,214,36,0.3)','BCR')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
      <ocr-icon v-if="!showAnchorsToolbar" @click="addField('rgb(158,68,226,0.3)','OCR')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
      <omr-icon v-if="!showAnchorsToolbar" @click="addOmr('rgb(33,239,160,0.3)','OMR')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
      <cut-icon v-if="!showAnchorsToolbar" @click="addField('rgb(255,117,140,0.3)','cuts')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
      <move-icon @click="enableScroll" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
      <table-icon @click="$emit('show-results', '')" />
      <play-icon @click="processAllForms" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
    </div>
    <div v-if="isMoveActivated" class="w-full h-full relative z-20 flex justify-center flex-wrap flex-row sm:flex-row items-center">
      <move-icon @click="disableScroll" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
    </div>
    <div class="h-full relative z-20 flex justify-center flex-wrap flex-row sm:flex-row items-center">
      <menu-icon :orientation="'right'" @click="$emit('collapse-columns', 'optionPanel')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
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
import MoveIcon from './Icons/MoveIcon.vue'
import TableIcon from './Icons/TableIcon.vue'
import PlayIcon from './Icons/PlayIcon.vue'

import {fabric} from "fabric";
import helpers from "../mixins"

export default {
  name: 'FormToolbar',
  inject: ['$globals'],
  mixins: [helpers],
  components: {TableIcon, qrIcon, ocrIcon, omrIcon, cutIcon, anchorIcon, cancelIcon, readAnchorIcon, menuIcon, MoveIcon, PlayIcon},

  data: function () {
    return {
      isPanelCollapsed: false,
      isMoveActivated: false,
      nameCounter: 0
    }
  },

  methods: {
    addField(fillColor, type) {
      let area = this.getFabricRect(this.canvasWidth / 2, this.canvasHeight / 2, 50, 50, fillColor)
      let name = `${type}-${this.nameCounter}`
      this.nameCounter++
      this.addFabricArea(area, name, false, type)
      return name
    },

    addAnchor() {
      if(this.isFormAnchorProcessed){
        this.$store.commit('updateFormProp', [this.selectedFormId, 'isAnchorProcessed', false])
        this.selectedForm.updateFormSrc(this.selectedForm.src_original, true)
        return
      }
      this.$store.commit('mutateProperty', ['anchors', {hasAnchors: true, anchorType: 'object'}])
      let fillColor = 'rgb(0,198,251,0.3)'
      let positions = [
        [50, 50],
        [this.canvasWidth - 100, 50],
        [50, this.canvasHeight - 100],
        [this.canvasWidth - 100, this.canvasHeight - 100]
      ]
      for (let i in positions) {
        if (this.anchors.filter(anchor => anchor.name === 'anchor-' + i).length === 0) {
          let area = this.getFabricRect(positions[i][0], positions[i][1], 50, 50, fillColor)
          let name = 'anchor-' + i
          this.addFabricArea(area, name, true, 'anchor')
          this.selectedForm.findAnchors(name)
        }
      }
    },

    addOmr(){
      let areaName = this.addField('rgb(33,239,160,0.3)','OMR')
      this.selectedForm.omrRead(areaName, true, 'horizontal')
    },

    deleteObjects(){
      this.deleteAllAnchorObjects(false)
      this.$store.dispatch('deleteAllAnchors')
      this.$store.commit('mutateProperty', ['anchors', {hasAnchors: false, anchorType: ''}])
    },

    processAnchors(){
      this.$store.dispatch('processAllFormAnchors')
      this.deleteAllAnchorObjects(true)
    },

    detectCorners(){
      if(this.isFormAnchorProcessed){
        this.$store.commit('updateFormProp', [this.selectedFormId, 'isAnchorProcessed', false])
        this.selectedForm.updateFormSrc(this.selectedForm.src_original, true)
        return
      }
      this.$store.commit('mutateProperty', ['anchors', {hasAnchors: true, anchorType: 'corners'}])
      this.selectedForm.detectSheetCorners()
    },

    disableScroll(){
      this.isMoveActivated = false
      document.getElementsByClassName("upper-canvas")[0].classList.remove("enableScroll");
      document.getElementsByClassName("lower-canvas")[0].classList.remove("enableScroll");
    },
    enableScroll(){
      this.isMoveActivated = true
      document.getElementsByClassName("upper-canvas")[0].classList.add("enableScroll");
      document.getElementsByClassName("lower-canvas")[0].classList.add("enableScroll");
    },
    processAllForms(){
      for (let form in this.forms){
        this.forms[form].formRead()
      }
    }

  },

}
</script>

<style scoped>
.dropdown:hover .dropdown-menu {
  display: block;
}

</style>