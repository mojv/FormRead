<template>
  <div class="w-full py-1 overflow-y-auto h-full shadow-md bg-white overflow-y-auto h-full" id='FormOptionsPanel'>
    <section class="shadow row">
      <div class="tabs">
        <template v-for="(area, areaName) in formReadAreas" :key="index" >
          <field-drop-down-otion v-if="!area.isAnchor"  :area="area" :selected="fabricActiveObject === area.name" v-on:click="selectArea(areaName)" />
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
    selectArea(areaName){
      this.$globals.canvas.getObjects().forEach((obj) => {
        if(obj.name === areaName){
          this.$globals.canvas.setActiveObject(obj)
          this.$globals.canvas.requestRenderAll()
        }
      });
    }
  },

}
</script>

<style>

</style>