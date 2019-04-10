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

       // search box
      sxQuery("#searchBox").unibox({
        // REQUIRED
        suggestUrl: 'http://carabackend.local/searchmarker/?query=', // the URL that provides the data for the suggest -> this is just an example
        // suggestUrl: 'http://yourserver.com/suggests?query=', // the URL that provides the data for the suggest
        ivfImagePath: 'http://yourserver.com/images/ivf/', // the base path for instant visual feedback images
        // OPTIONAL
        instantVisualFeedback: 'all', // where the instant visual feedback should be shown, 'top', 'bottom', 'all', or 'none', default: 'all'
        throttleTime: 100, // the number of milliseconds before the suggest is triggered after finished input, default: 300ms
        extraHtml: undefined, // extra HTML code that is shown in each search suggest
        highlight: true, // whether matched words should be highlighted, default: true
        queryVisualizationHeadline: '', // A headline for the image visualization, default: empty
        animationSpeed: 200, // speed of the animations, default: 300ms
        callbacks: {
            enter: function(text,link){console.log('enter callback: '+text);}, // callback on what should happen when enter is pressed, default: undefined, meaning the link will be followed
            enterResult: function(text,link){console.log('enter callback result: ' + text);}, // callback on what should happen when enter is pressed on a result or a suggest is clicked
        },
        placeholder: 'Search for something',
        minChars: 3, // minimum number of characters before the suggests shows, default: 3
        suggestOrder: [], // the order of the suggests
        suggestSelectionOrder: [], // the order of how they should be selected
        noSuggests: '<b>We haven\'t found anything for you, <u>sooorrryyy</u></b>',
        emptyQuerySuggests: {
                        "suggests":{
                            "Markers":[
                                {"name":"youbility"},
                                {"name":"marker 2"}
                            ]
                        }
                    },
         maxWidth: 200 // the maximum width of the suggest box, default: as wide as the input box
    // apply the settings to an input that should get the unibox
    // apply to multiple boxes
});

    document.getElementById("searchBox").addEventListener('input', this.doThing);
    this.$emit('parentSearch', this.searchValue)

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