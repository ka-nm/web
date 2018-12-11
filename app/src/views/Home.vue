<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>DigiPiggy</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="setup">
        <v-icon>settings</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text>
      <v-container fluid>
        <v-layout align-center justify-center row fill-height>
          <v-progress-circular
            v-for="(bucket, i) in enabledBuckets"
            class="mr-2"
            :key="i"
            :rotate="90"
            :size="100"
            :value="getBucketValue(i)"
            :color="getBucketColor(i)">
            <p class="black--text text-xs-center pb-0 mb-0">{{ bucket.name }}</p>
          </v-progress-circular>
        </v-layout>
      </v-container>
      <v-form v-model="isValid">
        <v-text-field
          v-model="amount"
          prefix="$"
          label="Deposit"
          mask="#######"
          box
          append-outer-icon="add_circle"
          required
          @click:append-outer="deposit"
          :disabled="isBusy"
        ></v-text-field>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "home",
  data() {
    return {
      isBusy: false,
      isValid: false,
      amount: 0.0
    };
  },
  computed: {
    ...mapState(["device"]),
    enabledBuckets() {
      return this.device.buckets.filter(b => b.enabled);
    }
  },
  methods: {
    ...mapActions(["displayMessage", "storeDevice"]),
    getBucketName(index) {
      return this.device.buckets[index].name;
    },
    getBucketValue(index) {
      const data = this.device.data[index];
      return (data.current / data.total) * 100;
    },
    getBucketColor(index) {
      const bucket = this.device.buckets[index];
      return `rgb(${(bucket.color >> 16) & 255}, ${(bucket.color >> 8) & 255}, ${bucket.color & 255})`;
    },
    deposit() {
      alert("ahhhhhhhhh yeeaaaaaaaa");
    }
  },
  async mounted() {
    if (!this.device.deviceId) {
      this.isBusy = true;
      try {
        const response = await this.axios.get(`api/device/${this.deviceId}`);
        this.storeDevice({ deviceId: response.data.deviceId });
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
