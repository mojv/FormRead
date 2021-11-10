export default {
    state () {
        return {
            token: null,
            user: null
        }
    },
    mutations: {
        logInUser(state, {token, user}) {
            state.token = token
            state.user = user
        }
    }
}