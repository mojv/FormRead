<template>    
        <div class="mx-2 sm:mx-2 mt-8 flex justify-center">
            <div
              class="w-16 h-16 sm:w-20 sm:h-20 shadow rounded-lg flex items-center justify-center no-underline button-gradient hover:border-green-400 border-transparent"
              :style="`background-image: linear-gradient(to bottom, ${button[buttonType].colors[0]} 0%, ${button[buttonType].colors[1]} 51%, ${button[buttonType].colors[2]} 100%); background-size: auto 200%;`">
                <div>
                    <div class="flex justify-center">
                        <i class="material-icons text-white sm:p-2 text-xl sm:text-2xl rounded-full"
                          :style="`background-color: ${button[buttonType].colors[0]}`">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path v-for="(path, index) in button[buttonType].paths" :d="path" :key="index"/></svg>                                
                        </i>
                    </div>
                    <div class="flex justify-center">
                        <div class="text-center text-white">
                            <h4 class="font-bold -mb-1 text-base">{{button[buttonType].name}}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>

</template>

<script>
export default {  
  name: 'ButtonAreaType',

  props: {
    buttonType: String,
  },

  data: function () {
    return {
      button: {
        'anchor': {
          name: 'Anchor',
          paths: ['M16.949 16.132h2.332c-1.092 1.728-3.605 3.638-6.281 3.852v-8.984h3v-2h-3v-1.103c0-2.39 2-2.619 2-4.897 0-1.654-1.346-3-3-3s-3 1.346-3 3c0 2.297 2 2.487 2 4.897v1.103h-3v2h3v9c-2.639-.18-5.133-2.053-6.281-3.868h2.332l-5.051-3.132v5.912l1.269-1.8c2.702 4.503 6.379 4.305 8.731 6.888 2.352-2.583 6.029-2.385 8.731-6.889l1.269 1.8v-5.911l-5.051 3.132zm-5.949-13.132c0-.551.449-1 1-1s1 .449 1 1-.448 1-1 1-1-.449-1-1z'],
          colors: ['#00c6fb', '#005bea', '#00c6fb']
        },
        'QR': {
          name: 'QR Code',
          paths: ['M19 2c1.654 0 3 1.346 3 3v14c0 1.654-1.346 3-3 3h-14c-1.654 0-3-1.346-3-3v-14c0-1.654 1.346-3 3-3h14zm0-2h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-8 8h-1v-2h1v1h2v1h-1v1h-1v-1zm2 12v-1h-1v1h1zm-1-15v-1h-2v1h1v1h1v-1zm8-1v6h-1v-1h-4v-5h5zm-1 4v-3h-3v3h3zm-14 2h-1v1h2v-1h-1zm0 3h1v1h1v-3h-1v1h-2v2h1v-1zm5 1v2h1v-2h-1zm4-10h-1v3h1v-3zm0 5v-1h-1v1h1zm3-2h1v-1h-1v1zm-10-1h-1v1h1v-1zm2-2v5h-5v-5h5zm-1 1h-3v3h3v-3zm9 5v1h-1v-1h-2v1h-1v-1h-3v-1h-1v1h-1v1h1v2h1v-1h1v2h1v-2h3v1h-2v1h2v1h1v-3h1v1h1v2h1v-1h1v-1h-1v-1h-1v-1h1v-1h-2zm-11 8h1v-1h-1v1zm-2-3h5v5h-5v-5zm1 4h3v-3h-3v3zm12-3v-1h-1v1h1zm0 1h-1v1h-1v-1h-1v-1h1v-1h-2v-1h-1v2h-1v1h-1v3h1v-1h1v-1h2v2h1v-1h1v1h2v-1h1v-1h-2v-1zm-9-3h1v-1h-1v1zm10 2v1h1v1h1v-3h-1v1h-1zm2 4v-1h-1v1h1zm0-8v-1h-1v1h1z'],
          colors: ['#6ed624', '#319e2c', '#6ed624']
        },
        'OCR': {
          name: 'OCR',
          paths: ['M2 5V19H14V17H12C10.89 17 10 16.11 10 15V9C10 7.89 10.89 7 12 7H14V5M14 7V9H16V7M14 9H12V15H14M14 15V17H16V15M5 7H7C8.11 7 9 7.89 9 9V15C9 16.11 8.11 17 7 17H5C3.89 17 3 16.11 3 15V9C3 7.89 3.89 7 5 7M17 7V17H19V13H20V14H21V17H23V14H22V12H23V8H22V7M5 9V15H7V9M19 9H21V11H19Z'] ,
          colors: ['#9e44e2', '#6200c4', '#9e44e2']
        },
        'OMR': {
          name: 'OMR',
          paths: ['M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm4.3,7.61-4.57,6a1,1,0,0,1-.79.39h0a1,1,0,0,1-.79-.38L7.71,12.51a1,1,0,0,1,1.58-1.23l1.63,2.08,3.78-5a1,1,0,1,1,1.6,1.22Z'] ,
          colors: ['#21efa0', '#19b58b', '#21efa0']
        },
        'cuts': {
          name: 'Cuts',
          paths: ['M9.77 11.5l5.34 3.91c.44.33 1.24.59 1.79.59H20L6.89 6.38A3.5 3.5 0 1 0 5.5 8.37L7.73 10 5.5 11.63a3.5 3.5 0 1 0 1.38 1.99l2.9-2.12zM3.5 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM15.1 4.59A3.53 3.53 0 0 1 16.9 4H20l-7.5 5.5L10.45 8l4.65-3.41z'] ,
          colors: ['#ff758c', '#ff7eb3', '#ff758c']
        }                         
      },
    }
  },
}
</script>

<style scope>

</style>