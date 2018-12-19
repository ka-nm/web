import Vue from 'vue';

Vue.use({
  install: function (Vue) {
    Vue.prototype.$color = function (goalColor) {
      return `rgb(${(goalColor >> 16) & 255}, ${(goalColor >> 8) & 255}, ${goalColor & 255})`;
    }
  }
});