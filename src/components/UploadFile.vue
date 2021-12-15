<template>
  <div class="h-full">
    <article class="text-center	text-lg px-6 py-6 text-gray-600 mx-auto max-w-2xl h-full ">
      <h2 class="text-xl font-semibold">{{ tittle }}</h2>
      <p class="mt-6">
        {{ description }}
      </p>
      <div class="flex w-full flex flex-col md:flex-row items-center justify-center bg-grey-lighter align-middle pt-20">
        <label
            class="w-52 h-28 flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-300 hover:text-white">
          <svg class="w-8 h-8" style="" viewBox="0 0 1024 1024"  xmlns="http://www.w3.org/2000/svg"><path d="M268.939 186.181c5.725 0 10.333-4.143 10.333-9.309l0-27.927c0-5.167-4.608-9.309-10.333-9.309l-72.425 0c-5.725 0-10.333 4.143-10.333 9.309l0 27.927c0 5.12 4.608 9.309 10.333 9.309L268.939 186.181zM372.363 535.271c0 89.972 72.937 162.909 162.909 162.909S698.18 625.243 698.18 535.271s-72.937-162.909-162.909-162.909S372.363 445.299 372.363 535.271zM0 325.817l0 465.453c0 93.091 93.091 93.091 93.091 93.091l837.816 0c0 0 93.091 0 93.091-93.091L1023.998 325.817c0-93.091-93.091-93.091-93.091-93.091L744.725 232.726l-46.545-93.091L372.363 139.635l-46.545 93.091L93.091 232.726C93.091 232.727 0 232.727 0 325.817zM791.271 325.817c25.693 0 46.545 20.852 46.545 46.545 0 25.693-20.852 46.545-46.545 46.545-25.693 0-46.545-20.852-46.545-46.545C744.725 346.67 765.578 325.817 791.271 325.817zM535.271 325.817c115.665 0 209.454 93.789 209.454 209.454s-93.789 209.454-209.454 209.454-209.454-93.789-209.454-209.454S419.606 325.817 535.271 325.817z"  /></svg>
          <span class="mt-2 text-base leading-normal">From Camera</span>
          <input type='button' class="hidden" multiple @click="activateCam"/>
        </label>
        <label
            class="mt-2 md:mt-0 md:ml-2 w-52 h-28 flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-300 hover:text-white">
          <svg class="w-9 h-10" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M74.787822 497.105778l145.738245-51.79669-120.714316-59.022255 1.594311-31.175023 80.302931-19.23611 288.529369-21.851681L920.690588 531.088754l-347.449293 23.099091L213.489814 375.612727l-58.815547 5.5279 407.267681 199.024869 368.833323-27.951609 7.140631 20.708648 14.798031 7.226588L533.765211 749.540068 74.787822 497.105778 74.787822 497.105778zM287.069623 466.780099l-93.889367 33.376155 337.950965 185.906084 267.181155-108.029412-237.96474 22.283516-35.07382-17.119913-85.11861 34.71157-25.647123-15.944134 82.658581-32.508391L287.069623 466.780099 287.069623 466.780099zM63.836399 513.168616l0.901533 86.923722L531.928377 861.606423l425.325965-179.426509 0-84.132142L533.730419 774.717494 63.836399 513.168616 63.836399 513.168616zM554.595632 697.013761l21.175275 12.892635 34.935674-15.112186-21.24486-12.942777L554.595632 697.013761 554.595632 697.013761zM654.894989 655.459343l21.175275 12.928451 34.936697-15.129582L689.763125 640.330784 654.894989 655.459343 654.894989 655.459343zM606.305341 675.80267l21.141506 12.910031 34.969443-15.127536-21.24486-12.927427L606.305341 675.80267z"  /></svg>
          <span class="mt-2 text-base leading-normal">From Scanner</span>
          <input type='file' class="hidden" multiple @change="uploadFiles($event, false)"/>
        </label>
      </div>
    </article>
  </div>
</template>

<script>
import helpers from "../mixins"


export default {

  name: 'UploadFile',
  props: ['tittle', 'description'],
  mixins: [helpers],

  methods: {
    uploadFiles: function (evt, fromCam) {
      this.$store.commit('mutateProperty', ['isFromCamMode', fromCam])
      this.uploadImagesFiles(evt, fromCam)
    },
    activateCam(){
      this.$emit('activateCam',  true)
    }
  },

}
</script>