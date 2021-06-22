<template>
  <div class="w-full py-1 overflow-y-auto h-full pr-6 ">          
      <canvas class="h-full m-auto shadow-lg rounded-lg" id="formCanvas"></canvas>       
  </div>
</template>

<script>
export default {
  
  name: 'FormEditorArea',

  data: function () {
    return {
      canvas: null,
      canvasCtx: null
    }
  },

  methods: {
    updateCanvas(){
      let default_image = new Image();
      default_image.src = this.forms[this.selectedFormId].src;
      default_image.onload = () => {
        this.canvas.width = default_image.width
        this.canvas.height = default_image.height
        this.canvasCtx.width = default_image.width
        this.canvasCtx.height = default_image.height
        this.canvasCtx.drawImage(default_image, 0, 0);
      }
    }
  },

  computed: {
    forms: function () {
      return this.$store.state.forms
    },
    selectedFormId: function () {
      return this.$store.state.selectedFormId
    },
  },

  watch: {
    selectedFormId: function (newId, oldId) {
      this.updateCanvas()
    }
  },

  mounted() {
    var canvas = document.getElementById("formCanvas")
    var ctx = canvas.getContext("2d")  
    this.canvas = canvas 
    this.canvasCtx = ctx
    this.updateCanvas()
  }
}
</script>

<style scope>

</style>