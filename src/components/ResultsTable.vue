<template>
  <div id='ResultsTable' class="w-full overflow-y-auto p-2 overflow-y-auto h-full bg-gray-200 flex justify-center z-20">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
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
                <td  class="whitespace-nowrap w-auto">
                  <select  v-if="result[columnName].type === 'select'" v-model="result[columnName].value" class="w-full bg-white text-grey-darkest font-thin h-full px-8">
                    <option v-if="!result[columnName].options.includes(result[columnName].value)">{{ result[columnName].value }}</option>
                    <option v-for="option in result[columnName].options">{{ option }}</option>
                  </select>
                  <input  v-if="result[columnName].type === 'text'" v-model="result[columnName].value" class="w-32  bg-white text-grey-darkest font-thin h-full px-2"/>
                  <p class="bg-white text-grey-darkest font-thin w-full h-full px-8" v-if="result[columnName].type === 'id'">{{ result[columnName].value }}e</p>
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
}
</script>

<style>

</style>