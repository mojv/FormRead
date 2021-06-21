<template>
  <div>
    <img v-for="form in forms" height="100" class="thumb" :src="form.src" />
    <upload-file 
    :description='"Get list (csv) of QR code in multiple pages and even download all Imgs renamed"' 
    :tittle='"MULTI-PAGE QR CODE READER"' />
  </div>
</template>

<script>
import UploadFile from '../components/UploadFile.vue'

export default {
  components: {UploadFile},

  data() {
      return {

      }
  },

  methods: {
    
  },

  computed: {
    forms: function () {
      // `this` points to the vm instance
      return this.$store.state.forms
    },
    test: function () {
      // `this` points to the vm instance
      return this.$store.state.test
    },
  }

}
</script>

