<template>
  <div>
    <p>
      Connect to the network that begins with
      <span class="font-weight-black">DIGIPIGGY</span>
    </p>
    <v-list>
      <v-list-tile v-for="(network, i) in networks" :key="i" @click="onSelect(i)">
        <v-list-tile-content>
          <v-list-tile-title v-text="network.ssid"></v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-text-field
      v-show="showPassword"
      name="password"
      label="Password"
      type="password"
      box
      prepend-icon="lock"
      v-model="password"
      append-outer-icon="add_circle"
      @click:append-outer="onDeposit"
      :disabled="busy"
    ></v-text-field>
    <v-btn color="primary" @click="onConnect">Connect
      <v-icon right dark>wifi</v-icon>
    </v-btn>
    <v-btn color="primary" @click="onContinue">Continue</v-btn>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import pify from 'pify';
import SoftAPSetup from 'softap-setup';

const sap = pify(new SoftAPSetup({ protocol: 'http' }));

export default {
  props: {
    claimCode: {
      type: String,
      required: true
    }
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
  methods: {
    ...mapActions(['displayMessage']),
    async onConnect() {
      const found = await sap.scan();
      found.forEach(f => {
        this.networks.push({
          ssid: f.ssid,
          security: f.sec,
          channel: f.channel
        });
      });
    },
    async onSelect(index) {
      this.password = null;
      this.selectedNetwork = index;
    },
    async onPassword() {
      const network = this.networks[this.selectedNetwork];
      try {
        await sap.publicKey();
        await sap.configure({
          ssid: network.ssid,
          security: network.security,
          password: this.password,
          channel: network.channel
        });
      } catch (err) {
        console.error(err);
        this.displayMessage({ text: 'Failed to connect to WiFi network', color: 'error' });
      }
    },
    onContinue() {
      this.$emit('continue');
    }
  }
};
</script>