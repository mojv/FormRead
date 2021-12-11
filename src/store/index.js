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
            fabricActiveObject: '',
            showLoadingModal: false,
            totalForms: 0,
            isFromCamMode: false,
            anchors: {hasAnchors: false, anchorType: '', areAnchorsRead: false},
        }
    },

    mutations: {
        mutateProperty(state, [prop, val]){
            state[prop] = val
        },
        addForm(state, [formId, imgSrc, fromCam]) {
            state.forms[formId] = new formClass(formId, imgSrc, fromCam)
            if (Object.keys(state.forms).length === 1) {
                state.selectedFormId = formId
            }
            state.totalForms = Object.keys(state.forms).length
        },
        selectForm(state, formId) {
            state.selectedFormId = formId
            state.canvasWidth;

            if(state.forms[state.selectedFormId].isAnchorProcessed){
                return
            }
            if(state.anchors.hasAnchors){
                if(state.anchors.anchorType === 'object'){
                    for(let areaName in state.formReadAreas){
                        if(state.formReadAreas[areaName].isAnchor){
                            state.forms[state.selectedFormId].findAnchors(areaName)
                        }
                    }
                }else{
                    state.forms[state.selectedFormId].detectSheetCorners()
                }
            }
        },
        deleteForm(state, formId) {
            delete state.forms[formId]
            state.totalForms--
            if(state.totalForms === 0){
                location.reload();
            }
            this.commit('selectForm', Object.keys(state.forms)[0])
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
        updateFormProp(state, [formId, propName, value]) {
            state.forms[formId][propName] = value
        },
        setFabricActiveObject(state, canvas) {
            try {
                state.fabricActiveObject = canvas.getActiveObjects()[0].name
            } catch (e) {
                state.fabricActiveObject = ''
            }
        }
    },

    actions: {
        processAllFormAnchors({ commit, state }) {
            for (let [formId, form] of Object.entries(state.forms)){
                if(!form.isAnchorProcessed){
                    commit('updateFormProp', [formId, 'src', '']) // just for triggering the loading modal
                    console.log('adfad')
                    setTimeout(() => {
                        form.processAnchors()
                    }, 0)
                }
            }
        },
        deleteAllAnchors({ state }){
            for (let form in state.forms){
                state.forms[form].anchors = {}
            }
        }
    },

    getters: {
        c_forms(state) {
            return state.forms
        },
        selectedFormAnchorsCount(state) {
            return Object.keys(state.forms[state.selectedFormId].anchors).length
        },
        countImageSrc(state) {
            let count = 0
            for (let form in state.forms){
                count = state.forms[form].src !== '' ? count + 1 : count;
            }
            return count
        },
    },

    modules: {
        auth
    },

    plugins: []
})

