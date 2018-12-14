<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Target Device</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-text-field
        name="deviceId"
        label="Device"
        type="text"
        prepend-icon="memory"
        v-model="deviceId"
      ></v-text-field>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        @click="onSubmit"
        @keyup.enter="onSubmit"
        :disabled="!deviceId || isBusy"
      >Submit
        <v-icon right dark>cloud_upload</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      isBusy: false,
      deviceId: null
    };
  },
  methods: {
    ...mapActions(['displayMessage', 'loadDevice']),
    async onSubmit() {
      this.isBusy = true;
      if (await this.loadDevice(this.deviceId)) {
        this.$router.push({ name: 'home' });
      } else {
        this.displayMessage('Failed to retrieve device');
      }

      this.isBusy = false;
    }
  }
};
</script>
