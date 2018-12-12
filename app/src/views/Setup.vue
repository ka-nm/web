<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Add a Goal</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="/">
        <v-icon>keyboard_backspace</v-icon>
      </v-btn>
    </v-toolbar>
    <bucket v-model="tempBucket" :busy="isBusy" />
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary">Save New Goal
        <v-icon right dark>cloud_upload</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import Bucket from '@/components/Bucket';

export default {
  components: {
    bucket: Bucket
  },
  data() {
    return {
      tempBucket: {
        name: "Beer",
        total: 100,
        current: 20,
        percentage: 50
      },
      isBusy: false
    };
  }
};
</script>