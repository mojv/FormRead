<template>
  <div>
    <article class="text-center	text-lg px-6 py-6 text-gray-600 mx-auto max-w-2xl">
      <h2 class="text-xl font-semibold">{{tittle}}</h2>
      <p class="mt-6">
        {{description}}
      </p>  
      <div class="flex w-full  items-center justify-center bg-grey-lighter pt-60 pb-96">
          <label class="w-64 flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-300 hover:text-white">
              <svg class="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
              </svg>
              <span class="mt-2 text-base leading-normal">Select a file</span>
              <input type='file' class="hidden"  multiple @change="uploadImagesFiles($event)"/>
          </label>
      </div>      
    </article>
  </div>
</template>

<script>
export default {
  
  name: 'UploadFile',
  props: ['tittle', 'description'],

  methods: {
    uploadImagesFiles: function (evt) {
      const fileReader = new FileReader()
      var files = evt.target.files;
      let context = this   

      for(let file of files){
        var reader = new FileReader();

        //IIFE to set closure 
        reader.onload = (function(theFile, VueContext) {
          return function(e) {
            let src = e.target.result
            VueContext.$store.commit('addForm', [theFile.name, src])
            VueContext.pages--
          };
        })(file, context);

        reader.readAsDataURL(file);
      }
    },
  }
}
</script>

