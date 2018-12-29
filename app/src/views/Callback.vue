<template>
  <v-layout align-center justify-center row>
    <loader color="#1976d2"/>
  </v-layout>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { PropagateLoader } from '@saeris/vue-spinners';
import Auth from '../auth';

export default {
  components: {
    loader: PropagateLoader
  },
  computed: {
    ...mapState(['baseUrl'])
  },
  methods: {
    ...mapActions(['displayMessage', 'loadDevice'])
  },
  async mounted() {
    try {
      await Auth.handleAuthentication();
      const deviceResponse = await this.$http.get('https://api.particle.io/v1/devices', {
        headers: { Authorization: `Bearer ${Auth.accessToken}` }
      });

      if (!deviceResponse.data.length || !(await this.loadDevice(deviceResponse.data[0].id))) {
        this.displayMessage({ text: 'Failed to load device', color: 'error' });
      }

      this.$router.replace({ name: 'home' });
    } catch (err) {
      console.error(err);
      this.displayMessage({ text: 'Unable to complete authentication', color: 'error' });
    }
  }
};
</script>