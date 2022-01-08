<template>
  <div id='ResultsTable' class="w-full overflow-y-auto p-2 overflow-y-auto h-full bg-gray-200 flex justify-center z-20">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th  v-for="area in columns" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{area.name}}
              </th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="form in forms">
              <td  v-for="area in columns"  class="px-6 py-4 whitespace-nowrap">
                <div v-for="[resultAreaName, result] of Object.entries(form.results)" class="text-sm text-gray-900">
                  <p v-if="area.name === resultAreaName">{{result}}</p>
                </div>
              </td>
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