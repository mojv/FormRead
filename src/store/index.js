import { createStore } from 'vuex'
import formClass from './form'


export const store = createStore({

    state () {
        return {
          forms: {},
          selectedFormId: "",
          formReadAreas: [],
          canvasHeight: 0,
          canvasWidth: 0
        }
    },

    mutations: {
      addForm(state, [formId, imgSrc]) {  
        let form =  new formClass(formId, imgSrc)
        state.forms[formId] = form
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
              width: area.width/state.canvasWidth,
              height: area.height/state.canvasHeight,
              left: area.left/state.canvasWidth,
              top: area.top/state.canvasHeight,
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
      },
      addCanvas(state, canvas) {  
        state.canvas = canvas
      },
    },

    getters: {
        get_forms(state){
            return state.forms
        }
    },

    modules: {
      formClass
    },

    plugins: [
      
    ]
})

