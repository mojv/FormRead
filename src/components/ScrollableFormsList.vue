<template>
  <div class="w-full py-1 shadow-md overflow-y-auto h-full flex flex-wrap justify-center content-start md:pr-1" id="ScrollableFormsList">
    <template v-for="(form, id) in forms" >
      <img
          v-if="form.src !== ''"
          :id='`form-preview-${id}`'
          @click='selectForm(id)'
          :src="form.src" :key="id"
          :class="{'border-green-400': selectedFormId === id}"
          class="self-start	shadow border-4 rounded-lg border-transparent hover:border-green-400 w-24 h-auto m-1"
          alt="id"/>
    </template >
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

