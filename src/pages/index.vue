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
  },

  mounted() {

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
      'FormToolbar FormToolbar FormToolbar'
      'ScrollableFormsList FormEditorArea FormOptionsPanel';
  grid-template-columns: 120px 2fr 0fr;
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

