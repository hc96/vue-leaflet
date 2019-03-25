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
    <v-dialog id="dialog" v-model="dialog" persistent max-width="600px" absolute bottom right> 
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
                  :value="editName"
                  required
                ></v-text-field>
              </v-flex>

              <v-flex xs12>
                 <v-select
                    v-model="categories"
                    :items="items"
                    :rules="[v=> v.length > 0 || 'Item is required']"
                    label="Categories*"
                    :value="editItems"
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



<l-map :style="styleObject" :zoom="zoom" @click="addLocation" :center="center">
     <l-tile-layer  layerType="base" :url="url" :attribution="attribution"></l-tile-layer> 
      <l-marker 
      v-for="marker in markers"
      :key="marker.id"
      @click="editMarker(marker.id)"
      :lat-lng.sync="marker.latlng">
        <l-popup :content="marker.content" ></l-popup>
      </l-marker>
      <v-locatecontrol/>
     <v-geosearch :options="geosearchOptions" ></v-geosearch> 
</l-map>

<notifications group="notification" position="bottom right" />
</div>
</template>




<script>
import { LMap, LTileLayer, LMarker, LPopup, LControlLayers,LLayerGroup  } from 'vue2-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import VGeosearch from '@/components/Vue2LeafletGeosearch';
import { latLng, Icon, icon } from 'leaflet';
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
      lat:'',
      lon:'',
      title:'',
      editName: '',
      confMsg: '',
      editItems:[],
      categories:[],
      mcategories:[],
      newlocation:'',
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

  showAlert:function(){
    this.$emit('childByValue', this.childValue);
    alert(this.noLocation);
  },

  addMarker:function(msgs){
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
        this.$options.method.addmarkers();
      }else{
       var length = this.mlocations.length;
       this.markers.splice(0, this.markers.length);
           for ( var i=0; i < this.mlocations.length; ++i ) {
           for(var j=0; j < this.mlocations[i].categories.list.length; ++j){
             if(this.mlocations[i].categories.list[j].name == msgs){
              let marker = {
               id: i+1,
               latlng: L.latLng(this.mlocations[i].lat, this.mlocations[i].lon),
               content: this.mlocations[i].title
             }
               this.markers.push(marker)
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
    console.log('The length of the mlocations'+ this.markers.length);
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

  addNew:function(newlocation){
    var len = this.mlocations.length;
    const apiUrl ='http://carabackend.local/form/?name=';
  
      let marker = {
         id: this.markers.length + 1,
         latlng: L.latLng(JSON.parse(newlocation).lat, JSON.parse(newlocation).lon),
         content: JSON.parse(newlocation).title
         }
      this.markers.push(marker)
      this.mlocations[len] = JSON.parse(newlocation);
      
    axios.get('http://carabackend.local/form/', {
    params: {
      name: JSON.parse(newlocation).title,
      latitude:JSON.parse(newlocation).lat,
      longitude:JSON.parse(newlocation).lon,
      categories:this.mlocations[len].categories.list[0].name,
    }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  });    
  },

  addLocation(event){
    if(this.ableAdd == true){
    this.lat = event.latlng.lat;
    this.lon = event.latlng.lng;
    this.confMsg = 'Add new location';
    this.dialog = true;
    }
  },

  cancelDialog:function(){
   this.dialog = false;
   this.$emit('added', this.addDone);
  },

  editMarker(id){
    this.title = this.markers[id-1].content;
    this.categories = this.mlocations[id-1].categories.list;
    this.lat = this.markers[id-1].latlng.lat;
    this.lon = this.markers[id-1].latlng.lng;

    this.confMsg = 'edit the location';
   
    for ( var i=0; i < this.mlocations[id-1].categories.list.length; ++i ) {
      this.categories[i] =   this.mlocations[id-1].categories.list[i].name;
    }  

    this.dialog = true;

  },

addNewLocation:function(){
  this.hasMarker = true;
  if (this.$refs.form.validate()) {
    this.snackbar = true
    this.dialog = false;
    this.mcategories[0] = '';

    for ( var i=1; i <= this.categories.length; ++i ) {
      if(i!=this.categories.length)
       this.mcategories[i] = '{\"name\":\"'+this.categories[i-1]+'\"},';
       else
       this.mcategories[i] = '{\"name\":\"'+this.categories[i-1]+'\"}';
       this.mcategories[0] += this.mcategories[i];
      }  
    
    this.newlocation = '{\"title\":\"'+this.title+'\",\"lat\":\"'+this.lat+'\",\"lon\":\"'+this.lon+'\",\"categories\":{\"list\":['+this.mcategories[0]+']}}';
     var len = this.mlocations.length;
      let marker = {
         id: this.markers.length + 1,
         latlng: L.latLng(JSON.parse(this.newlocation).lat, JSON.parse(this.newlocation).lon),
         content: JSON.parse(this.newlocation).title
         }
         this.markers.push(marker)
         
      this.mlocations[len] = JSON.parse(this.newlocation);
  

    axios.get('http://carabackend.local/form/', {
    params: {
      name: JSON.parse(this.newlocation).title,
      latitude:JSON.parse(this.newlocation).lat,
      longitude:JSON.parse(this.newlocation).lon,
      categories:this.categories,
    }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  }); 

  this.$emit('added', this.addDone);
  }
  }, 
  
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