<template>
  <div style="display: none;">
    <slot v-if="ready"></slot>
  </div>
</template>

<script>
import L, { DomEvent } from 'leaflet';
import { findRealParent, propsBinder } from 'vue2-leaflet';
import "leaflet.locatecontrol";

const props = {
  options: {
    type: Object,
    lat:String,

    default() { return {}; },
  },
  visible: {
    type: Boolean,
    custom: true,
    default: true
  }
}

export default {
  name: "Vue2LeafletLocatecontrol",

  props: props,

  data() {
    return {
      ready: false,
      setLat: 'hahahhaah',
    }
  },

  beforeDestroy() {
    this.parentContainer.removeLayer(this);
  },

  watch:{
  
  },

  methods:{
    latlng:function(){
      this.setLat = getLatlng();
      this.options.lat='dfsdf';
      this.$emit('getLat', this.setLat);
    },
  },

  mounted() {
    this.mapObject = L.control.locate(this.options);
    DomEvent.on(this.mapObject, this.$listeners);
    propsBinder(this, this.mapObject, props);
    this.ready = true;
    this.parentContainer = findRealParent(this.$parent);
    this.mapObject.addTo(this.parentContainer.mapObject, !this.visible);
  }
}
</script>

<style>
@import "leaflet.locatecontrol/dist/L.Control.Locate.css";
</style>
