<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Registration</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-stepper v-model="step">
        <v-stepper-header>
          <v-stepper-step :complete="step > 1" step="1">Start</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 2" step="2">Account</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 3" step="3">WiFi</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="4">Finish</v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content step="1">
            <p>This will allow you to register your pig yada yada yada...</p>
            <v-btn color="primary" @click="step = 2">Continue</v-btn>
          </v-stepper-content>
          <v-stepper-content step="2">
            <account @continue="step = 3"/>
          </v-stepper-content>
          <v-stepper-content step="3">
            <wifi :claimCode="claimCode" @continue="step = 4"/>
          </v-stepper-content>
          <v-stepper-content step="4">
            <p>Congrats - you're done and stuff!</p>
            <v-btn color="primary">Finish</v-btn>
          </v-stepper-content>
        </v-stepper-items>
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
  }
};
</script>