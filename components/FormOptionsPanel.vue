<template>
  <div class="w-full py-1 overflow-y-auto h-full shadow-md bg-white overflow-y-auto h-full">  
    <div class="relative z-20 flex justify-center flex-wrap flex-row sm:flex-row">
      <button-area-type v-if="anchors.length < 4" @click.native="addAnchor()" :buttonType="'anchor'" />
      <button-area-type @click.native="addArea('rgb(110,214,36,0.3)','QR')" :buttonType="'QR'"/>
      <button-area-type @click.native="addArea('rgb(158,68,226,0.3)','OCR')" :buttonType="'OCR'"/>
      <button-area-type @click.native="addArea('rgb(33,239,160,0.3)','OMR')" :buttonType="'OMR'"/>
      <button-area-type @click.native="addArea('rgb(255,117,140,0.3)','cuts')" :buttonType="'cuts'"/>
    </div>
    <section class="shadow row">
      <div class="tabs">
        <field-drop-down-otion v-for="(area, index) in formReadAreas" :key="index" :FieldName="area.name" @click.native="selectArea(index)" />
      </div>
    </section>
  </div>
</template>

<script>

import ButtonAreaType from './ButtonAreaType.vue'
import { fabric } from "fabric";
import FieldDropDownOtion from './FieldDropDownOtion.vue'

export default {  
  name: 'FormOptionsPanel',

  components: {ButtonAreaType, FieldDropDownOtion},

  methods: {    
    addArea(color, type){
      let area = this.getFabricRect(this.canvasWidth/2, this.canvasHeight/2, color)
      let name = `${type}-${Math.random().toString(36).slice(7)}`
      this.$emit('addArea', [area, name])
    },

    addAnchor(){
      let color = 'rgb(0,198,251,0.3)'
      let positions = [
        [50, 50],
        [this.canvasWidth-100, 50],
        [50, this.canvasHeight-100],
        [this.canvasWidth-100, this.canvasHeight-100]
      ]     
      for (let i in positions) {
        if(this.anchors.filter(anchor => anchor.name == 'anchor-' + i).length == 0){
          let area = this.getFabricRect(positions[i][0], positions[i][1], color)
          let name = 'anchor-' + i
          this.$emit('addArea', [area, name])
        }
      }
    },

    selectArea(index){
      this.$emit('selectArea', index)
    },
    
    getFabricRect(left, top, color){
      return new fabric.Rect({
        width: 50,
        height: 50,
        left: left,
        top: top,
        fill: color,
        lockRotation: true,
        hasRotatingPoint: false
      })  
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

<style scope>

</style>