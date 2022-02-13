<template>
  <div id='ResultsTable' class="w-full p-2 overflow-y-auto h-full bg-gray-200 justify-center z-20">
    <div class="w-full h-4/5 overflow-y-auto p-2">
      <div class="w-full align-middle inline-block min-w-full sm:px-6 ">
        <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <template  v-for="(_, columnName) in results[0]" :key="columnName">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{columnName}}
                </th>
              </template>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="result in results" :key="result.id">
              <template  v-for="(_, columnName) in results[0]" :key="columnName">
                <td  class="whitespace-nowrap w-auto p-0 pr-1">
                  <select
                      v-on:focus="selectOMRArea(result[columnName])"
                      @change="overrideOMRValue($event, result[columnName])"
                      v-if="result[columnName].type === 'select'"
                      :value="result[columnName].value"
                      class="w-full bg-white text-grey-darkest font-thin h-full text-center"
                      :id="result[columnName].formId + columnName"
                  >
                    <option v-if="!result[columnName].options.includes(result[columnName].value)">{{ result[columnName].value }}</option>
                    <option v-for="option in result[columnName].options">{{ option }}</option>
                  </select>
                  <input
                      v-on:focus="selectArea(result[columnName])"
                      @change="overrideValue($event, result[columnName])"
                      v-if="result[columnName].type === 'text'"
                      :value="result[columnName].value"
                      class="w-32  bg-white text-grey-darkest font-thin h-full px-2"
                      :id="result[columnName].formId + columnName"
                  />
                  <p @click="showForm(result[columnName].value)" class="bg-white text-grey-darkest font-thin w-full h-full px-8 cursor-pointer" v-if="result[columnName].type === 'id'">
                    {{ result[columnName].value }}
                  </p>
                </td>
              </template>
            </tr>
            <!-- More people... -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div v-if="selectAreaSrc" class="pt-2 w-full h-1/5 rounded-lg flex justify-center items-center bg-gray-100 overflow-auto">
      <img :src="selectAreaSrc" class="rounded-lg shadow-lg m-auto ">
    </div>
  </div>
</template>

<script>
import FieldDropDownOtion from './FieldDropDownOtion.vue'
import helpers from "../mixins"
import {store} from "../store";

export default {  
  name: 'ResultsTable',
  mixins: [helpers],
  components: {FieldDropDownOtion},
  data: function () {
    return {
      selectAreaSrc: false,
    }
  },
  methods: {
    selectArea(result){
      let area = this.$store.state.formReadAreas[result.areaName]
      let [areaCanvas, _] = this.$store.state.forms[result.formId].getAreaCanvas(area)
      this.selectAreaSrc = areaCanvas.toDataURL()
    },
    selectOMRArea(result){
      let firstBubble = this.$store.state.forms[result.formId].omrQuestions[result.areaName][result.questionIndex][0]
      let lastBubble = this.$store.state.forms[result.formId].omrQuestions[result.areaName][result.questionIndex].slice(-1)[0]
      let questionArea = {
        top: firstBubble.top - firstBubble.height/2,
        left: firstBubble.left - firstBubble.width/2,
        width: (lastBubble.left - firstBubble.left) + firstBubble.width*2,
        height: (lastBubble.top - firstBubble.top) + firstBubble.height*2
      }
      let [areaCanvas, _] = this.$store.state.forms[result.formId].getAreaCanvas(questionArea)
      this.selectAreaSrc = areaCanvas.toDataURL()
    },
    overrideValue(e, result){
      this.$store.state.forms[result.formId].results[result.areaName] = e.target.value
    },
    overrideOMRValue(e, result){
      let optionIndex = result.options.findIndex((element) => element === e.target.value)
      this.$store.state.forms[result.formId].omrQuestions[result.areaName][result.questionIndex][optionIndex]['forceAnswer'] = true
    },
    showForm(formId){
      this.showResultsTable()
      this.selectForm(formId)
    }
  }
}
</script>

<style>

</style>