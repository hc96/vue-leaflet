<template>
  <div id="app">
  <!-- search box -->
   <!-- <a href="login.html">Login</a>
    <router-view/> -->
  <!-- search box -->
  
  <div id="maps">
   <div class="toggle" >
    <toggle-button :value="toggled"  :width="130" :height="30" @change="toggled = $event.value" :sync="true"
               :labels="{checked: 'Add new locations', unchecked: 'Disable for adding'}"/>
   </div>

   <div class="btn-group"  id="category">
    <button type="button" class="btn btn-danger" v-on:click="getResult('all')">All</button>
    <button type="button" class="btn btn-primary" v-on:click="getResult('restaurants')">Restaurants</button>
    <button type="button" class="btn btn-success" v-on:click="getResult('cinemas')">Cinemas</button>
    <button type="button" class="btn btn-info" v-on:click="getResult('bars')">Bars</button>
    <button type="button" class="btn btn-warning" v-on:click="getResult('supermarkets')">Supermarkets</button>
   </div>

  
   <div class="map">
        <VueLeaflet ref="child"  v-on:added="added" v-on:childByValue="childByValue" v-on:parentCenter="parentCenter"  :mlocations="location.list" :ableAdd="toggled" :search="searchMarker" >
        </VueLeaflet>
   </div>

  </div>
  <notifications group="lgNotification" position="top center" :max="3" :width="500"/>

  </div>
</template>

<script>
import gql from 'graphql-tag'


export default {
  
  data: () => ({
    active: false,
    value: null,
    locations: true,
    location: [],
    userCenter: Object,
    msg: '',
    name: '',
    latitude: '',
    longitude: '',
    categories: '',
    newLocation: '',
    dialog: true,
    toggled: false,
    searchMarker:'',
    user:'changchang'
  }),

   apollo: {
     location:{
       query(){
         return gql`
        query{
          location(s:"has_parent=${this.user}, lat>${this.userCenter.lat-15}, lat<${this.userCenter.lat+15}, lon>${this.userCenter.lng-13}, lon<${this.userCenter.lng+15}, limit=false") {
            list{
            title
            lat
            lon
            }
          }
        }`;
       }
     }

  },

  methods: {
     parentCenter: function(center){
       this.userCenter = center;

     },

     showMarker(){
       alert(this.searchMarker);

     },
      onConfirm () {
        this.value = 'Agreed'
      },
      onCancel () {
        this.value = 'Disagreed'
      },
      childByValue:function(childValue){
        this.active = childValue
      },
      added:function(addDone){
        this.toggled = addDone;
      },
      getResult: function(message){
        this.$refs.child.addMarker(message);
      },
    },

    beforeMount:function(){

    },
  
    mounted: function() {
  //get the session
    this.user = sessionStorage.getItem('user');
    console.log("apollo query :" + this.$apollo.queries.location)
    console.log("the session user :"+this.user)
    console.log("the user location is :" + this.userCenter.lat)
    
      this.$notify({
                 group: "lgNotification",
                 type: "success",
                 title: "Dear "+this.user+",",
                 text: "WELCOME TO THE VUE-LEAFLET!"
               });
    
    }
}
</script>

<style>


#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#maps{ 
  width: 100%; 
}

.map{
width: 100%;
}

.toggle{
  position:absolute;
  top:50px;
  right:10px;
  z-index:1;
}

#category{
  width: 100%;
  margin-bottom: 5px;
  
}

      #main {
          margin-left: auto;
          margin-right: auto;
          width: 80%;
          max-width: 800px;
          border: 2px solid #f00;
          background-color: #fff;
          font-family: sans-serif;
          font-size: 12px;
      }
      #head {
          text-align: right;
          padding: 20px;
          position: relative;
      }
      #searchBox {
          width: 100%;
      }
      /** let's modify the default border size of the unibox suggest box. Note how the size of the suggest box still stays as wide as the input. */
      #unibox-suggest-box {
          border-width: 10px;
      }

</style>
