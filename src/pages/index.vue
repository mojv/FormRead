<template>
  <!--  <script src="https://badge.dimensions.ai/badge.js"></script>-->
  <div @click="setActiveObject" class="bg-gray-50 h-screen">
    <app-header/>
    <div class="h-body" :class="{'form-grid-display': formsCant > 0}">
      <upload-file
          :description='"Multiple sheets OMR (optical mark recognition) OCR (Optical Character Recognition) and BCR (Bar Code Recognition)"'
          :tittle='"FREE OMR, OCR & BCR"'
          v-if="formsCant == 0"
      />
      <template v-if="formsCant > 0">
        <scrollable-forms-list class="scrollable-forms-list"/>
        <form-toolbar class="form-toolbar"/>
        <form-editor-area class="form-editor-area"/>
        <form-options-panel class="form-options-panel"/>
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

<style scope>
.h-body {
  height: 93%;
}

.form-grid-display {
  display: grid;
  grid-template-areas:
      'ScrollableFormsList FormToolbar FormOptionsPanel'
      'ScrollableFormsList FormEditorArea FormOptionsPanel';
  grid-template-columns: 8% 65% 27%;
  grid-template-rows: 2.5rem auto;
}

.scrollable-forms-list {
  grid-area: ScrollableFormsList;
}

.form-toolbar {
  grid-area: FormToolbar;
}

.form-editor-area {
  grid-area: FormEditorArea;
}

.form-options-panel {
  grid-area: FormOptionsPanel;
}
</style>

