<template>
  <div id='ResultsTable' class="w-full overflow-y-auto p-2 overflow-y-auto h-full bg-gray-200 flex justify-center z-20">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <template  v-for="(_, columnName) in results[0]">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{columnName}}
                </th>
              </template>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="result in results">
              <template  v-for="(_, columnName) in results[0]">
                <td  class="px-6 py-4 whitespace-nowrap">
                  {{result[columnName]}}
                </td>
              </template>
            </tr>
            <!-- More people... -->
            </tbody>
          </table>
        </div>
      </div>
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
  methods: {
    getAnswerByThreshold(questions, index, areaName){
      if(questions[index] === undefined){
        return "error"
      }
      let responses = []
      let labels = store.state.formReadAreas[areaName]['questionLabels']
      if(questions !== undefined){
        if(questions[index].length !==  store.state.formReadAreas[areaName].omrQuestions[index].length){
          return 'error'
        }
        for(let option in questions[index]){
          if(questions[index][option].blackPixelsRatio > store.state.formReadAreas[areaName]['omrThreshold']){
            responses.push(labels[option])
          }
        }
      }
      return responses.join()
    }
  },
  computed: {
    areas: function (){
      return Object.filter(this.formReadAreas, area => !area.isAnchor);
    },
    results: function (){
      let results = []
      for(let [_, form] of Object.entries(this.forms)){
        let row = {}
        for(let [_, area] of Object.entries(this.areas)){
          if(area.type === 'OMR'){
            for(let index in area.omrQuestions){
              row[area.name + '-' + index] = this.getAnswerByThreshold(form.omrQuestions[area.name], index, area.name)
            }
          }else{
            row[area.name] = form.results[area.name]
          }
        }
        results.push(row)
      }
      return results
    }
  }
}
</script>

<style>

</style>