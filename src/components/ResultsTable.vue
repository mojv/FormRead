<template>
  <div id='ResultsTable' class="w-full overflow-y-auto p-2 overflow-y-auto h-full bg-gray-200 flex justify-center z-20">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <template  v-for="area in columns">
                <template v-if="area.type === 'OMR'" >
                  <th v-for="(_,index) in area.omrQuestions.entries()" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{area.name}} - {{index}}
                  </th>
                </template>
                <th v-if="area.type !== 'OMR'" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{area.name}}
                </th>
              </template>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="form in forms">
              <template  v-for="area in columns">
                <template v-if="area.type === 'OMR'" >
                  <th v-for="(_,index) in area.omrQuestions.entries()" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{getAnswerByThreshold(form.omrQuestions[area.name], index)}}
                  </th>
                </template>
                <td  v-if="area.type !== 'OMR'" class="px-6 py-4 whitespace-nowrap">
                  {{form.results[area.name]}}
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

export default {  
  name: 'ResultsTable',
  mixins: [helpers],
  components: {FieldDropDownOtion},
  methods: {
    getAnswerByThreshold(questions, index){
      let responses = []
      if(questions !== undefined){
        for(let option in questions[index]){
          if(questions[index][option].blackPixelsRatio > 0.2){
            responses.push(option)
          }
        }
      }
      return responses.join()
    }
  },
  computed: {
    columns: function (){

      return Object.filter(this.formReadAreas, area => !area.isAnchor);

    },
    rows: function (){

    }
  }
}
</script>

<style>

</style>