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
            if(state.totalForms === 0){
                return
            }
            state.selectedFormId = formId

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
            this.commit('selectForm', Object.keys(state.forms)[0])
        },
        updateFormReadArea(state, [area, isCreate]) {
            if(area.isCornerControl || area.type === 'OmrBubble'){
                return
            }

            if(state.formReadAreas[area.name] === undefined){
                state.formReadAreas[area.name] = {}
            }

            state.formReadAreas[area.name].width            = area.getScaledWidth() / state.canvasWidth
            state.formReadAreas[area.name].height           = area.getScaledHeight() / state.canvasHeight
            state.formReadAreas[area.name].left             = area.left / state.canvasWidth
            state.formReadAreas[area.name].top              = area.top / state.canvasHeight
            state.formReadAreas[area.name].fill             = area.fill
            state.formReadAreas[area.name].lockRotation     = true
            state.formReadAreas[area.name].hasRotatingPoint = false
            state.formReadAreas[area.name].name             = area.name
            state.formReadAreas[area.name].type             = area.type
            state.formReadAreas[area.name].isAnchor         = area.isAnchor
            console.log(isCreate)
            if(area.type === 'OMR' && isCreate){
                state.formReadAreas[area.name].omrThreshold = 0.4
                state.formReadAreas[area.name].omrOrientation = 'horizontal'
                state.formReadAreas[area.name].autoBubbleSize = true
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
        },
        updateAreaName(state, [newName, oldName]) {
            state.formReadAreas[newName] = state.formReadAreas[oldName]
            delete state.formReadAreas[oldName]
            state.formReadAreas[newName].name = newName
            for (let form in state.forms){
                if(state.forms[form].results[oldName] !== undefined){
                    state.forms[form].results[newName] = state.forms[form].results[oldName]
                    delete state.forms[form].results[oldName]
                }
                if(state.forms[form].omrQuestions[oldName] !== undefined){
                    state.forms[form].omrQuestions[newName] = state.forms[form].omrQuestions[oldName]
                    delete state.forms[form].omrQuestions[oldName]
                }
            }
        },
    },

    actions: {
        processAllFormAnchors({ commit, state }) {
            for (let [formId, form] of Object.entries(state.forms)){
                if(!form.isAnchorProcessed){
                    commit('updateFormProp', [formId, 'src', '']) // just for triggering the loading modal
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
        },
        deleteOmrQuestionFromAllForms({ state }, omrAreaName){
            for (let [formId, form] of Object.entries(state.forms)){
                delete form.omrQuestions[omrAreaName]
            }
        }
    },

    getters: {
        c_forms(state) {
            return state.forms
        },
        selectedFormAnchorsCount(state) {
            if(state.totalForms === 0){
                return
            }
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

