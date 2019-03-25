<template>
  <div id="app">
  <div id="maps">

   <div class="toggle" >
    <toggle-button :value="toggled"  width=130 height=30 @change="toggled = $event.value" :sync="true"
               :labels="{checked: 'Add new locations', unchecked: 'Disable for adding'}"/>
   </div>

   <div class="btn-group"  id="category">
    <button type="button" class="btn btn-danger" v-on:click="getResult('all')">All</button>
    <button type="button" class="btn btn-primary" v-on:click="getResult('restaurants')">Restaurants</button>
    <button type="button" class="btn btn-success" v-on:click="getResult('cinemas')">Cinemas</button>
    <button type="button" class="btn btn-info" v-on:click="getResult('bars')">Bars</button>
    <button type="button" class="btn btn-warning" v-on:click="getResult('supermarkets')">Supermarkets</button>
   </div>

  
   <div class="map" v-if="!active" >
        <VueLeaflet ref="child"  v-on:added="added" v-on:childByValue="childByValue"  :mlocations="location.list" :ableAdd="toggled" >
        </VueLeaflet>
   </div>
   


   <div  v-else-if="!value && active">
      <md-dialog-confirm
      :md-active.sync="active"
      md-title="Use Google's location service?"
      md-content="Opppps... <br>  <strong>No location found, please try again.</strong>"
      md-confirm-text="Continue"
      @md-cancel="onCancel"
      @md-confirm="onConfirm" />    
   </div>

     <div class="map" v-if="value">
        <VueLeaflet ref="child" :noLocation="locations" :mlocations="location.list"  :ableAdd="toggled">
        </VueLeaflet>
     </div>

  </div>

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
    msg: '',
    name: '',
    latitude: '',
    longitude: '',
    categories: '',
    newLocation: '',
    dialog: true,
    toggled: false
  }),
   apollo: {
      location: gql`
      {
       location {
          list {
          title
          lat
          lon
          categories{
            list{
              name
              }
            }        
           }
        }
      }
      `
  },

  methods: {
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
      display:function(event){
        this.newLocation = '{\"title\":\"'+this.name+'\",\"lat\":\"'+this.latitude+'\",\"lon\":\"'+this.longitude+'\",\"categories\":{\"list\":[{\"name\":\"'+this.categories+'\"}]}}';
        this.$refs.child.addNew(this.newLocation);
        alert(this.newLocation);
      },
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


</style>
