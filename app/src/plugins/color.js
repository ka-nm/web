import Vue from 'vue';

Vue.use({
  install: function (Vue) {
    Vue.prototype.$color = function (bucketColor) {
      return `rgb(${(bucketColor >> 16) & 255}, ${(bucketColor >> 8) & 255}, ${bucketColor & 255})`;
    }
  }
});