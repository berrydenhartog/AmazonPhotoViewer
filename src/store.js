import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    pooldata: null,
  },
  mutations: {
    setPoolData(state, pool){
      state.pooldata = pool;
    }
  },
  getters: {
    pooldata: state => state.pooldata,
  }
})