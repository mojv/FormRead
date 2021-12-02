<template>
  <div class="w-full py-1 shadow-md overflow-y-auto h-full flex flex-wrap justify-center content-start md:pr-1" id="ScrollableFormsList">
    <span @click='deleteForm(id)' class="absolute bg-red-300 hover:bg-red-400 text-xs font-bold rounded-full  cursor-pointer z-10">x</span>
    <template v-for="(form, id) in forms" >
      <div :class="{'border-green-400': selectedFormId === id}" class="m-2 relative self-start	shadow border-4 rounded-lg border-transparent hover:border-green-400 w-24 h-auto m-1">
        <img
            v-if="form.src !== ''"
            :id='`form-preview-${id}`'
            @click='selectForm(id)'
            :src="form.src" :key="id"
            class=""
            alt="id"/>
        <span @click='deleteForm(id)' class="absolute bg-red-300 hover:bg-red-400 px-2 py-1 text-xs font-bold rounded-full -top-3 -right-3 cursor-pointer">x</span>
      </div>
    </template >
  </div>
</template>

<script>
export default {
  
  name: 'ScrollableFormsList',

  methods: {
    selectForm(formId){
      this.$store.commit('selectForm', formId)
    },
    deleteForm(formId){
      if(confirm(`Do you really want to delete form ${formId}?`)){
        this.$store.commit('deleteForm', formId)
      }
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

