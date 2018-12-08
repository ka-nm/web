<template>
  <v-flex xs12 sm8 md4>
    <v-card class="elevation-12">
      <v-toolbar dark color="primary">
        <v-toolbar-title>Update Buckets</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form>
          <v-text-field name="deviceId" label="Device" type="text" v-model="device.deviceId"></v-text-field>
        </v-form>
        <v-select
          :items="device.buckets"
          item-text="name"
          label="Goals"
          return-object
          v-model="bucket"
        ></v-select>
        <bucket v-show="bucket" v-model="bucketData"/>
        <v-progress-linear v-show="isBusy" :indeterminate="true"></v-progress-linear>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="submit" :disabled="!device.deviceId || isBusy">
          Submit
          <v-icon right dark>cloud_upload</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-flex>
</template>

<script>
import bucket from "@/components/Bucket";

export default {
  name: "home",
  components: { bucket },
  data() {
    return {
      isBusy: false,
      bucket: null,
      device: {
        deviceId: null,
        buckets: [
          {
            color: 255,
            name: "Nintendo Switch",
            percentage: 0.4
          },
          {
            color: 65535,
            name: "Razor Scooter",
            percentage: 0.15
          },
          {
            color: 16711935,
            name: "Apple Watch",
            percentage: 0.25
          },
          {
            color: 16711680,
            name: "Nike Kobe 11",
            percentage: 0.2
          }
        ],
        data: [
          {
            total: 400,
            current: 250,
            promise: 100
          },
          {
            total: 40,
            current: 32,
            promise: 0
          },
          {
            total: 300,
            current: 100,
            promise: 50
          },
          {
            total: 150,
            current: 100,
            promise: 0
          }
        ]
      }
    };
  },
  computed: {
    bucketData: {
      get() {
        if (this.bucket) {
          const index = this.device.buckets.findIndex(b => b.name === this.bucket.name);
          return this.device.data[index];
        }

        return null;
      },
      set(newValue) {
        const index = this.device.buckets.findIndex(b => b.name === this.bucket.name);
        this.device.data[index] = newValue;
      } 
    }
  },
  methods: {
    async submit() {
      this.isBusy = true;
      try {
        await this.axios.put(`/api/device/${this.device.deviceId}`, this.device);
      } finally {
        this.isBusy = false;
      }
    }
  }
};
</script>
