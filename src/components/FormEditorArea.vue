<template>
  <div @click="setActiveObject" class="w-full overflow-y-auto py-1 overflow-y-auto h-full pr-6" id='FormEditorArea'
       @keydown.delete="deleteObjects()" tabindex="0">
    <h>{{ fabricActiveObjects }}</h>
    <canvas class="shadow-lg rounded-lg" id="formCanvas"></canvas>
  </div>
</template>

<script>
import {fabric} from "fabric";
import FormOptionsPanel from "./FormOptionsPanel.vue"
import helpers from "../helpers"
import {store} from "../store";

const canvas = new fabric.Canvas('formCanvas')

export default {
  name: 'FormEditorArea',
  components: {FormOptionsPanel},
  inject: ['$globals'],

  data: function () {
    return {
      renderForce: 0
    }
  },

  methods: {
    deleteObjects() {
      this.$globals.canvas.getActiveObjects().forEach((obj) => {
        this.$globals.canvas.remove(obj)
        this.$store.commit('deleteFormReadArea', obj.name)
      });
      this.$globals.canvas.discardActiveObject().renderAll()

    },
  },

  computed: {
    forms: function () {
      return this.$store.state.forms
    },
    selectedFormId: function () {
      return this.$store.state.selectedFormId
    },
    selectedFormSrc: function () {
      return this.$store.state.forms[this.selectedFormId].src
    },
    formReadAreas: function () {
      return this.$store.state.formReadAreas
    },
    canvasHeight: function () {
      return this.$store.state.canvasHeight
    }
  },

  watch: {
    selectedFormId: function () {
      helpers.updateCanvas.call(this)
    },
    selectedFormSrc: function () {
      helpers.updateCanvas.call(this)
    }
  },

  mounted() {
    fabric.Object.prototype.set({
      transparentCorners: true,
    });
    delete fabric.Object.prototype.controls.mtr
    this.$globals.canvas = new fabric.Canvas('formCanvas')
    this.$globals.canvas.uniformScaling = false
    helpers.updateCanvas.call(this)
    this.$store.commit('setCanvasHeight', document.getElementById('FormEditorArea').offsetHeight)
    this.$globals.canvas.on("object:modified", () => {
      this.$globals.canvas.getActiveObjects().forEach((area) => {
        this.$store.commit('updateFormReadArea', area)
      });
    });
  }
}
</script>

<style>
.canvas-container, .upper-canvas, #formCanvas {
  margin: auto;
}

</style>