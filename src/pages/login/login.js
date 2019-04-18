import Vue from 'vue'

import login from './login.vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import Notifications from 'vue-notification';

Vue.use(Notifications)

Vue.config.productionTip = false

Vue.use(Vuetify)

/* eslint-disable no-new */

new Vue({

el: '#login',

  render: h => h(login)

})