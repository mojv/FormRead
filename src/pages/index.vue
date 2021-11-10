<template>
  <div class="bg-gray-50 h-screen">
    <app-header />
    <div class="h-body" :class="{'form-grid-display': formsCant > 0}"> 
      <upload-file 
        :description='"Get list (csv) of QR code in multiple pages and even download all Imgs renamed"' 
        :tittle='"MULTI-PAGE QR CODE READER"' 
        v-if="formsCant == 0"
      />  
      <template v-if="formsCant > 0">
        <scrollable-forms-list />
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


export default {
  components: {
    UploadFile,
    ScrollableFormsList,
    FormEditorArea,
    FormOptionsPanel,
    AppHeader,
  },

  data() {
      return {
        
      }
  },

  methods: {
    
  },

  computed: {
    formsCant: function () {
    
      return Object.keys(this.$store.state.forms).length
    },
  }

}
</script>

<style scope>
  .h-body{
    height: 93%;
  }

  .form-grid-display{
    display: grid;
    grid-template-columns: 8% 65% 27%;
  }
</style>

