import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '@/views/Login.vue'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter(to, from, next) {
      try {
        var hasPermission = false;
        var userPool = store.getters.pooldata;
        var cognitoUser = userPool.getCurrentUser()
        if (cognitoUser != null){
          cognitoUser.getSession(function (err, session) {
            if(!err) {
              hasPermission = session.isValid();
            }
          });
        }

        if (hasPermission) {
          next()
        } else {
          next({ name: "Login" })   
        }
      } catch (e) {
        next({ name: "Login" })
      }
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
