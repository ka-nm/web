<template>
  <div>
    <v-card class="elevation-12 mb-4">
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

          <v-stepper-step step="4">
            Finish
            <small>Complete the setup of your device</small>
          </v-stepper-step>
          <v-stepper-content step="4">
            <p>Congratulations - device setup is complete!</p>
            <p>You'll now be asked to login so you can interact with your device.</p>
            <v-btn color="primary" to="/">Finish
              <v-icon right dark>check</v-icon>
            </v-btn>
          </v-stepper-content>
        </v-stepper>
      </v-card-text>
    </v-card>
    <v-card class="elevation-12">
      <v-toolbar dark color="primary">
        <v-toolbar-title>Setup Instructions</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <h2>Initial Setup</h2>
        <ol>
          <li>Plug in the device. Upon boot up you should see a blue connection icon identifying that it’s ready to be paired.</li>
          <li>From your desktop or mobile browser, go to: https://www.digipiggybank.com/setup
          <li>Make sure where you’re setting up the DigiPig has access to a 2.4GHz spectrum hot spot.
          <li>Follow on screen instructions.
        a. The Device ID is on the back of the DigiPig.
        b. Once adding email at the sign-up page, be sure to verify email from the address used
        from your inbox before attempting to log in after setup.
          <li>Once verified proceed to log in to the device with email and pass
          <li>Start adding Savings Goals</li>
        </ol>
        <h2>Use</h2>
        <ul>
          <li>Main screen has the ability to quickly add Money/Allowance across all enabled Savings Goals.</li>
          <li>In each Savings Goal there is the opportunity to “Promise” money toward that particular goal. Once added, the goal will light up the appropriately added amount in a half-lit LED to show how much will go toward the goal upon completion of agreement.</li>
        </ul>
        <div class="mt-4 text-xs-center"><a href="/DigiPig_Prototype_Version_1_setup.pdf" target="_blank">Click here for full setup instructions.</a></div>
      </v-card-text>
    </v-card>
  </div>
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
      window.location = `${process.env.VUE_APP_WIFI_REDIRECT_URL}#code=${encodeURIComponent(this.claimCode)}`;
    }
  },
  mounted() {
    const hash = (window.location.hash || '').replace(/^#?\/?/, '');
    if (hash === 'finish') {
      this.$nextTick(() => (this.step = 4));
    }
  }
};
</script>
