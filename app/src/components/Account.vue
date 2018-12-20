<template>
  <div>
    <v-text-field
      name="email"
      label="Email"
      type="email"
      box
      autofocus
      prepend-icon="email"
      v-model="email"
    ></v-text-field>
    <v-text-field
      name="password"
      label="Password"
      type="password"
      box
      prepend-icon="lock"
      v-model="password"
    ></v-text-field>
    <v-btn color="primary" @click="onContinue">Continue</v-btn>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: null,
      password: null
    };
  },
  methods: {
    onContinue() {
      this.$emit('continue');
    }
  }
};
</script>