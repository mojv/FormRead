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
      await this.setUpVideo('video', false)
      this.canvas = document.getElementById("videoCanvas");
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
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
      await this.shutDownVideo()
      await this.setUpVideo('video', true)
      let canvas = await document.createElement('canvas')
      canvas.width = this.video.videoWidth;
      canvas.height = this.video.videoHeight;
      let context = await canvas.getContext('2d');
      await context.drawImage(this.video, 0, 0, canvas.width, canvas.height)
      let src = canvas.toDataURL()

      await this.shutDownVideo()
      this.$store.commit('addForm', [this.formsCant, src , true])
      this.$emit('activateCam',  false)
    },

    async setUpVideo(videoTagId, isHQ){
      this.video = document.getElementById(videoTagId)
      this.canvas = document.createElement('canvas')
      let settings = {facingMode: 'environment'}

      if(isHQ){
        settings['width'] = { ideal: 4096 }
        settings['height'] = { ideal: 2160 }
      }

      // Get access to the camera!
      if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: settings
        })
        this.video.srcObject = this.stream;
        await this.video.play();
      }
    },

    async shutDownVideo(){
      this.video = null
      this.canvas = null
      for (const track of this.stream.getTracks()) {
        await track.stop();
      }
      this.stream = null
    },
  },


  mounted() {
    this.setUpCanvas()
  }
}
</script>