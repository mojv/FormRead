<template>
  <div class="w-full py-1 overflow-y-auto h-full shadow-md bg-white overflow-y-auto h-full" id='FormOptionsPanel'>
    <section class="shadow row">
      <div class="tabs">
        <template v-for="(area, index) in formReadAreas" :key="index" >
          <field-drop-down-otion v-if="!area.isAnchor"  :FieldName="area.name" v-on:click="selectArea(index)" />
        </template>
      </div>
    </section>
  </div>
</template>

<script>

import FieldDropDownOtion from './FieldDropDownOtion.vue'
import helpers from "../mixins"

export default {
  name: 'FormOptionsPanel',
  inject: ['$globals'],
  mixins: [helpers],
  components: {FieldDropDownOtion},

  methods: {
    selectArea(index){
      this.$globals.canvas.setActiveObject(this.$globals.canvas.item(index))
      this.$globals.canvas.requestRenderAll()
    }
  },

}
</script>

<style>

</style>