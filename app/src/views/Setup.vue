<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Setup</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-stepper v-model="step" vertical>
        <v-stepper-step :complete="step > 1" step="1">
          Start
          <small>Device setup overview</small>
        </v-stepper-step>
        <v-stepper-content step="1">
          <p>This will allow you to setup your pig yada yada yada...</p>
          <v-btn color="primary" @click="step = 2">Continue</v-btn>
        </v-stepper-content>

        <v-stepper-step :complete="step > 2" step="2">
          Account
          <small>Create your user account</small>
        </v-stepper-step>
        <v-stepper-content step="2">
          <account @continue="onAccountContinue"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 3" step="3">
          WiFi
          <small>Connect to your local network</small>
        </v-stepper-step>
        <v-stepper-content step="3">
          <wifi :claimCode="claimCode" @continue="step = 4"/>
        </v-stepper-content>

        <v-stepper-step step="4">
          Finish
          <small>Complete setup of your device</small>
        </v-stepper-step>
        <v-stepper-content step="4">
          <p>Congrats - you're done!</p>
          <v-btn color="primary">Finish</v-btn>
        </v-stepper-content>
      </v-stepper>
    </v-card-text>
  </v-card>
</template>

<script>
import Account from '@/components/Account';
import WiFi from '@/components/WiFi';

export default {
  components: {
    account: Account,
    wifi: WiFi
  },
  data() {
    return {
      step: 0,
      claimCode: null
    };
  },
  methods: {
    onAccountContinue(code) {
      this.claimCode = code;
      this.step = 3;
    }
  }
};
</script>