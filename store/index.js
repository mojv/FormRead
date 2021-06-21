export const state = () => ({
    forms: [],
    test: 0
  })
  
  export const mutations = {
    addForm(state, [fileName, imgSrc]) {    
      state.forms.push({
        name: fileName,
        src: imgSrc
      }); 
      state.test++
    },
  }