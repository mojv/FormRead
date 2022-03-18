<template>
  <!--  <script src="https://badge.dimensions.ai/badge.js"></script>-->
  <div @click="setActiveObject" class="bg-gray-50 h-screen" v-show="!activateCam">
    <app-header v-if="formsCant === 0"/>

    <div class="h-body" :class='layoutItemsDisplay'>
      <upload-file @activateCam="setActivateCam"
                   :description='description'
                   :tittle='title'
                   v-if="formsCant === 0"
      />
      <template v-if="formsCant > 0">
        <scrollable-forms-list v-show="layoutItemsDisplay['scrollList']" @activateCam="setActivateCam"
                               @collapse-columns="setGridColumns"/>
        <form-toolbar @collapse-columns="setGridColumns"/>
        <form-editor-area v-show="layoutItemsDisplay['editorArea'] && !showResults"/>
        <results-table v-show="layoutItemsDisplay['editorArea'] && showResults"/>
        <form-options-panel v-show="layoutItemsDisplay['optionPanel']"/>
      </template>
    </div>
  </div>
  <upload-img-web-cam v-if="activateCam" @activateCam="setActivateCam"/>
  <div id="reader" hidden></div>
</template>

<script>
import {defineComponent} from 'vue'

import UploadFile from './components/UploadFile.vue'
import ScrollableFormsList from './components/ScrollableFormsList.vue'
import FormEditorArea from './components/FormEditorArea.vue'
import FormOptionsPanel from './components/FormOptionsPanel.vue'
import AppHeader from "./components/AppHeader.vue"
import FormToolbar from "./components/FormToolbar.vue"
import UploadImgWebCam from "./components/UploadImgWebCam.vue"
import ResultsTable from "./components/ResultsTable.vue"

import helpers from "./mixins"
import {fabric} from "fabric";
// import DialogModal from "@/Jetstream/DialogModal";


export default defineComponent({
  inject: ['$globals'],
  mixins: [helpers],

  components: {
    // DialogModal,
    UploadFile,
    ScrollableFormsList,
    FormEditorArea,
    FormOptionsPanel,
    AppHeader,
    FormToolbar,
    UploadImgWebCam,
    ResultsTable
  },

  props: [
    'user',
    'canLogin',
    'canRegister',
    'vuex_state',
    'savedFormId'
  ],

  data() {
    return {
      activateCam: false,
      layoutItems: {
        formGridDisplay: false,
        scrollList: true,
        editorArea: true,
        optionPanel: true
      },
      title: "FREE OMR, OCR & BCR",
      description: "Multiple sheets OMR (optical mark recognition) OCR (Optical Character Recognition) and BCR (Bar Code Recognition)"
    }
  },

  methods: {
    setActiveObject() {
      this.$store.commit('setFabricActiveObject', this.$globals.canvas)
    },
    setGridColumns(panel) {
      this.layoutItems[panel] = !this.layoutItems[panel]

      // I'm to leasy to refactor this ¯\_(ツ)_/¯
      if (document.body.offsetWidth < 700) {
        if (panel === 'scrollList' && this.layoutItems['optionPanel'] === true) {
          this.layoutItems['optionPanel'] = !this.layoutItems[panel]
        }
        if (panel === 'optionPanel' && this.layoutItems['scrollList'] === true) {
          this.layoutItems['scrollList'] = !this.layoutItems[panel]
        }
        this.layoutItems['editorArea'] = !(this.layoutItems['scrollList'] === true || this.layoutItems['optionPanel'] === true);
      }
    },
    setActivateCam(activateCam) {
      this.activateCam = activateCam
    }
  },

  computed: {
    layoutItemsDisplay: function () {
      this.layoutItems['formGridDisplay'] = this.formsCant > 0
      return this.layoutItems
    },
  },

  mounted() {
    if (document.body.offsetWidth < 700) {
      this.layoutItems['optionPanel'] = false;
      this.layoutItems['editorArea'] = false;
    }
    let opencv = document.createElement('script')
    opencv.setAttribute('src', 'https://docs.opencv.org/4.0.1/opencv.js')
    document.head.appendChild(opencv)

    if(this.vuex_state !== undefined){
      let state = JSON.parse(this.vuex_state)
      for(let [areaName,area] of Object.entries(state.formReadAreas)){
        state.formReadAreas[areaName].fabricArea = new fabric.Rect(area.fabricArea)
      }
      for(let [index,property] of Object.entries(state)){
        this.$store.commit('mutateProperty', [index, property])
      }
      if(state.formReadAreas.length === 0){
        this.$store.commit('mutateProperty', ['formReadAreas', {}])
      }
      this.$store.commit('mutateProperty', ['forms', {}])
      this.$store.commit('mutateProperty', ['savedFormId', this.savedFormId])
    }

    if (this.$page.props.isAPI) {
      this.description = ''
      this.title = ''
    }
  },

})
</script>

<style lang="scss">
.h-body {
  height: 100%;
}

.formGridDisplay {
  display: grid;
  grid-template-areas:
      'FormToolbar FormToolbar FormToolbar'
      'ScrollableFormsList FormEditorArea FormOptionsPanel';
  grid-template-rows: 2.5rem auto;

  &.scrollList.editorArea.optionPanel {
    grid-template-columns: 120px 2fr 1fr;
  }

  &.scrollList.editorArea {
    grid-template-columns: 120px 2fr 0;
  }

  &.editorArea.optionPanel {
    grid-template-columns: 0 3fr 1fr;
  }

  &.editorArea {
    grid-template-columns: 0 1fr 0;
  }

  &.scrollList {
    grid-template-columns: 1fr 0 0;
  }

  &.optionPanel {
    grid-template-columns: 0 0 1fr;
  }
}

#FormToolbar {
  grid-area: FormToolbar;
}

#ScrollableFormsList {
  grid-area: ScrollableFormsList;
}

#FormEditorArea {
  grid-area: FormEditorArea;
}

#ResultsTable {
  grid-area: FormEditorArea;
}

#FormOptionsPanel {
  grid-area: FormOptionsPanel;
}
</style>

