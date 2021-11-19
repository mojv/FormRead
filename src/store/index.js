import {createStore} from 'vuex'
import formClass from './form'
import auth from "./auth";


export const store = createStore({

    state() {
        return {
            forms: {},
            selectedFormId: "",
            formReadAreas: {},
            canvasHeight: 0,
            canvasWidth: 0,
            sheetAspectRatio: null,
            fabricActiveObject: ''
        }
    },

    mutations: {
        addForm(state, [formId, imgSrc, fromCam]) {
            state.forms[formId] = new formClass(formId, imgSrc, fromCam)
            if (Object.keys(state.forms).length === 1) {
                state.selectedFormId = formId
            }
        },
        selectForm(state, formId) {
            state.selectedFormId = formId

            for(let areaName in state.formReadAreas){
                if(state.formReadAreas[areaName].isAnchor){
                    state.forms[state.selectedFormId].findAnchors(areaName)
                }
            }
        },
        updateFormReadArea(state, area) {
            state.formReadAreas[area.name] = {
                width: area.getScaledWidth() / state.canvasWidth,
                height: area.getScaledHeight() / state.canvasHeight,
                left: area.left / state.canvasWidth,
                top: area.top / state.canvasHeight,
                fill: area.fill,
                lockRotation: true,
                hasRotatingPoint: false,
                name: area.name,
                isAnchor: area.isAnchor
            }
            if(area.isAnchor){
                state.forms[state.selectedFormId].findAnchors(area.name)
            }
        },
        deleteFormReadArea(state, areaName) {
            delete state.formReadAreas[areaName]
        },
        setCanvasHeight(state, height) {
            state.canvasHeight = height
        },
        setCanvasWidth(state, width) {
            state.canvasWidth = width
        },
        addCanvas(state, canvas) {
            state.canvas = canvas
        },
        updateFormProp(state, [formId, propName, value]) {
            state.forms[formId][propName] = value
        },
        setSheetAspectRatio(state, ratio) {
            state.sheetAspectRatio = ratio
        },
        setFabricActiveObject(state, canvas) {
            try {
                state.fabricActiveObject = canvas.getActiveObjects()[0].name
            } catch (e) {
                state.fabricActiveObject = ''
            }
        }
    },

    getters: {
        get_forms(state) {
            return state.forms
        }
    },

    modules: {
        auth
    },

    plugins: []
})

