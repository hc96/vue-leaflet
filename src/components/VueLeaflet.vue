<template>
  <div
    class="vue-leaflet"
    v-if="!Object.keys(markers).length && !this.noLocation && this.hasMarker && addMarkers()"
  >
    <l-map style="width: 100%; height: 800px;" :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
    </l-map>
  </div>

  <div
    class="vue-leaflet"
    v-else-if="!Object.keys(markers).length && !this.noLocation && this.hasMarker && showAlert()"
  ></div>

  <div class="vue-leaflet" v-else-if="!Object.keys(markers).length && this.noLocation">
    <l-map style="width: 100%; height: 800px;" :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
    </l-map>
  </div>

  <div
    class="vue-leaflet"
    v-else-if="Object.keys(markers).length && abletoAdd() && this.noLocation"
  >
    <l-map style="width: 100%; height: 800px;" :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
    </l-map>
  </div>

  <div class="vue-leaflet" v-else-if="Object.keys(markers).length || !this.hasMarker">

    <!-- dialog for deleting the markers -->
    <v-layout row justify-center>
    <v-dialog v-model="delDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="headline">Delete this marker?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" flat @click="delDialog = false">No</v-btn>
          <v-btn color="green darken-1" flat @click="deleteMarker">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>

  <!-- dialog for adding and editing the markers -->
    <v-layout row>
      <v-dialog id="dialog" v-model="dialog" persistent max-width="600px">
        <v-card>
    <!-- floating button -->
          <v-btn
              color="red"
              dark
              small
              absolute
              right
              fab
              v-show="showDelete"
              @click="deleteDialog()"
          >
            <v-icon>delete</v-icon>
          </v-btn>
          <v-card-title>
            <span class="headline">{{confMsg}}</span>
          </v-card-title>
          <v-card-text grid-list>
            <v-form ref="form" v-model="valid" lazy-validation>
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
                   <v-combobox
                      v-model="vcategories"
                      :items="items"
                      :rules="[v=> v.length > 0 || 'Item is required']"
                      label="Categories*"
                      chips
                      clearable
                      prepend-icon="filter_list"
                      solo
                      attach="true"
                      multiple
                    >
                    <template v-slot:selection="data">
                    <v-chip
                        :selected="data.selected"
                        close
                        @input="remove(data.item)"
                      >
                          <strong>{{ data.item }}</strong>&nbsp;
                          <span>(category)</span>
                        </v-chip>
                      </template>
                    </v-combobox>
                  </v-flex>

                </v-layout>
              </v-container>
            </v-form>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" flat @click="cancelDialog">Cancel</v-btn>
            <v-btn
              color="green darken-1"
              :disabled="!valid"
              flat
              @click="addNewLocation"
            >{{confMsg}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
    <l-map
      :style="styleObject"
      :zoom="zoom"
      @click="addLocation"
      ref="map"
      :center="userLocation || center"
      @locationfound="onLocationFound"
      @update:center="centerUpdate"
      @geosearch_foundlocations ="onLocationFound"
    >
      <l-tile-layer layerType="base" :url="url" :attribution="attribution"></l-tile-layer>
       <v-marker-cluster :options="clusterOptions" @clusterclick="click()">
      <l-marker
        v-for="marker in markers"
        :key="marker.id"
        @click="editMarker(marker.id)"
        ref="marker"
        :lat-lng.sync="marker.latlng"
        :icon="marker.icon"
      >
        <l-popup>
          <div>
             <p>{{marker.content}}</p>
            <span v-show="showParagraph" v-for="category in vcategories" :key="category.id">
                  {{ category }}
            </span>
          </div>
        </l-popup>
      </l-marker>
      </v-marker-cluster>
      <v-locatecontrol ref="control" v-on:getLat="getLat"></v-locatecontrol>
      <v-geosearch :options="geosearchOptions" v-on:parentSearch="parentSearch">
      </v-geosearch>
    </l-map>

    <notifications group="notification" position="bottom right"/>
  </div>
</template>




<script>
import {LMap,LTileLayer,LMarker,LPopup,LControlLayers,LLayerGroup,LIcon,LTooltip} from "vue2-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import VGeosearch from "@/components/Vue2LeafletGeosearch";
import L, { latLng, Icon, icon } from "leaflet";
import Vue2LeafletLocatecontrol from "./Vue2LeafletLocatecontrol";
import Vue2LeafletMarkerCluster from './Vue2LeafletMarkercluster'

delete L.Icon.Default.prototype._getIconUrl;


L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png")
});


