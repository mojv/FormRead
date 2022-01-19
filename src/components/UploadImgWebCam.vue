<template>
  <div id="videoContainer" class="absolute top-0 left-0 w-full h-full flex justify-center items-center text-red-600 bg-black">
    <canvas id="videoCanvas" class="" ></canvas>
    <video id="video" autoplay muted playsinline hidden />
  </div>
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
      this.video = document.getElementById('video')
      this.canvas = document.createElement('canvas')
      // Get access to the camera!
      if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'environment',
            width: { ideal: 4096 },
            height: { ideal: 2160 }
          }
        })
        this.video.srcObject = this.stream;
        await this.video.play();
      }

      let height = document.getElementById('videoContainer').offsetHeight
      let width  = document.body.offsetWidth
      if(this.video.videoHeight/this.video.videoWidth <  height/width){
        height = this.video.videoHeight * width / this.video.videoWidth
      }else{
        width = this.video.videoWidth * height / this.video.videoHeight
      }

      this.canvas = document.getElementById("videoCanvas");
      this.canvas.width = width;
      this.canvas.height = height;
      let context = this.canvas.getContext('2d');

      this.interval = setInterval(() => {
        context.drawImage(this.video, 0, 0, width, height);
        this.getImgWithSheetBorders(this.canvas)
      }, 300);
    },

    async getImgWithSheetBorders(canvas){
      let src = await cv.imread(canvas)
      let dst = src.clone();
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      let imgArea = canvas.height * canvas.width
      cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
      cv.threshold(dst, dst, 120, 200, cv.THRESH_BINARY);
      cv.findContours(dst, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
      for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        let cntArea = cv.contourArea(cnt, false)
        if (cntArea/imgArea < 0.95 && cntArea/imgArea > 0.05 ){
          let color = new cv.Scalar(255, 0, 0, 255);
          cv.drawContours(src, contours, i, color, 2, cv.LINE_8, hierarchy, 100);
        }
      }
      cv.imshow(canvas, src);
      dst.delete(); hierarchy.delete(); contours.delete(); src.delete()
    },

    async takePicture(){
      clearInterval(this.interval)
      let canvas = await document.createElement('canvas')
      canvas.width = this.video.videoWidth;
      canvas.height = this.video.videoHeight;
      let context = await canvas.getContext('2d');
      await context.drawImage(this.video, 0, 0, canvas.width, canvas.height)
      let src = canvas.toDataURL()
      this.$store.commit('addForm', [this.formsCant, src , true])
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