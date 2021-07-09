import Vue from 'vue'

export const state = () => ({
  forms: {},
  selectedFormId: "",
  formReadAreas: [],
  canvasHeight: 0,
  canvasWidth: 0
})
  
export const mutations = {
  addForm(state, [formId, imgSrc]) {  
    Vue.set(state.forms, formId, {
      src: imgSrc
    })
    if(Object.keys(state.forms).length == 1){
      state.selectedFormId = formId
    }
  },
  selectForm(state, formId) {  
    state.selectedFormId = formId
  },
  updateFormReadAreas(state, areas){
    state.formReadAreas = []
    for(let area of areas){
      state.formReadAreas.push(
        {
          width: area.width,
          height: area.height,
          left: area.left,
          top: area.top,
          fill: area.fill,
          lockRotation: true,
          hasRotatingPoint: false,
          name: area.name
        }        
      )
    }
  },
  setCanvasHeight(state, height){
    state.canvasHeight = height
  },
  setCanvasWidth(state, width){
    state.canvasWidth = width
  }
}
