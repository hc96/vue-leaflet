<!--
This component adds a GeoSearchControl to Leaflet instance
 -->
<template lang="html">
  <div>
  </div>
</template>

<script>
// import L from 'leaflet';
import { GeoSearchControl } from 'leaflet-geosearch';
import "@/components/js/unibox.min.js";


export default {
  props: {
    options: {
      required: true,
    },
    
  },
  name: 'v-geosearch',
  data() {
    return {
      searchValue: '',
      searchControl: Object,
    };
  },
  mounted() {
    this.add();
    
  },
  beforeDestroy() {
    this.remove();
  },
  methods: {
    doThing: function(){
      this.searchValue = document.getElementById("searchBox").value;
    },

    deferredMountedTo(parent) {
      const searchControl = new GeoSearchControl(this.options);
      parent.addControl(searchControl);

    // document.getElementById("searchBox").addEventListener('input', this.doThing);
    // this.$emit('parentSearch', this.searchValue)

    },
    remove() {
      if (this.markerCluster) {
        this.$parent.removeLayer(this.markerCluster);
      }      
    },
    add() {
      if (this.$parent._isMounted) {
        this.deferredMountedTo(this.$parent.mapObject);
      }
    },
  },
  watch:{
    searchValue:{
      handler(newSearch, oldSearch){
      // search the marker
      //console.log("change of the input :" + this.searchValue)
      this.$emit('parentSearch', this.searchValue)
      }
    }

  },
};
</script>

<style>
@import "./css/unibox.min.css";
</style>