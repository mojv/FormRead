<template>
  <jet-dialog-modal :show="show" @close="$emit('close')">
    <template #title>
      <h1 class="font-bold text-center">Error Check Tool</h1>
    </template>

    <template #content>
      Filter Errors By:

      <div class="mt-4 flex flex-row">
        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2 flex flex-col items-center w-auto mx-4">
          <input type="checkbox" v-model="filterOptions.empty" class="mr-2 my-2">
          Empty
        </label>
        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2 flex flex-col items-center w-auto mx-4">
          <input type="checkbox" v-model="filterOptions.multiMark" class="mr-2 ml-6 my-2">
          Multiple Marks
        </label>
        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2 flex flex-col items-center w-auto mx-4">
          <input type="checkbox" v-model="filterOptions.error" class="mr-2 ml-6 my-2">
          Recognition Error
        </label>
      </div>
      <div class="mt-4 flex flex-row items-center align-middle text-center" v-if="filterOptions.multiMark">
        <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2 flex flex-col items-center w-auto mx-4">
          Check When Multi-marks Are:
        </label>
        <select v-model="operator"
            class="form-select appearance-none block w-1/4 px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        >
          <option value=">">&gt</option>
          <option value=">=">&gt=</option>
          <option value="<">&lt</option>
          <option value="<=">&lt=</option>
          <option value="<>">&lt&gt</option>
          <option value="=">=</option>
        </select>
        <input type="number" min="1"
               class="form-control block w-1/4 px-3 py-1.5 text-base font-normal text-gray-700 border border-solid rounded transition focus:border-blue-600 focus:outline-none ml-2"
               v-model="multiMarkOpValue"
        />
      </div>
      <h1 class="font-bold text-center mt-6 text-green-600" v-if="errors.length === 0">
        No Errors Found
      </h1>
      <div  v-if="errors.length !== 0" class="">
        <label  v-if="errorField.type === 'select'" class="mt-4 block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2 flex flex-col items-center w-auto mx-4">
          Select The Correct Answer:
        </label>
        <select
            @change="overrideOMRValue($event, errorField)"
            v-if="errorField.type === 'select'"
            :value="errorField.value"
            class="m-auto form-select appearance-none block w-1/2 px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        >
          <option v-if="!errorField.options.includes(errorField.value)">{{ errorField.value }}</option>
          <option v-for="option in errorField.options">{{ option }}</option>
        </select>
        <label  v-if="errorField.type === 'text'" class="mt-4 block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2 flex flex-col items-center w-auto mx-4">
          Write The Correct Answer:
        </label>
        <input
            @change="overrideValue($event, errorField)"
            v-if="errorField.type === 'text'"
            :value="errorField.value"
            class="m-auto form-select appearance-none block w-1/2 px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        />
        <div v-if="selectAreaSrc"
             class="py-6 mt-2 w-full h-1/5 rounded-lg flex justify-center items-center bg-gray-100 overflow-auto">
          <img :src="selectAreaSrc" class="rounded-lg shadow-lg m-auto" alt="">
        </div>
      </div>
    </template>

    <template #footer>
      <jet-secondary-button @click="$emit('close')">
        Cancel
      </jet-secondary-button>

      <jet-button class="ml-3" @click="currentError--" v-if="currentError > 0">
        Previous
      </jet-button>
      <jet-button class="ml-3" @click="currentError++" v-if="currentError < this.errors.length -1">
        Next
      </jet-button>
    </template>
  </jet-dialog-modal>
</template>

<script>

import helpers from "../mixins"
import JetButton from '../../Jetstream/Button.vue'
import JetDialogModal from '../../Jetstream/DialogModal.vue'
import JetInput from '../../Jetstream/Input.vue'
import JetSecondaryButton from '../../Jetstream/SecondaryButton.vue'


export default {
  name: 'QAModal',
  inject: ['$globals'],
  mixins: [helpers],
  components: {
    JetButton,
    JetDialogModal,
    JetInput,
    JetSecondaryButton,
  },

  props: {
    show: {
      default: false
    }
  },

  data: function () {
    return {
      filterOptions: {
        empty: true,
        multiMark: true,
        error: true
      },
      currentError: 0,
      operator: '>',
      multiMarkOpValue: 1
    }
  },

  methods:{
    compareValue(op, val1, val2) { //you object containing your operator
      switch(op) {
        case "=":
          return val1 == val2;
        case "<>":
          return val1 != val2;
        case "<":
          return val1 < val2;
        case "<=":
          return val1 <= val2;
        case ">":
          return val1 > val2;
        case ">=":
          return val1 >= val2;
      }
    }
  },
  computed: {
    selectAreaSrc: function() {
      if(this.errors.length === 0){
        return  false
      }
      if(this.errors[this.currentError].isOmrType){
        return this.selectOMRArea(this.errorField)
      }else{
        return this.selectArea(this.errorField)
      }
    },
    errorField: function() {
      if(this.errors.length === 0){
        return  ''
      }
      return this.results[this.errors[this.currentError].row][this.errors[this.currentError].columnName];
    },
    errors: function() {
      let errors = []
      for (let [rowId, row] of this.results.entries()) {
        for (let [columnName, area] of Object.entries(row)) {
          if(area.type === 'select') {
            var totalMarks = area.value.split(',').length
            var isMultimarkError = this.compareValue(this.operator, totalMarks, this.multiMarkOpValue)
          }
          if (
              (this.filterOptions.empty && area.value === '') ||
              (this.filterOptions.error && area.value.toLowerCase()) === 'error' ||
              (this.filterOptions.multiMark && isMultimarkError)
          ) {
            errors.push({
              row: rowId,
              columnName: columnName,
              isOmrType: area.type === 'select'
            })
          }
        }
      }
      return errors
    }
  }

}
</script>
