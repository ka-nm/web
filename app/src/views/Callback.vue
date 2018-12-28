<template>
  <v-layout align-center justify-center row>
    <loader color="#1976d2"/>
  </v-layout>
</template>

<script>
import { PropagateLoader } from '@saeris/vue-spinners';
import Auth from '../auth';

export default {
  components: {
    loader: PropagateLoader
  },
  created() {
    Auth.handleAuthentication();
    // TODO: get particle token
  }
};
</script>