<template>
  <div id="app">
  <div id="maps">
   <div class="toggle" >
    <toggle-button :value="toggled"  :width="130" :height="30" @change="toggled = $event.value" :sync="true"
               :labels="{checked: 'Add new locations', unchecked: 'Disable for adding'}"/>
   </div>

   <!-- button group for categories -->
   <div class="btn-group"  id="category">
    <button type="button" class="btn btn-danger" v-on:click="getResult('all')">All</button>
    <button type="button" class="btn btn-primary" v-on:click="getResult('restaurants')">Restaurants</button>
    <button type="button" class="btn btn-success" v-on:click="getResult('cinemas')">Cinemas</button>
    <button type="button" class="btn btn-info" v-on:click="getResult('bars')">Bars</button>
    <button type="button" class="btn btn-warning" v-on:click="getResult('supermarkets')">Supermarkets</button>
   </div>

   <!-- the LeafLet map -->
   <div  class="map">
        <VueLeaflet  ref="child"  v-on:added="added" v-on:childByValue="childByValue" v-on:parentBound="parentBound"  v-on:parentZoom="parentZoom"  :mlocations="location" :ableAdd="toggled" :search="searchMarker" >
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
    zoom: Number,
    index: Number,
    location: [],
    userCenter: Object,
    centerBound:{
    },
    lat:'',
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
      if(this.zoom >= 10){
        return gql`
          query{
            location(s:"has_parent=${this.user}, lat>${this.centerBound.south}, lat<${this.centerBound.north}, lon>${this.centerBound.west}, lon<${this.centerBound.east}, limit=false") {
              list{
              title
              lat
              lon
              }
            }
          }`;
         }else if(10 > this.zoom && this.zoom >= 3){
 
          //the code below is used to query 6 diffenrent representing markers at one time
           /*
           return gql`
            query{
            l0:location(s:"has_parent=${this.user}, lat>${(this.centerBound.north+this.centerBound.south)/2}, lat<${this.centerBound.north}, lon>${this.centerBound.west}, lon<${this.centerBound.west+(this.centerBound.east-this.centerBound.west)/3}, limit=false") {
            getTotal
            }
            l1:location(s:"has_parent=${this.user}, lat>${(this.centerBound.north+this.centerBound.south)/2}, lat<${this.centerBound.north}, lon>${this.centerBound.west+(this.centerBound.east-this.centerBound.west)/3}, lon<${this.centerBound.west+2*(this.centerBound.east-this.centerBound.west)/3}, limit=false") {
            getTotal
            }
            l2:location(s:"has_parent=${this.user}, lat>${(this.centerBound.north+this.centerBound.south)/2}, lat<${this.centerBound.north}, lon>${this.centerBound.west+2*(this.centerBound.east-this.centerBound.west)/3}, lon<${this.centerBound.east}, limit=false") {
            getTotal
            }
            l3:location(s:"has_parent=${this.user}, lat>${this.centerBound.south}, lat<${(this.centerBound.north+this.centerBound.south)/2}, lon>${this.centerBound.west}, lon<${this.centerBound.west+(this.centerBound.east-this.centerBound.west)/3}, limit=false") {
            getTotal
            }
            l4:location(s:"has_parent=${this.user}, lat>${this.centerBound.south}, lat<${(this.centerBound.north+this.centerBound.south)/2}, lon>${this.centerBound.west+(this.centerBound.east-this.centerBound.west)/3}, lon<${this.centerBound.west+2*(this.centerBound.east-this.centerBound.west)/3}, limit=false") {
            getTotal
            }
            l5:location(s:"has_parent=${this.user}, lat>${this.centerBound.south}, lat<${(this.centerBound.north+this.centerBound.south)/2}, lon>${this.centerBound.west+2*(this.centerBound.east-this.centerBound.west)/3}, lon<${this.centerBound.east}, limit=false") {
            getTotal
           }     
        }`;
        */

        /* IMPORTANT: here try to send 6 graphQL queries one by one
        (1) query with different lat and lon limit
         */  
         switch(this.index){  
         case 0: 
          return this.sendQuery((this.centerBound.north+this.centerBound.south)/2,this.centerBound.north,this.centerBound.west,this.centerBound.west+(this.centerBound.east-this.centerBound.west)/3);    
          break;
         case 1: 
          return this.sendQuery((this.centerBound.north+this.centerBound.south)/2,this.centerBound.north,this.centerBound.west+(this.centerBound.east-this.centerBound.west)/3,this.centerBound.west+2*(this.centerBound.east-this.centerBound.west)/3);       
          break;
        case 2:
          return this.sendQuery((this.centerBound.north+this.centerBound.south)/2,this.centerBound.north,this.centerBound.west+2*(this.centerBound.east-this.centerBound.west)/3,this.centerBound.east);      
          break;
        case 3:
          return this.sendQuery(this.centerBound.south,(this.centerBound.north+this.centerBound.south)/2,this.centerBound.west,this.centerBound.west+(this.centerBound.east-this.centerBound.west)/3);        
          break;
        case 4:
          return this.sendQuery(this.centerBound.south,(this.centerBound.north+this.centerBound.south)/2,this.centerBound.west+(this.centerBound.east-this.centerBound.west)/3,this.centerBound.west+2*(this.centerBound.east-this.centerBound.west)/3);     
          break;
        case 5: 
          return this.sendQuery(this.centerBound.south,(this.centerBound.north+this.centerBound.south)/2,this.centerBound.west+2*(this.centerBound.east-this.centerBound.west)/3,this.centerBound.east);    
          break;   
       }   
}

         else if(3 > this.zoom >= 1){
         return gql`
            query{
            location(s:"has_parent=${this.user}, lat>${this.centerBound.south}, lat<${this.centerBound.north}, lon>${this.centerBound.west}, lon<${this.centerBound.east}, limit=false") {
            getTotal
          }
        }`;
         }
       },
       update(data) {
         if(this.zoom >= 10){
            return data;
         }else if(this.zoom < 10){
           //add lat and lon to representing markers
          switch(this.index){
            case 0:
            data.location.lat = 3/4*this.centerBound.north+1/4*this.centerBound.south;
            data.location.lon = this.centerBound.west+(this.centerBound.east-this.centerBound.west)/6;
            break;
            case 1:
            data.location.lat = 3/4*this.centerBound.north+1/4*this.centerBound.south;
            data.location.lon = this.centerBound.west+2*(this.centerBound.east-this.centerBound.west)/6;
            break;
            case 2:
            data.location.lat = 3/4*this.centerBound.north+1/4*this.centerBound.south;
            data.location.lon = this.centerBound.east-(this.centerBound.east-this.centerBound.west)/6;
            break;
            case 3:
            data.location.lat = 1/4*this.centerBound.north+3/4*this.centerBound.south;
            data.location.lon = this.centerBound.west+(this.centerBound.east-this.centerBound.west)/6;
            break;
            case 4:
            data.location.lat = 1/4*this.centerBound.north+3/4*this.centerBound.south;
            data.location.lon = this.centerBound.west+2*(this.centerBound.east-this.centerBound.west)/6;
            break;
           case 5:
            data.location.lat = 1/4*this.centerBound.north+3/4*this.centerBound.south;
            data.location.lon = this.centerBound.east-(this.centerBound.east-this.centerBound.west)/6; 
            break;  
          }

           return data;
         }
         
       }
     }

  },


