<template>
  <!--  <script src="https://badge.dimensions.ai/badge.js"></script>-->
  <div @click="setActiveObject" class="bg-gray-50 h-screen" v-if="!activateCam">
    <app-header  v-if="formsCant === 0" />
    <div class="h-body" v-bind:style="{gridTemplateColumns: formColumns}" :class="{'form-grid-display': formsCant > 0}">
      <upload-file @activateCam="setActivateCam"
          :description='"Multiple sheets OMR (optical mark recognition) OCR (Optical Character Recognition) and BCR (Bar Code Recognition)"'
          :tittle='"FREE OMR, OCR & BCR"'
          v-if="formsCant === 0"
      />
      <template v-if="formsCant > 0">
        <scrollable-forms-list v-if="formColumns.substring(0,3) !== '0px'"/>
        <form-toolbar @form-columns="setGridColumns" />
        <form-editor-area />
        <form-options-panel />
      </template>
    </div>
  </div>
  <CornerDetectionWithVideo v-if="activateCam" @activateCam="setActivateCam"/>
</template>

<script>
import UploadFile from '../components/UploadFile.vue'
import ScrollableFormsList from '../components/ScrollableFormsList.vue'
import FormEditorArea from '../components/FormEditorArea.vue'
import FormOptionsPanel from '../components/FormOptionsPanel.vue'
import AppHeader from "../components/AppHeader.vue"
import FormToolbar from "../components/FormToolbar.vue"
import CornerDetectionWithVideo from "../components/CornerDetectionWithVideo.vue"
import helpers from "../mixins"


export default {
  inject: ['$globals'],
  mixins: [helpers],

  components: {
    UploadFile,
    ScrollableFormsList,
    FormEditorArea,
    FormOptionsPanel,
    AppHeader,
    FormToolbar,
    CornerDetectionWithVideo
  },

  data() {
    return {
      formColumns: '120px 2fr 0px',
      activateCam: false
    }
  },

  methods: {
    setActiveObject() {
      this.$store.commit('setFabricActiveObject', this.$globals.canvas)
    },
    setGridColumns(columns) {
      this.formColumns = columns
    },
    setActivateCam(activateCam){
      this.activateCam= activateCam
    }
  },

  mounted() {
    let recaptchaScript = document.createElement('script')
    recaptchaScript.setAttribute('src', 'https://docs.opencv.org/4.0.1/opencv.js')
    document.head.appendChild(recaptchaScript)
  }

}
</script>

<style lang="scss">
.h-body {
  height: 100%;
}

.form-grid-display {
  display: grid;
  grid-template-areas:
      'ScrollableFormsList FormToolbar FormOptionsPanel'
      'ScrollableFormsList FormEditorArea FormOptionsPanel';
  grid-template-rows: 2.5rem auto;
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

#FormOptionsPanel {
  grid-area: FormOptionsPanel;
}
</style>

