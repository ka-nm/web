<template>
  <div>
    <p>
      Connect to the network that begins with
      <span class="font-weight-black">DIGIPIGGY</span> and then continue.
    </p>
    <v-list v-show="networks.length" subheader>
      <v-subheader>Available Networks</v-subheader>
      <v-list-tile v-for="(network, i) in networks" :key="i" @click="onSelect(i)" ripple>
        <v-list-tile-avatar>
          <v-icon class="grey lighten-1">{{ wifiStrengthIcon(i) }}</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title v-text="network.ssid"></v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-icon color="grey lighten-1" v-show="selectedNetwork === i">check</v-icon>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
    <v-text-field
      v-show="showPassword"
      label="Password"
      type="password"
      box
      prepend-icon="lock"
      v-model="password"
      :disabled="busy"
    ></v-text-field>
    <v-btn color="primary" @click="onContinue" :disabled="busy">
      {{ continueButtonText }}
      <v-icon v-show="networks.length" right dark>refresh</v-icon>
    </v-btn>
    <v-btn color="primary" @click="onConnect" :disabled="busy" v-show="networks.length">Connect
      <v-icon right dark>wifi</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import pify from 'pify';
import SoftAPSetup from 'softap-setup';

const sap = pify(new SoftAPSetup({ protocol: 'http' }));

export default {
  props: {
    claimCode: String
  },
  data() {
    return {
      busy: false,
      networks: [],
      selectedNetwork: -1,
      showPassword: false,
      password: null
    };
  },
  computed: {
    continueButtonText() {
      return this.networks.length ? 'Refresh' : 'Continue';
    }
  },
  methods: {
    ...mapActions(['displayMessage']),
    wifiStrengthIcon(index) {
      const network = this.networks[index];
      if (network.rssi <= -90) {
        return 'signal_wifi_0_bar';
      } else if (network.rssi > -90 && network.rssi <= -80) {
        return 'signal_wifi_1_bar';
      } else if (network.rssi > -80 && network.rssi <= -70) {
        return 'signal_wifi_2_bar';
      } else if (network.rssi > -70 && network.rssi <= -60) {
        return 'signal_wifi_3_bar';
      }

      return 'signal_wifi_4_bar';
    },
    async onSelect(index) {
      this.password = null;
      if (this.selectedNetwork === index) {
        this.selectedNetwork = -1;
        this.showPassword = false;
      } else {
        this.selectedNetwork = index;
        this.showPassword = true;
      }
    },
    async onConnect() {
      const network = this.networks[this.selectedNetwork];
      try {
        this.busy = true;
        await sap.setClaimCode(this.claimCode);
        await sap.publicKey();
        await sap.configure({
          ssid: network.ssid,
          security: network.security,
          password: this.password,
          channel: network.channel
        });

        await sap.connect();
        // TODO: need to check with particle to see if device registered successfully
        this.$emit('continue');
      } catch (err) {
        console.error(err);
        this.displayMessage({ text: 'Failed to connect to WiFi network', color: 'error' });
      } finally {
        this.busy = false;
      }
    },
    async onContinue() {
      this.networks = [];
      const found = await sap.scan();
      found.forEach(f => {
        this.networks.push({
          ssid: f.ssid,
          security: f.sec,
          channel: f.ch,
          rssi: f.rssi
        });
      });
    }
  }
};
</script>