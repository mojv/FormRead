<template>
  <div class="h-full bg-white shadow flex flex-row" data-rich-editor-target="toolbar" id="FormToolbar">
    <div class="h-full relative flex justify-center flex-wrap flex-row sm:flex-row items-center">
      <menu-icon :orientation="'left'" @click="$emit('collapse-columns', 'scrollList')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
    </div>
    <div v-if="!isMoveActivated"  class="w-full h-full relative z-20 flex justify-center flex-wrap flex-row sm:flex-row items-center">
      <template v-if="!showResults">
        <save-icon @click="saveForm" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
        <div class="dropdown" v-if="!showAnchorsToolbar" >
          <anchor-icon @click="" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
          <ul class="dropdown-menu absolute hidden text-gray-700 pt-1">
            <li @click="addAnchor"><a class="rounded-t bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap" href="#">Object</a></li>
            <li @click="detectCorners" class=""><a class="bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap" href="#">Corners</a></li>
          </ul>
        </div>
        <read-anchor-icon v-if="$store.getters.selectedFormAnchorsCount === 4 && showAnchorsToolbar" v-on:click="processAnchors" />
        <cancelIcon v-if="showAnchorsToolbar" @click="deleteAnchorObjects" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
        <qr-icon v-if="!showAnchorsToolbar" @click="addField('rgb(110,214,36,0.3)','BCR')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
        <ocr-icon v-if="!showAnchorsToolbar" @click="addField('rgb(158,68,226,0.3)','OCR')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
        <omr-icon v-if="!showAnchorsToolbar" @click="addOmr('rgb(33,239,160,0.3)','OMR')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
<!--        <cut-icon v-if="!showAnchorsToolbar" @click="addField('rgb(255,117,140,0.3)','cuts')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />-->
        <move-icon @click="enableScroll" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer  block sm:hidden" />
        <table-icon @click="showResultsTable" />
      </template>
      <template v-if="showResults">
        <form-icon @click="showResultsTable" />
        <play-icon @click="processAllForms" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
        <check-icon @click="showQA = !showQA" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
        <download-icon @click="exportData" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
      </template>
    </div>
    <div v-if="isMoveActivated" class="w-full h-full relative z-20 flex justify-center flex-wrap flex-row sm:flex-row items-center">
      <move-icon @click="disableScroll" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
    </div>
    <div class="h-full relative z-20 flex justify-center flex-wrap flex-row sm:flex-row items-center">
      <menu-icon :orientation="'right'" @click="$emit('collapse-columns', 'optionPanel')" class="mx-1 fill-current text-black hover:text-gray-500 cursor-pointer" />
    </div>
      <QAModal v-if="showQA" :show="showQA" @close="() => showQA = false"></QAModal>
  </div>
</template>

<script>

import qrIcon from './Icons/qrIcon.vue'
import ocrIcon from './Icons/ocrIcon.vue'
import omrIcon from './Icons/omrIcon.vue'
import cutIcon from './Icons/cutIcon.vue'
import anchorIcon from './Icons/anchorIcon.vue'
import readAnchorIcon from './Icons/readAnchorIcon.vue'
import cancelIcon from './Icons/canelIcon.vue'
import menuIcon from './Icons/MenuIcon.vue'
import MoveIcon from './Icons/MoveIcon.vue'
import TableIcon from './Icons/TableIcon.vue'
import PlayIcon from './Icons/PlayIcon.vue'
import DownloadIcon from './Icons/DownloadIcon.vue'
import FormIcon from './Icons/FormIcon.vue'
import CheckIcon from './Icons/CheckIcon.vue'
import SaveIcon from './Icons/SaveIcon.vue'
import QAModal from "./QAModal.vue";
// import { useForm } from '@inertiajs/inertia-vue3'

import helpers from "../mixins"
import {utils, writeFile} from "xlsx";

export default {
  name: 'FormToolbar',
  inject: ['$globals'],
  mixins: [helpers],
  components: {TableIcon, qrIcon, ocrIcon, omrIcon, cutIcon, anchorIcon, cancelIcon, readAnchorIcon, menuIcon, MoveIcon, PlayIcon, DownloadIcon, FormIcon, CheckIcon, SaveIcon, QAModal},

  data: function () {
    return {
      isPanelCollapsed: false,
      isMoveActivated: false,
      nameCounter: 0,
      showQA: false
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
      this.$store.commit('mutateProperty', ['showLoadingModal', true])
      setTimeout(async ()=>{
          for (let form in this.forms){
              await this.forms[form].formRead()
          }
          this.$store.commit('mutateProperty', ['showLoadingModal', false])
      },0);
    },

    exportableResults(){
        let exportableResults = []
        for (let [_,row] of this.results.entries()){
            let exportableRow = {}
            for(let [columnName, value] of Object.entries(row)){
                exportableRow[columnName] = value.value
            }
            exportableResults.push(exportableRow)
        }
        return exportableResults
    },

    exportData(){
      if (this.$page.props.isAPI) {
          window.parent.postMessage(
              {
                  method: "getResults",
                  results: JSON.stringify(this.exportableResults())
              }, "*"
          );
          return
      }
      let filename = 'results.xlsx';
      let ws = utils.json_to_sheet(this.exportableResults());
      let wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "results");
      writeFile(wb,filename)
    },

    async saveForm(){
        let canvas = document.querySelector("#formCanvas")
        var image = new Image();
        image.src = canvas.toDataURL()
        await image.decode();
        let thumbnailCanvas = document.createElement('canvas')
        let ctx = thumbnailCanvas.getContext('2d');
        thumbnailCanvas.width = 90;
        thumbnailCanvas.height = image.height * (90/image.width);
        ctx.drawImage(image, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        let thumbnail = thumbnailCanvas.toDataURL()
        let state = { ...this.$store.state }
        state.forms = {}
        state.totalForms = 0
        state.showResults = false
        state.selectedFormId = ''
        // const form = useForm({'state': state, 'thumbnail': thumbnail})

        let formData = JSON.stringify(
            {
                vuex_state: state,
                thumbnail: thumbnail,
                form_name: this.$store.state.formName,
            }
        )

        if(this.$page.props.isAPI){
            let schema = {...this.results[0]}
            schema.file_name.type = 'text'
            Object.keys(schema).map((key, index) => {
                delete schema[key].areaName; delete schema[key].formId; delete schema[key].value
            });

            formData = btoa(formData)
            window.parent.postMessage(
                {
                    method: "editForm",
                    formData: formData,
                    schema: JSON.stringify(schema)
                },
                "*"
            );
        }else{
            formData = {'form': formData}
            const form = useForm(formData)
            if(state.savedFormId !== ""){
                form.put('/forms/' + state.savedFormId)
            }else{
                form.post('/forms')
            }
        }
    }
  },

  mounted() {
      this.nameCounter = Object.keys(this.formReadAreas).length
  }
}
</script>

<style scoped>
.dropdown:hover .dropdown-menu {
  display: block;
}

</style>
