import Cookies from 'js-cookie'
import Vuex from 'vuex'
// import user from '../graphql/query/user.gql'
import pages from './pages'

export const state = () => ({
  viewer: null,
  accessToken: null,
  user: null
})

export const getters = {
  isAuthenticated(state) {
    return Boolean(state.accessToken)
  },
  isUser(state) {
    return Boolean(state.accessToken) && Boolean(state.user)
  },
  isGuest(state) {
    return !state.accessToken
  },
  loggedInUser(state) {
    return state.user
  }
}

export const mutations = {
  SET_ACCESS_TOKEN(state, accessToken) {
    state.accessToken = accessToken
  },
  SET_USER(state, user) {
    state.user = user
  },
  LOGOUT(state, user) {
    state.accessToken = null
    state.user = null
    Cookies.remove('accessToken')
    Cookies.remove('user')
  }
}

const actions = {
  signin(context, signin) {
    context.commit('SET_ACCESS_TOKEN', signin.accessToken)
    context.commit('SET_USER', signin.user)
    Cookies.set('accessToken', signin.accessToken, {
      expires: 1
    })
    Cookies.set('user', signin.user, { expires: 1 })
  },
  logout(context) {
    context.commit('LOGOUT')
  },
  nuxtServerInit(context, { req }) {
    console.log('nuxtServerInit')
  }
}

const createStore = () => {
  return new Vuex.Store({
    state,
    mutations,
    getters,
    actions,
    modules: {
      pages
    }
  })
}

export default createStore
