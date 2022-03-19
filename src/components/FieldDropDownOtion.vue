<template>
      <header class="flex justify-between items-center h-16">
        <input class="text-grey-darkest font-thin text-xl w-full h-full px-8" :value="area.name"
               @change="changeAreaName($event)">
        <div class="w-7 h-7 flex items-center justify-center test mr-4 handle cursor-move" for="chck1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
      </header>
      <div class="tab-content" v-show="selected">
        <div v-if="area.type === 'BCR'" class="pl-8 pr-8 pb-5 text-grey-darkest flex flex-wrap" >
              <div class="w-1/2 px-3 mb-6 md:mb-0">
                  <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
                      Barcode Type
                  </label>
                  <div class="relative">
                      <select :value="area.bcrType" @change="changeBcrType($event)"
                              class="form-select appearance-none block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                              aria-label="Default select example">
                          <option value="QR_CODE">QR CODE</option>
                          <option value="AZTEC">AZTEC</option>
                          <option value="CODABAR">CODABAR</option>
                          <option value="CODE_39">CODE 39</option>
                          <option value="CODE_93">CODE 93</option>
                          <option value="CODE_128">CODE 128</option>
                          <option value="DATA_MATRIX">DATA MATRIX</option>
                          <option value="MAXICODE">MAXICODE</option>
                          <option value="ITF">ITF</option>
                          <option value="EAN_13">EAN 13</option>
                          <option value="EAN_8">EAN 8</option>
                          <option value="PDF_417">PDF 417</option>
                          <option value="RSS_14">RSS 14</option>
                          <option value="RSS_EXPANDED">RSS EXPANDED</option>
                          <option value="UPC_A">UPC A</option>
                          <option value="UPC_E">UPC E</option>
                          <option value="UPC_EAN_EXTENSION">UPC EAN EXTENSION</option>
                      </select>
                  </div>
              </div>
          </div>
        <div v-if="area.type === 'OMR'" class="pl-8 pr-8 pb-5 text-grey-darkest flex flex-wrap" >
          <div class="w-1/2 px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
              Orientation
            </label>
            <div class="relative">
              <select :value="area.omrOrientation" @change="changeOmrOrientation($event)"
                      class="form-select appearance-none block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                      aria-label="Default select example">
                <option value="horizontal">horizontal</option>
                <option value="vertical">vertical</option>
              </select>
            </div>
          </div>
          <div class="w-1/2 px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-state">
              Bubble Size Auto
              <input type="checkbox" v-model="area.autoBubbleSize">
            </label>

            <div class="relative flex">
              <input
                  :disabled="area.autoBubbleSize"
                  :value="this.area.omrBubblesDimensions.width"
                  class="form-control block w-1/2 px-3 py-1.5 text-base font-normal text-gray-700 border border-solid rounded transition focus:border-blue-600 focus:outline-none"
                  placeholder="Width"
                  type="number"
                  @change="changeOmrBubbleSize($event, 'width')"
              />
              <input
                  :disabled="area.autoBubbleSize"
                  :value="this.area.omrBubblesDimensions.height"
                  class="form-control block w-1/2 px-3 py-1.5 text-base font-normal text-gray-700 border border-solid rounded transition focus:border-blue-600 focus:outline-none ml-2"
                  placeholder="Height"
                  type="number"
                  @change="changeOmrBubbleSize($event, 'height')"
              />
            </div>
          </div>
          <div class="w-full px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mt-4 mb-0" for="grid-state">
              Darkness Threshold %{{parseInt(omrThreshold*100)}}
            </label>
            <div class="relative">
              <div class="relative pt-1">
                <input type="range"
                       class="form-range appearance-none w-full h-1 p-0 bg-gray-100 focus:outline-none focus:ring-0 focus:shadow-none"
                       min="0"
                       max="1"
                       id="customRange2"
                       step="0.01"
                       v-model="omrThreshold"
                />
              </div>
            </div>
          </div>
          <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg m-auto mt-3">
            <table class="divide-y divide-gray-200">
              <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="text-center px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  bubble
                </th>
                <th scope="col" class="text-center px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  label
                </th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(img, index) in firstQuestionBubbleImgs" class=" h-10" :key="index">
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <img :src="img" class="h-5 m-auto">
                </th>
                <th scope="col" class="text-xs font-medium text-gray-500 uppercase tracking-wider h-10">
                  <input class="text-center text-grey-darkest font-thin text-xl w-full h-full h-10" :value="questionLabels[index]" @change="changeQuestionLabel($event, index)">
                </th>
              </tr>
              <!-- More people... -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
</template>

<script>
import {store} from "../store";
import helpers from "../mixins";

export default {
  name: 'FieldDropDownOtion',
  inject: ['$globals'],
  mixins: [helpers],

  props: {
    area: Object,
    selected: Boolean
  },

  methods: {
    changeAreaName(e) {
      let newName = e.target.value
      this.$globals.canvas.getObjects().forEach((obj) => {
        if (obj.name === this.area.name) {
          obj.name = newName
        }
      });
      this.$store.commit('updateAreaName', [newName, this.area.name])
    },
    changeBcrType(e) {
        store.state.formReadAreas[this.area.name]['bcrType'] = e.target.value
    },
    changeOmrOrientation(e) {
      store.state.formReadAreas[this.area.name]['omrOrientation'] = e.target.value
      this.resetOmrFiled(e.target.value)
    },
    changeOmrBubbleSize(e, side) {
      this.area.omrBubblesDimensions[side] = e.target.value
      this.resetOmrFiled(store.state.formReadAreas[this.area.name]['omrOrientation'], false)
    },
    resetOmrFiled(orientation, isSetup = true) {
      this.$store.dispatch('deleteOmrQuestionFromAllForms', this.area.name)
      this.selectedForm.omrRead(this.area.name, isSetup, orientation)
    },
    changeQuestionLabel(e, index) {
      store.state.formReadAreas[this.area.name]['questionLabels'][index] = e.target.value
    },
    updateFormReadAreas(formReadAreas){
      store.commit('mutateProperty', ['formReadAreas',  formReadAreas])
    }
  },

  computed: {
    firstQuestionBubbleImgs: function (){
      return store.state.formReadAreas[this.area.name]['firstQuestionBubbleImgs']
    },
    questionLabels: function (){
      return store.state.formReadAreas[this.area.name]['questionLabels']
    },
    omrThreshold: {
      get: function (){
        return store.state.formReadAreas[this.area.name]['omrThreshold']
      },
      set: function (val){
        store.state.formReadAreas[this.area.name]['omrThreshold'] = val
        this.updateFormReadAreas(store.state.formReadAreas)
        this.updateOmrBubbles(false)
      }
    }
  },

  mounted() {
    this.omrThreshold = store.state.formReadAreas[this.area.name]['omrThreshold']
  }

}
</script>

