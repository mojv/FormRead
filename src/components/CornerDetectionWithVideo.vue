<template>
  <canvas id="videoCanvas" class="" ></canvas>
  <div class="absolute top-0 left-0 w-full h-full flex justify-center items-end text-red-600">
    <button @click="takePicture" class="w-12 h-12 rounded-full border-gray-400 border-4 shadow-2xl mb-5 bg-white"></button>
  </div>
</template>

<script>
import helpers from "../mixins"

export default {
  mixins: [helpers],
  data: function () {
    return {
      canvas: null,
      video: null,
      stream: null,
      interval: null
    }
  },
  methods:{

    async setUpCanvas(){
      this.video = document.createElement('video')
      this.canvas = document.createElement('canvas')
      // Get access to the camera!
      if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'environment'
          }
        })
        this.video.srcObject = this.stream;
        this.video.play();
      }

      this.canvas = document.getElementById("videoCanvas");
      this.canvas.width = window.screen.width; //document.width is obsolete
      this.canvas.height = window.screen.height;
      let context = this.canvas.getContext('2d');

      this.interval = setInterval(() => {
        context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        this.getImgWithSheetBorders(this.canvas)
      }, 100);
    },

    async getImgWithSheetBorders(canvas){
      let src = await cv.imread(canvas)
      let dst = src.clone();
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
      cv.threshold(dst, dst, 120, 200, cv.THRESH_BINARY);
      cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
      let color = new cv.Scalar(255, 0, 0, 255);
      cv.drawContours(src, contours, 0, color, 2, cv.LINE_8, hierarchy, 100);
      cv.imshow(canvas, src);
      dst.delete(); hierarchy.delete(); contours.delete(); src.delete()
    },
    takePicture(){
      clearInterval(this.interval)
      this.$store.commit('addForm', [this.formsCant, this.canvas.toDataURL(), true])
      this.video = null
      this.canvas = null
      this.stream.getTracks().forEach(function(track) {
        track.stop();
      });
      this.stream = null
      this.$emit('activateCam',  false)
    }
  },


  mounted() {
    this.setUpCanvas()
  }
}
</script>