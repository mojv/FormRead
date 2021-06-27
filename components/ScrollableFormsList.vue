<template>
  <div class="w-full py-1 shadow-md overflow-y-auto h-full pr-6" >    
    <img 
      :id='`form-preview-${id}`'
      v-for="(form, id) in forms" 
      @click='selectForm(id)' 
      :src="form.src" :key="id" 
      :class="{'border-green-400': selectedFormId == id}"
      class="w-full thumb m-3 shadow border-4 rounded-lg border-transparent hover:border-green-400"
    />
  </div>
</template>

<script>
export default {
  
  name: 'ScrollableFormsList',

  methods: {
    selectForm(formId){
      this.$store.commit('selectForm', formId)
    }
  },

  computed: {
    forms: function () {
      return this.$store.state.forms
    },
    selectedFormId: function () {
      return this.$store.state.selectedFormId
    },
  }
}
</script>

