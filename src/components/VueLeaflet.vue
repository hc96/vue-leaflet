<template>

<div class="vue-leaflet" v-if ="!Object.keys(markers).length && !this.noLocation && this.hasMarker && addMarkers()"  >
<l-map style="width: 100%; height: 800px;" :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
     
    </l-map> 
</div>
  
<div class="vue-leaflet" v-else-if ="!Object.keys(markers).length && !this.noLocation && this.hasMarker && showAlert()" >

</div>


<div class="vue-leaflet" v-else-if ="!Object.keys(markers).length && this.noLocation" >
  <l-map style="width: 100%; height: 800px;" :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      
    </l-map>
</div>

<div class="vue-leaflet" v-else-if ="Object.keys(markers).length && abletoAdd() && this.noLocation" >
  <l-map style="width: 100%; height: 800px;" :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      
    </l-map>
</div>

<div class="vue-leaflet"  v-else-if="Object.keys(markers).length || !this.hasMarker">
<v-layout row>
    <v-dialog id="dialog" v-model="dialog" persistent max-width="600px"> 
      <v-card> 
        <v-card-title>
          <span class="headline">Add a New Location</span>
        </v-card-title>
        <v-card-text  grid-list>
        <v-form  ref="form"
                 v-model="valid"
                 lazy-validation>
          <v-container>
            <v-layout wrap>

              <v-flex xs12>
                <v-text-field
                  label="Legal Location Name*"
                  v-model="title"
                  :rules="nameRules"
                  required
                ></v-text-field>
              </v-flex>

              <v-flex xs12>
                 <v-select
                    v-model="vcategories"
                    :items="items"
                    :rules="[v=> v.length > 0 || 'Item is required']"
                    label="Categories*"
                    multiple
                    attach=true
                    required
                 ></v-select>
              </v-flex>
              
            </v-layout>
          </v-container>
          </v-form>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" flat @click="cancelDialog">Cancel</v-btn>
          <v-btn color="green darken-1" :disabled="!valid" flat @click="addNewLocation">{{confMsg}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>



<l-map :style="styleObject" :zoom="zoom" @click="addLocation" ref="map" :center="userLocation || center" @update:center="centerUpdate" @locationfound="onLocationFound">
     <l-tile-layer  layerType="base" :url="url" :attribution="attribution"></l-tile-layer> 
      <l-marker 
      v-for="marker in markers"
      :key="marker.id"
      @click="editMarker(marker.id)"
      ref="marker"
      :lat-lng.sync="marker.latlng">
        <l-popup :content="marker.content" ></l-popup>
      </l-marker>
      <v-locatecontrol ref="control" v-on:getLat="getLat"></v-locatecontrol>
     <v-geosearch :options="geosearchOptions" ></v-geosearch> 
</l-map>

<notifications group="notification" position="bottom right" />
</div>
</template>




<script>
import { LMap, LTileLayer, LMarker, LPopup, LControlLayers,LLayerGroup  } from 'vue2-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import VGeosearch from '@/components/Vue2LeafletGeosearch';
import L, { latLng, Icon, icon } from 'leaflet';
import Vue2LeafletLocatecontrol from './Vue2LeafletLocatecontrol';

export default {
  name: 'VueLeaflet',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    VGeosearch,
    LControlLayers,
    LLayerGroup,
    'v-locatecontrol': Vue2LeafletLocatecontrol
  },
  props:{
    noLocation: Boolean,
    mlocations: Array,
    ableAdd: Boolean,
  },
  data () {
    return {
      zoom: 12,
      center: L.latLng(51.0268533, 13.734821),
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      marker: L.latLng(51.0268533, 13.734821),
      markers: [],
      hasMarker: true,
      childValue: true,
      addDone: false,
      dialog: false,
      userLocation: L.latLng(51.063072, 13.736793),
      lat:'',
      lon:'',
      title:'',
      id: null,
      confMsg: '',
      msg:'',
      editItems:[],
      categories:[],
      vcategories:[],
      mcategories:[],
      newlocation:'',
      childLat:'',
      valid: true,
      nameRules: [
        v => !!v || 'Name is required',
      ],
      items: [
        'restaurants',
        'cinemas',
        'bars',
        'supermarkets'
      ],
      geosearchOptions: {
        provider: new OpenStreetMapProvider(),
        autoComplete: true, 
        autoCompleteDelay: 250,  
        searchLabel: 'Enter the place...',  
        showPopup: true,  
        maxMarkers: 10, 
      },
      styleObject:{
        width: '100%',
        height: '800px',
        cursor: '',
        'z-index': 0
      }
    
    }
  }, 
methods:{
   onLocationFound (event) {
      this.userLocation = event.latlng;
      this.center = this.userLocation;
    },

   getLat:function(setLat){
        this.childLat = setLat;
      },

  showAlert:function(){
    this.$emit('childByValue', this.childValue);
    alert(this.noLocation);
  },

  centerUpdate:function(center){
    this.center = center;
  },

  addMarker:function(msgs){

    this.msg = msgs;

    console.log('the button you clicked is:'+ msgs);
    if(msgs == 'UNDEFINED'){
        for ( var i=0; i < this.mlocations.length; ++i ) {
           let marker = {
             id: i+1,
             latlng: L.latLng(this.mlocations[i].lat, this.mlocations[i].lon),
             content: this.mlocations[i].title
          }
             this.markers.push(marker)
        }
      }else if(msgs == 'all'){
        this.hasMarker = true;
        this.markers.splice(0, this.markers.length);
        //this.$options.method.addmarkers();

     


      }else{
       var length = this.mlocations.length;
      // alert(length);
       this.markers.splice(0, this.markers.length);
           for ( var i=0; i < this.mlocations.length; ++i ) {
           for(var j=0; j < this.mlocations[i].categories.list.length; ++j){
            //alert(this.mlocations[i].categories.list[j].name);
             if(this.mlocations[i].categories.list[j].name == msgs){

               var lat2 = this.mlocations[i].lat;
               var lng2 = this.mlocations[i].lon;
               var lat1 = this.userLocation.lat;
               var lng1 = this.userLocation.lng;
               var radLat1 = lat1*Math.PI / 180.0;
               var radLat2 = lat2*Math.PI / 180.0;
               var a = radLat1 - radLat2;
               var  b = lng1*Math.PI / 180.0 - lng2*Math.PI / 180.0;
               var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
               Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
               s = s *6378.137 ;// EARTH_RADIUS;
               s = Math.round(s * 10000) / 10000;

               if(s < 30){
                console.log("the distance is less than 30 KM :"+ this.mlocations[i].title)
                console.log("the marker id of the location :"+ i)
                 let marker = {
                    id: i+1,
                    latlng: L.latLng(this.mlocations[i].lat, this.mlocations[i].lon),
                    content: this.mlocations[i].title
                   }
                     this.markers.push(marker);
               }
              
            }
          }
        }
         
         if(this.markers.length == 0){
         this.hasMarker = false;
           this.$notify({
               group: 'notification',
               type: 'warn',
               title: 'Important message',
               text: 'Hello user! No '+ msgs +' are found!',
             });
         }else{
            this.hasMarker = true;
         }
    } 

  },

   addMarkers:function(){
    console.log('The length of the markers'+ this.markers.length);
    for ( var i=0; i < this.mlocations.length; ++i ) {
         let marker = {
         id: i+1,
         latlng: L.latLng(this.mlocations[i].lat, this.mlocations[i].lon),
         content: this.mlocations[i].title
         }
      this.markers.push(marker);
        }
  },


  abletoAdd:function(){
    if(this.ableAdd == true){
      this.styleObject.cursor = 'crosshair';
    }else{
      this.styleObject.cursor = '';
    }
  },

  addLocation(event){
    if(this.ableAdd == true){
    this.lat = event.latlng.lat;
    this.lon = event.latlng.lng;
    this.confMsg = 'Add new location';
    this.title = '';
    this.vcategories =[];
    this.dialog = true;
    }
  },

  cancelDialog:function(){
  this.dialog = false;
  this.$emit('added', this.addDone); 
  },

  editMarker(id){

    this.title = this.mlocations[id-1].title;
    this.vcategories = [];
    this.lat = this.mlocations[id-1].lat;
    this.lon = this.mlocations[id-1].lon;

    this.confMsg = 'Edit the Location'; 
    console.log("id of clicked marker"+id);
    console.log("title of clicked marker:"+this.mlocations[id-1].title);
    console.log("categories of clicked marker:"+this.mlocations[id-1].categories.list);
    console.log("info of clicked marker:"+this.title+this.vcategories+this.lat+this.lon);
  

    for ( var i=0; i < this.mlocations[id-1].categories.list.length; ++i ) {
      this.vcategories[i] = this.mlocations[id-1].categories.list[i].name;
    }    

    console.log(this.vcategories);

    this.id = id;
    this.dialog = true;


  },

addNewLocation:function(){
  this.hasMarker = true;

  if (this.$refs.form.validate()) {
    //alerted form for adding new locations
    if(this.confMsg == 'Add new location'){
      this.snackbar = true
      this.dialog = false;
      this.mcategories[0] = '';

    for ( var i=1; i <= this.vcategories.length; ++i ) {
      if(i!=this.vcategories.length)
       this.mcategories[i] = '{\"name\":\"'+this.vcategories[i-1]+'\"},';
       else
       this.mcategories[i] = '{\"name\":\"'+this.vcategories[i-1]+'\"}';
       this.mcategories[0] += this.mcategories[i];
      }  
    
    // use JSON.stringify() instead of creating a JSON string yourself
    this.newlocation = '{\"title\":\"'+this.title+'\",\"lat\":\"'+this.lat+'\",\"lon\":\"'+this.lon+'\",\"categories\":{\"list\":['+this.mcategories[0]+']}}';
     var len = this.mlocations.length;

      let marker = {
         id: this.mlocations.length+1,
         latlng: L.latLng(this.lat, this.lon),
         content: this.title
         }
         
    this.markers.push(marker);
    this.mlocations[len] = JSON.parse(this.newlocation);

  

    axios.get('http://carabackend.local/form/', {
    params: {
      // TODO: use the object directly (e.g. this.title ), don't parse every time 
      name: JSON.parse(this.newlocation).title,
      latitude:JSON.parse(this.newlocation).lat,
      longitude:JSON.parse(this.newlocation).lon,
      categories:this.vcategories,
    }
  })
  .then(function (response) {
    // TODO: processwire should return an ID of the newly created location
    // instead of using this.markers.length + 1, use the ID that ProcessWire
    // returned

   
    // this.markers.push(marker) will be done here instead of before sending the data to processwire
    console.log("1 response from the processwire :"+response.data);
    console.log("2 response from the processwire :"+response.status);
    console.log("3 response from the processwire :"+response.statusText);
    console.log("4 response from the processwire :"+response.headers.date);
    console.log("5 response from the processwire :"+response.config.params.id);
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  }); 

  this.$emit('added', this.addDone); 
  }else{
   //alerted form for editing the locations
    this.snackbar = true
    this.dialog = false;

    console.log("id of edited marker :"+this.id)
    console.log("categories of this marker :"+this.vcategories)
    console.log("the length of this markers :"+this.markers.length)
    
    alert(this.msg);
    this.mlocations[this.id-1].title = this.title;
    for(let i=0;i<this.markers.length;i++){
      if(this.markers[i].id == this.id){
        this.markers[i].content = this.title;
        console.log(this.markers[i].content)
        console.log(this.vcategories.indexOf(this.msg))
        if(this.vcategories.indexOf(this.msg) == -1)
        //console.log(this.markers[i].content)
        //this.markers.pop(this.markers[i]);
        this.markers.splice(i, 1);
      }   
     }
   

    this.mlocations[this.id-1].categories.list.splice(0, this.mlocations[this.id-1].categories.list.length);

    for ( var i=0; i < this.vcategories.length; ++i ) {
       this.mlocations[this.id-1].categories.list.push(JSON.parse('{\"name\":\"'+this.vcategories[i]+'\"}')); 
    }  

    

    console.log("edit the locations :"+this.mlocations[this.id-1].categories.list.length)
    console.log("edit the locations :"+this.mlocations[this.id-1].title)



    //store this new location to the processwire
    axios.get('http://carabackend.local/form/', {
    params: {
      name: this.title,
      latitude:this.lat.substr(0,7),
      longitude:this.lon.substr(0,7),
      categories:this.vcategories,
    }
  })
  .then(function (response) {
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  }); 

     
  }
    
  }
  }, 
  
},
created(){

},

mounted() {
  const map = this.$refs.map.mapObject;
    map.locate({
      enableHighAccuracy: true,
      maximumAge: 60000
    })

},

}
</script>

<style scoped>
@import "leaflet/dist/leaflet.css";
@import "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css";

.v-dialog__content{
  justify-content:end;
  align-items:flex-end;
  width:35%;
}
</style>