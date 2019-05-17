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
    deferredMountedTo(parent) {
      const searchControl = new GeoSearchControl(this.options);
      parent.addControl(searchControl);

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
};
</script>

<style>
@import "./css/unibox.min.css";
</style>