export default {
  name: "VueLeaflet",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    VGeosearch,
    LControlLayers,
    LLayerGroup,
    LTooltip,
    LIcon,
    "v-locatecontrol": Vue2LeafletLocatecontrol,
    'v-marker-cluster': Vue2LeafletMarkerCluster
  },
  props: {
    noLocation: Boolean,
    mlocations: Array,
    ableAdd: Boolean,
  },
  data() {
    return {
      zoom: 12,
      center: L.latLng(51.063072, 13.736793),
      url: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
      attribution:'© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      marker: L.latLng(51.0268533, 13.734821),
      markers: [],
      hasMarker: true,
      childValue: true,
      addDone: false,
      dialog: false,
      delDialog: false,
      userLocation: null,
      showDelete: false,
      map: null,
      icon:'https://raw.githubusercontent.com/hc96/vue-leaflet/master/icons/restaurant.png',
      lat: "",
      lon: "",
      title: "",
      id: null,
      confMsg: "",
      msg: "all",
      editItems: [],
      categories: [],
      vcategories: [],
      newLocation: null,
      childLat: "",
      search:'',
      valid: true,
      nameRules: [v => !!v || "Name is required"],
      items: ["restaurants", "cinemas", "bars", "supermarkets"],
      geosearchOptions: {
        provider: new OpenStreetMapProvider(),
        autoComplete: true,
        autoCompleteDelay: 250,
        searchLabel: "Enter the place...",
        showPopup: true,
        maxMarkers: 10,
      },
      styleObject: {
        width: "100%",
        height: "800px",
        cursor: "",
        "z-index": 0
      },
      defaultIcon: L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/hc96/vue-leaflet/master/icons/supermarket.png",
        iconSize: [30, 35],
        iconAnchor: [0, 0],
        popupAnchor: [13, 1]
      }),
      showParagraph: true,
      clusterOptions: {},
    };
  },
  methods: {
    click: function (e) {
        //alert("clusterclick")
      },
     parentSearch: function (searchValue) {
        // childValue is the value from the child component
        this.search = searchValue;
        //console.log("the user input of search is :" + this.search)
      },
    //remove the cateogory from the chips
    remove (item) {
        this.vcategories.splice(this.vcategories.indexOf(item), 1)
        this.vcategories = [...this.vcategories]
      },

    deleteDialog() {
      console.log("the name of deleting marker is :" + this.mlocations[this.id-1].title)
      this.delDialog = true;
    },

    deleteMarker:function(){
     
       axios.get("http://carabackend.local/form/", {
              params: {
                name: this.mlocations[this.id-1].title,
                delete: true,
              }
            })
            .then(response => {
              console.log("the name of deleted marker is :" + this.mlocations[this.id-1].title)
              // if successfully responsed, change the marker info(title, categories)
              this.mlocations.splice(this.id-1,1);

              // traverse  the current markers[], find the edited marker by id, pop this marker in categories it doesn't belong to
              for (let i = 0; i < this.markers.length; i++) {
                if (this.markers[i].id == this.id) {
                  console.log(this.markers[i].content)
                    this.markers.splice(i, 1);
                }
              }

            })
            .catch(function(error) {
              console.log(error);
            })
            .then(function() {
              // always executed
            });


      this.delDialog = false;
      
    },

    onLocationFound(event) {
      this.userLocation = event.latlng;
      this.center = this.userLocation;
    },

    getLat: function(setLat) {
      this.childLat = setLat;
    },

    showAlert: function() {
      //used to popup the window showing 'no locations found'
      this.$emit("childByValue", this.childValue);
      alert(this.noLocation);
    },

    centerUpdate: function(center) {
      this.center = center;
    },

    addMarker: function(msgs) {
      //display the markers of specific category

      this.msg = msgs;
      var length = this.mlocations.length;
      console.log("the category you clicked is :" + msgs);

      if (msgs == "UNDEFINED") {
        for (let i = 0; i < this.mlocations.length; ++i) {
          let marker = {
            id: i + 1,
            latlng: L.latLng(this.mlocations[i].lat, this.mlocations[i].lon),
            content: this.mlocations[i].title
          };
          this.markers.push(marker);
        }
      } else if (msgs == "all") {
        this.hasMarker = true;
        this.markers.splice(0, this.markers.length);
        //this.$options.method.addmarkers();
      } else {
        this.markers.splice(0, this.markers.length);
        console.log("the msg is :" + msgs);

        //display different icons of makers for different categories
        this.changeIcon(msgs);

        for (let i = 0; i < this.mlocations.length; ++i) {
          for (let j = 0; j < this.mlocations[i].categories.list.length; ++j) {
            //find the markers of clicked category
            if (this.mlocations[i].categories.list[j].name == msgs) {
              //calculate the distance between current location and the markers found
              var lat2 = this.mlocations[i].lat;
              var lng2 = this.mlocations[i].lon;
              var lat1 = this.userLocation.lat;
              var lng1 = this.userLocation.lng;
              var radLat1 = (lat1 * Math.PI) / 180.0;
              var radLat2 = (lat2 * Math.PI) / 180.0;
              var a = radLat1 - radLat2;
              var b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
              var s =
                2 *
                Math.asin(
                  Math.sqrt(
                    Math.pow(Math.sin(a / 2), 2) +
                      Math.cos(radLat1) *
                        Math.cos(radLat2) *
                        Math.pow(Math.sin(b / 2), 2)
                  )
                );
              s = s * 6378.137; // EARTH_RADIUS;
              s = Math.round(s * 10000) / 10000;

              if (s < 30) {
                let marker = {
                  id: i + 1,
                  latlng: L.latLng(
                    this.mlocations[i].lat,
                    this.mlocations[i].lon
                  ),
                  content: this.mlocations[i].title,
                  icon: this.defaultIcon
                };
                this.markers.push(marker);

                console.log(
                  "the distance is less than 30 KM :" + this.mlocations[i].title
                );
                console.log("the marker id of the location :" + i);
              }
            }
          }
        }
        //if no markers found, notify user through 'no locations found' notification
        if (this.markers.length == 0) {
          //if length of markers[] is 0, prevent displaying all locations on the map
          this.hasMarker = false;
          this.$notify({
            group: "notification",
            type: "warn",
            title: "Important message",
            text: "Hello user! No " + msgs + " are found!"
          });
        } else {
          this.hasMarker = true;
        }
      }
    },

    addMarkers: function() {
      //add all the markers when initialization
      //alert(this.mlocations)
      for (let i = 0; i < this.mlocations.length; ++i) {
        console.log(
          "the first category of this marker is :" +
            this.mlocations[i].categories.list[0].name
        );
        let category = this.mlocations[i].categories.list[0].name;
        this.changeIcon(category);

        let marker = {
          id: i + 1,
          latlng: L.latLng(this.mlocations[i].lat, this.mlocations[i].lon),
          content: this.mlocations[i].title,
          icon: this.defaultIcon
        };

        this.markers.push(marker);
      }

      console.log("The length of the markers :" + this.markers.length);
    },

    changeIcon: function(category) {
      switch (category) {
        case "restaurants":
          this.defaultIcon = L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/hc96/vue-leaflet/master/icons/restaurant.png",
              iconSize: [30, 35],
              iconAnchor: [0, 0],
              popupAnchor: [13, 1]
          });
          break;
        case "cinemas":
          this.defaultIcon = L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/hc96/vue-leaflet/master/icons/cinemas.png",
              iconSize: [30, 35],
              iconAnchor: [0, 0],
              popupAnchor: [13, 1]
          });
          break;
        case "bars":
          this.defaultIcon = L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/hc96/vue-leaflet/master/icons/bars.png",
              iconSize: [30, 35],
              iconAnchor: [0, 0],
              popupAnchor: [13, 1]
          });
          break;
        case "supermarkets":
          this.defaultIcon = L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/hc96/vue-leaflet/master/icons/supermarket.png",
              iconSize: [30, 35],
              iconAnchor: [0, 0],
              popupAnchor: [13, 1]
          });
          break;
      }
    },

    abletoAdd: function() {
      //used to change the shape of the cursor
      if (this.ableAdd == true) {
        this.styleObject.cursor = "crosshair";
      } else {
        this.styleObject.cursor = "";
      }
    },

    addLocation(event) {
      //popup the form dialog, get the lat and lon of clicked point
      if (this.ableAdd == true) {
        this.lat = event.latlng.lat;
        this.lon = event.latlng.lng;
        this.confMsg = "Add new location";
        this.showDelete = false;
        this.title = "";
        this.vcategories = [];
        this.dialog = true;
      }
    },

    cancelDialog: function() {
      this.dialog = false;
      this.$emit("added", this.addDone);
    },

    editMarker(id) {
      //display the clicked marker information on the dialog
      //get the new data of clicked marker
      this.title = this.mlocations[id - 1].title;
      this.vcategories = [];
      this.lat = this.mlocations[id - 1].lat;
      this.lon = this.mlocations[id - 1].lon;
      this.confMsg = "Edit the location";
      this.showDelete = true;
      for (let i = 0; i < this.mlocations[id - 1].categories.list.length; ++i) {
        this.vcategories[i] = this.mlocations[id - 1].categories.list[i].name;
      }

      console.log("id of clicked marker :" + id);
      console.log("name of clicked marker :" + this.title);
      console.log("coordinates of clicked marker :" + this.lat + "," + this.lon);
      console.log("categories of clicked marker :" + this.vcategories);

      this.id = id;
      this.dialog = true;
    },

    addNewLocation: function() {
      // add new location or edit the location if 'confirm' button clicked
      this.hasMarker = true;
      var len = this.mlocations.length;

      if (this.$refs.form.validate()) {
        // alerted form for adding new locations
        if (this.confMsg == "Add new location") {
          this.snackbar = true;
          this.dialog = false;

          // JSON object for the new location
          this.newLocation = {
            title: this.title,
            lat: this.lat,
            lon: this.lon,
            categories: {
              list: []
            }
          };

          // vcategories[] for categories selected by users
          for (let i = 0; i < this.vcategories.length; ++i) {
            this.newLocation.categories.list.push(
              JSON.parse('{"name":"' + this.vcategories[i] + '"}')
            );
          }

          this.changeIcon(this.vcategories[0]);
          // create a new marker
          let marker = {
            id: this.mlocations.length + 1,
            latlng: L.latLng(this.lat, this.lon),
            content: this.title,
            icon: this.defaultIcon
          };

          // pass the new location to the processwire
          axios
            .get("http://carabackend.local/form/", {
              params: {
                name: this.title,
                latitude: this.lat,
                longitude: this.lon,
                categories: this.vcategories
              }
            })
            .then(response => {
              // if successfully responsed, then add the new marker to the map
              this.markers.push(marker);
              this.mlocations[len] = this.newLocation;
            })
            .catch(function(error) {
              console.log(error);
            })
            .then(function() {
              // always executed
            });

          // used for automatically switch off the toggle
          this.$emit("added", this.addDone);
        } else {
          // dialog for editing the locations
          this.snackbar = true;
          this.dialog = false;

          console.log("id of edited marker :" + this.id);
          console.log(
            "old name of the edited location :" +
              this.mlocations[this.id - 1].title
          );
          console.log("new name of edited marker :" + this.title);
          console.log("the length of this markers :" + this.markers.length);

          // pass changes of new location to the processwire
          axios
            .get("http://carabackend.local/form/", {
              params: {
                name: this.title,
                latitude: this.lat.substr(0, 7),
                longitude: this.lon.substr(0, 7),
                categories: this.vcategories
              }
            })
            .then(response => {
              // if successfully responsed, change the marker info(title, categories)
              this.mlocations[this.id - 1].title = this.title;
              this.mlocations[this.id - 1].categories.list.splice(0,this.mlocations[this.id - 1].categories.list.length);
              for (let i = 0; i < this.vcategories.length; ++i) {
                this.mlocations[this.id - 1].categories.list.push(JSON.parse('{"name":"' + this.vcategories[i] + '"}')
                );
              }

              // traverse  the current markers[], find the edited marker by id, pop this marker in categories it doesn't belong to
              for (let i = 0; i < this.markers.length; i++) {
                if (this.markers[i].id == this.id) {
                  this.markers[i].content = this.title;
                  console.log(this.markers[i].content);
                  console.log(this.vcategories.indexOf(this.msg));
                  if (this.msg != "all" &&this.vcategories.indexOf(this.msg) == -1)
                    this.markers.splice(i, 1);
                }
              }
            })
            .catch(function(error) {
              console.log(error);
            })
            .then(function() {
              // always executed
            });
        }
      }
    }
  },

  created() {},

  beforeMount: function() {
    var self = this;

    const map = self.$refs.map.mapObject;

    map.locate({
      setView: true,
      enableHighAccuracy: true,
      maximumAge: 60000
    });
    map.on("locationfound", onLocationFound);
    function onLocationFound(e) {
      var radius = e.accuracy / 2;

      L.marker(e.latlng)
        .addTo(map)
        .bindPopup("You are within " + radius + " meters from this point")
        .openPopup();

      L.circle(e.latlng, radius).addTo(map);
    }
  },

  watch:{
    search:{
      handler(newSearch, oldSearch){
      // search the marker
      if(this.search != '' && this.markers.length != 0){
      let index
      for(index in this.markers){
           if(this.search == this.markers[index].content){
             let refMarker = 'element' + this.markers[index].id;
             const map = this.$refs["map"].mapObject;
             map.setView(this.markers[index].latlng, 16);
             this.$refs.marker[index].mapObject.openPopup();
           }
       }
    }
      
      }
    }

  },

  mounted: function() {
    
    setTimeout(() => {
        console.log('done')
        this.$nextTick(() =>{
          this.clusterOptions = { 
            disableClusteringAtZoom: 11,
            // iconCreateFunction: (cluster) => {
            //         const html = `<span>${cluster.getChildCount()}</span>`;
            //         return L.divIcon({
            //             className: `custom-cluster-icon`,
            //             html,
            //             iconSize: [48, 52],
            //             iconAnchor: [24, 52]
            //         });
            //     }
          }
        });
      }, 5000);

// locate the user
    var self = this;

    const map = self.$refs.map.mapObject;

    map.locate({
      setView: true,
      enableHighAccuracy: true,
      maximumAge: 60000
    });

    map.on("locationfound", onLocationFound);
    function onLocationFound(e) {
      var radius = e.accuracy / 2;

      this.center = e.latlng;

      L.marker(e.latlng)
        .addTo(map)
        .bindPopup("You are within " + radius + " meters from this point")
        .openPopup();

      L.circle(e.latlng, radius).addTo(map);
    };



  }
};
</script>

<style>
@import "leaflet/dist/leaflet.css";
@import "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css";
@import "leaflet.markercluster/dist/MarkerCluster.css";
@import "leaflet.markercluster/dist/MarkerCluster.Default.css";

.v-dialog__content {
  justify-content: end;
  align-items: flex-end;
  width: 35%;
}

</style>