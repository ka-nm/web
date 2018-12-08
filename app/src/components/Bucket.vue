<template>
  <v-form>
    <v-text-field type="number" label="Total" v-model="total" @change="update"></v-text-field>
    <v-text-field type="number" label="Current" v-model="current" @change="update"></v-text-field>
    <v-text-field type="number" label="Promise" v-model="promise" @change="update"></v-text-field>
  </v-form>
</template>

<script>
export default {
  props: {
    value: Object
  },
  data() {
    return {
      total: 0,
      current: 0,
      promise: 0
    };
  },
  watch: {
    value(newValue) {
      this.total = newValue.total;
      this.current = newValue.current;
      this.promise = newValue.promise;
    }
  },
  methods: {
    update() {
      this.$emit("input", {
        total: +this.total,
        current: +this.current,
        promise: +this.promise
      });
    }
  }
};
</script>