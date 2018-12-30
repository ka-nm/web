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
          <small>Connect your device to your local network</small>
        </v-stepper-step>
        <v-stepper-content step="3">
          <p>Click the button below to be taken to a site that will allow you to setup your WiFi.</p>
          <v-btn color="primary" @click="onRedirectToWifi">Continue
            <v-icon right dark>arrow_forward</v-icon>
          </v-btn>
        </v-stepper-content>
      </v-stepper>
    </v-card-text>
  </v-card>
</template>

<script>
import DeviceCode from '@/components/DeviceCode';
import Account from '@/components/Account';

export default {
  components: {
    deviceCode: DeviceCode,
    account: Account
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
    },
    onRedirectToWifi() {
      window.location = `${process.env.VUE_APP_WIFI_REDIRECT_URL}?code=${this.claimCode}`;
    }
  }
};
</script>