<template>
  <div class="w-full py-1 overflow-y-auto h-full shadow-md bg-white overflow-y-auto h-full" id='FormOptionsPanel'>
    <section class="shadow row">
      <div class="tabs">
        <div class="flex flex-col">
          <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="py-2 inline-block min-w-full sm:px-6 lg:px-8">
              <div class="overflow-hidden">
                <table class="min-w-full">
                  <thead class="bg-white border-b">
                  <tr>
                    <th v-for="area in formReadAreas" scope="col" class="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                      {{area.name}}
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="form in forms" class="bg-gray-100 border-b">
                    <td v-for="result in form.results" class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{result}}
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
<!--        <template v-for="(area, index) in formReadAreas" :key="index" >-->
<!--          <field-drop-down-otion v-if="!area.isAnchor"  :FieldName="area.name" v-on:click="selectArea(index)" />-->
<!--        </template>-->
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