watch:{
      userCenter:{ 
      handler(newValue, oldValue){
        console.log("the center changed :")
      },    
    },    
    location:{ 
      handler(newValue, oldValue){
        if(this.index < 5){
          this.index = this.index + 1;
        }
      },    
    }, 
   
  },

  methods: {
     parentBound: function(bound){
       this.userCenter = bound;
       this.centerBound = {
        //  west:bound.getSouthWest().wrap().lng,
        //  east:bound.getNorthEast().wrap().lng,
         west:bound.getWest(),
         east:bound.getEast(),
         south:bound.getSouth(),
         north:bound.getNorth(),
       }
       console.log("the difference is :"+(this.centerBound.west+(this.centerBound.east-this.centerBound.west)/3))
       console.log("the difference is :"+(this.centerBound.west+2*(this.centerBound.east-this.centerBound.west)/3))

       console.log("the west of centerBound :" + this.centerBound.west)
     },

     parentZoom: function(zoomLevel){
       this.zoom = zoomLevel;
       if(this.zoom == 10){
         console.log("the parent is 10")
         console.log("the parent bound"+this.centerBound.west+" , "+this.centerBound.east+" , "+this.centerBound.south+" , "+this.centerBound.north)
       }
       this.index = 0;
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
      sendQuery: function(lat1,lat2,lon1,lon2){
        return gql`
            query{
            location(s:"has_parent=${this.user}, lat>${lat1}, lat<${lat2}, lon>${lon1}, lon<${lon2}, limit=false") {
            getTotal
            } 
        }`;     
      }
    },
  
    mounted: function() {
    //get the session
    this.user = sessionStorage.getItem('user');
    this.index = 0;
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

</style>
