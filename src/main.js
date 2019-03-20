// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'leaflet/dist/leaflet.css';
import Dialog from '@/components/Dialog'
import VueLeaflet from '@/components/VueLeaflet'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import VueApollo from 'vue-apollo';
import gql from 'graphql-tag'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import ToggleButton from 'vue-js-toggle-button';
import Notifications from 'vue-notification';



Vue.component('Dialog',Dialog)
Vue.component('VueLeaflet',VueLeaflet)
Vue.use(ToggleButton)
Vue.use(Notifications)



Vue.config.productionTip = false;
Vue.use(VueMaterial)
Vue.use(Vuetify)

// Register the VueApollo plugin with Vue.
Vue.use(VueApollo);

/* leaflet icon */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


// Create a new HttpLink to connect to your GraphQL API.
// According to the Apollo docs, this should be an absolute URI.
const httpLink = new HttpLink({
  uri: `http://carabackend.local/graphql/`
});

// I'm creating another variable here just because it makes it easier to add more links in the future.
const link = httpLink;

// Create the apollo client
const apolloClient = new ApolloClient({
  // Tells Apollo to use the link chain with the http link we set up.
  link,
  // Handles caching of results and mutations.
  cache: new InMemoryCache(),
  // Useful if you have the Apollo DevTools installed in your browser.
  connectToDevTools: true,
});

const apolloProvider = new VueApollo({
  // Apollo 2.0 allows multiple clients to be enabled at once.
  // Here we select the default (and only) client.
  defaultClient: apolloClient,
});





/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  apolloProvider,
  render: h => h(App),
  components: { App },
  template: '<App/>',
  data() {
    return {
      geosearchOptions: { // Important part Here
        provider: new OpenStreetMapProvider(),
      },
    };
  },
})
