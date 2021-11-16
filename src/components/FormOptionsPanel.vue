<template>
  <div class="w-full py-1 overflow-y-auto h-full shadow-md bg-white overflow-y-auto h-full">  
    <section class="shadow row">
      <div class="tabs">
        <field-drop-down-otion v-for="(area, index) in formReadAreas" :key="index" :FieldName="area.name" v-on:click="selectArea(index)" />
      </div>
    </section>
  </div>
</template>

<script>

import ButtonAreaType from './ButtonAreaType.vue'
import FieldDropDownOtion from './FieldDropDownOtion.vue'

export default {  
  name: 'FormOptionsPanel',
  inject: ['$globals'],

  components: {ButtonAreaType, FieldDropDownOtion},

  methods: {    
    selectArea(index){
        this.$globals.canvas.setActiveObject(this.$globals.canvas.item(index))
        this.$globals.canvas.requestRenderAll()
    }
  },

  computed: {
    formReadAreas: function() {
      return this.$store.state.formReadAreas
    },
    canvasHeight: function() {
      return this.$store.state.canvasHeight
    },
    canvasWidth: function() {
      return this.$store.state.canvasWidth
    },
    anchors: function() {
      return this.formReadAreas.filter(area => area.name.includes('anchor'))  
    }
  },

}
</script>

<style>

</style>