<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Target Device</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-text-field
        label="Device"
        type="text"
        box
        autofocus
        @keyup.enter="onSubmit"
        prepend-icon="memory"
        v-model="deviceId"
      ></v-text-field>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="onSubmit" :disabled="!deviceId || busy">Submit
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
      busy: false,
      deviceId: null
    };
  },
  methods: {
    ...mapActions(['displayMessage', 'loadDevice']),
    async onSubmit() {
      this.busy = true;
      if (await this.loadDevice(this.deviceId)) {
        this.$router.push({ name: 'home' });
      } else {
        this.displayMessage({ text: 'Failed to retrieve device', color: 'error' });
      }

      this.busy = false;
    }
  }
};
</script>
