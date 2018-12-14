<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Goals</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="/">
        <v-icon>keyboard_backspace</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text class="grey lighten-5">
      <v-expansion-panel popout>
        <v-expansion-panel-content v-for="(bucket, i) in buckets" :key="i">
          <div slot="header">
            <v-chip color="white" :disabled="true">
              <v-avatar :color="$color(bucket.color)"></v-avatar>
              {{ bucket.name }}
            </v-chip>
          </div>
          <v-card>
            <bucket v-model="buckets[i]" :busy="isBusy"/>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary">Save Goals
        <v-icon right dark>cloud_upload</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from "vuex";
import Bucket from "@/components/Bucket";

export default {
  components: {
    bucket: Bucket
  },
  data() {
    return {
      isBusy: false,
      buckets: []
    };
  },
  computed: {
    ...mapState(["device"])
  },
  mounted() {
    const self = this;
    this.buckets = this.device.buckets.map((b, i) => {
      return {
        name: b.name,
        color: b.color,
        percentage: b.percentage * 100,
        total: self.device.data[i].total,
        current: self.device.data[i].current
      };
    });
  }
};
</script>

<style scoped>
.theme--light.v-chip--disabled {
  background: #e0e0e0;
  color: rgba(0, 0, 0, 0.87);
}
</style>