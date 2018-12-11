<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Target Device</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-form>
        <v-text-field
          name="deviceId"
          label="Device"
          type="text"
          prepend-icon="memory"
          v-model="deviceId"
        ></v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="submit" :disabled="!deviceId || isBusy">Submit
        <v-icon right dark>cloud_upload</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "device",
  data() {
    return {
      isBusy: false,
      deviceId: null
    };
  },
  methods: {
    ...mapActions(["displayMessage", "storeDevice"]),
    async submit() {
      this.isBusy = true;
      try {
        const response = await this.axios.get(`api/device/${this.deviceId}`);
        this.storeDevice({ deviceId: response.data.deviceId });
        this.$router.push({ name: "home" });
      } catch (err) {
        console.error(err);

        if (err.response && err.response.status === 404) {
          return this.displayMessage("Device not found");
        }

        this.displayMessage("Failed to retrieve device");
      } finally {
        this.isBusy = false;
      }
    }
  }
};
</script>
