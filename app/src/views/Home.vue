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
          <div v-for="(bucket, i) in enabledBuckets" :key="i" class="text-xs-center mx-2">
            <v-progress-circular
              class="align-center"
              :rotate="90"
              :size="60"
              :width="10"
              :value="getBucketValue(i)"
              :color="getBucketColor(i)"
            ></v-progress-circular>
            <p class="mt-1" style="max-width: 60px;">{{ bucket.name }}</p>
          </div>
        </v-layout>
      </v-container>
      <v-text-field
        v-model="deposit"
        prefix="$"
        label="Deposit"
        mask="#######"
        box
        append-outer-icon="add_circle"
        required
        @click:append-outer="onDeposit"
        @keyup.enter="onDeposit"
        :disabled="isBusy"
      ></v-text-field>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      isBusy: false,
      isValid: false,
      deposit: 0
    };
  },
  computed: {
    ...mapState(["device"]),
    enabledBuckets() {
      return this.device.buckets.filter(b => b.enabled);
    }
  },
  methods: {
    ...mapActions(["displayMessage", "updateBucketTotals"]),
    getBucketName(index) {
      return this.device.buckets[index].name;
    },
    getBucketValue(index) {
      const data = this.device.data[index];
      return (data.current / data.total) * 100;
    },
    getBucketColor(index) {
      const bucket = this.device.buckets[index];
      return this.$color(bucket.color);
    },
    async onDeposit() {
      this.isBusy = true;

      const self = this;
      // TODO: fix this
      const deposits = this.device.buckets.map(b => Math.round(b.percentage * +self.deposit));
      if (!(await this.updateBucketTotals(deposits))) {
        this.displayMessage("Deposit failed");
      } else {
        this.deposit = 0;
        this.displayMessage("Deposit successful");
      }

      this.isBusy = false;
    }
  }
};
</script>
