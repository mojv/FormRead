<template>
  <div
      class="w-full py-1 shadow-md overflow-y-auto h-full flex flex-wrap justify-center items-center content-start md:pr-1"
      id="ScrollableFormsList">
    <label
        class="m-2 shadow border-4 rounded-lg border-transparent hover:border-green-400 w-10 h-10 m-1 bg-white cursor-pointer">
      <add-icon class="m-auto mt-1"/>
      <input v-if="!$store.state.isFromCamMode" type='file' class="hidden" multiple
             @change="uploadImagesFiles($event)"/>
      <input v-if="$store.state.isFromCamMode" type='button' class="hidden" multiple @click="activateCam"/>
    </label>
    <template v-for="(form, id) in forms">
      <div
          :class="{'border-green-400': selectedFormId === id}"
          v-if="form.src !== ''"
          class="m-2 relative self-start	shadow border-4 rounded-lg border-transparent hover:border-green-400 w-24 h-auto m-1"
      >
        <img
            :id='`form-preview-${id}`'
            @click='selectForm(id)'
            :src="form.src" :key="id"
            class=""
            alt="id"/>
        <span @click='deleteForm(id)'
              class="absolute bg-red-300 hover:bg-red-400 px-2 py-1 text-xs font-bold rounded-full -top-3 -right-3 cursor-pointer">x</span>
      </div>
    </template>
  </div>
</template>

<script>
import addIcon from './Icons/AddIcon.vue'
import helpers from "../mixins"

export default {

  name: 'ScrollableFormsList',
  emits: ['form-columns'],
  components: {addIcon},
  mixins: [helpers],
  methods: {
    selectForm(formId) {
      this.$store.commit('selectForm', formId)
      if(document.body.offsetWidth < 700){
        this.$emit('collapse-columns', 'scrollList')
      }
    },
    deleteForm(formId) {
      if (confirm(`Do you really want to delete form ${formId}?`)) {
        this.$store.commit('deleteForm', formId)
      }
    },
  },
}
</script>

<style scoped lang="scss">
.see-form {
  top: 45%;
  left: 41%;
}
</style>