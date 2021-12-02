<template>
  <!--  <script src="https://badge.dimensions.ai/badge.js"></script>-->
  <div @click="setActiveObject" class="bg-gray-50 h-screen" >
    <app-header  v-if="formsCant === 0" />
    <div class="h-body" :class="{'form-grid-display': formsCant > 0}">
      <upload-file
          :description='"Multiple sheets OMR (optical mark recognition) OCR (Optical Character Recognition) and BCR (Bar Code Recognition)"'
          :tittle='"FREE OMR, OCR & BCR"'
          v-if="formsCant === 0"
      />
      <template v-if="formsCant > 0">
        <scrollable-forms-list />
        <form-toolbar />
        <form-editor-area />
        <form-options-panel />
      </template>

    </div>
  </div>
</template>

<script>
import UploadFile from '../components/UploadFile.vue'
import ScrollableFormsList from '../components/ScrollableFormsList.vue'
import FormEditorArea from '../components/FormEditorArea.vue'
import FormOptionsPanel from '../components/FormOptionsPanel.vue'
import AppHeader from "../components/AppHeader.vue"
import FormToolbar from "../components/FormToolbar.vue"


export default {
  inject: ['$globals'],

  components: {
    UploadFile,
    ScrollableFormsList,
    FormEditorArea,
    FormOptionsPanel,
    AppHeader,
    FormToolbar
  },

  data() {
    return {}
  },

  methods: {
    setActiveObject() {
      this.$store.commit('setFabricActiveObject', this.$globals.canvas)
    }
  },

  computed: {
    formsCant: function () {

      return Object.keys(this.$store.state.forms).length
    },
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
  grid-template-columns: 8% 65% 27%;
  grid-template-rows: 2.5rem auto;
  @media only screen and (max-width: 1025px) {
    grid-template-columns: 12% 65% 23%;
  }
  @media only screen and (max-width: 768px) {
    grid-template-areas:
      'FormToolbar'
      'workarea';
    grid-template-columns: 100%;
    grid-template-rows: 2.5rem auto;
  }
}

#FormToolbar {
  grid-area: FormToolbar;
}

#ScrollableFormsList {
  @media (max-width: 768px){
    grid-area: workarea;
  }
  grid-area: ScrollableFormsList;
}

#FormEditorArea {
  @media (max-width: 768px){
    grid-area: workarea;
    visibility: hidden;
  }
  grid-area: FormEditorArea;
}

#FormOptionsPanel {
  @media (max-width: 768px){
    grid-area: workarea;
    visibility: hidden;
  }
  grid-area: FormOptionsPanel;
}
</style>

