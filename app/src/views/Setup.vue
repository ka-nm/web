<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Setup</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-stepper v-model="step" vertical>
        <v-stepper-step :complete="step > 1" step="1">
          Device Code
          <small>Find the device code on the back of your device</small>
        </v-stepper-step>
        <v-stepper-content step="1">
          <deviceCode @continue="onCodeContinue"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 2" step="2">
          Account
          <small>Create your user account</small>
        </v-stepper-step>
        <v-stepper-content step="2">
          <account :tokenInfo="deviceTokenInfo" @continue="onAccountContinue"/>
        </v-stepper-content>

        <v-stepper-step :complete="step > 3" step="3">
          Wi-Fi
          <small>Connect to your local network</small>
        </v-stepper-step>
        <v-stepper-content step="3">
          <wifi :claimCode="claimCode" @continue="step = 4"/>
        </v-stepper-content>

        <v-stepper-step step="4">
          Finish
          <small>Complete the setup of your device</small>
        </v-stepper-step>
        <v-stepper-content step="4">
          <p>Congrats - you're done!</p>
          <v-btn color="primary">Finish
            <v-icon right dark>check</v-icon>
          </v-btn>
        </v-stepper-content>
      </v-stepper>
    </v-card-text>
  </v-card>
</template>

<script>
import DeviceCode from '@/components/DeviceCode';
import Account from '@/components/Account';
import WiFi from '@/components/WiFi';

export default {
  components: {
    deviceCode: DeviceCode,
    account: Account,
    wifi: WiFi
  },
  data() {
    return {
      step: 0,
      deviceTokenInfo: {},
      claimCode: null
    };
  },
  methods: {
    onCodeContinue(info) {
      this.deviceTokenInfo = info;
      this.step = 2;
    },
    onAccountContinue(code) {
      this.claimCode = code;
      this.step = 3;
    }
  }
};
</script>