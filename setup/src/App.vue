<template>
  <v-app id="app">
    <v-icon class="offscreen">lock</v-icon>
    <v-content>
      <v-container fluid>
        <v-row align="center" justify="center">
          <v-col :sm="12" :md="8" :lg="6">
            <v-img :src="require('@/assets/logo.png')" height="128px" contain class="d-block my-4"></v-img>
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>WiFi Setup</v-toolbar-title>
              </v-toolbar>
              <v-layout align-center justify-center row v-show="busy">
                <p>{{connectionStepText}}</p>
              </v-layout>
              <v-layout align-center justify-center row v-show="busy">
                <loader color="#1976d2" class="my-3"/>
              </v-layout>
              <v-card-text>
                <p>
                  Connect to the network that begins with
                  <span class="font-weight-black">DIGIPIGGY</span> and then click continue.
                </p>
                <v-list v-show="networks.length" subheader>
                  <p>
                    Select your network from the list of available networks, enter your network password, and then click connect.
                  </p>
                  <v-subheader>Available Networks</v-subheader>
                  <v-list-item
                    v-for="(network, i) in networks"
                    :key="i"
                    @click="onSelect(i)"
                    ripple
                  >
                    <v-list-item-avatar>
                      <v-icon class="grey lighten-1">wifi</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title v-text="network.ssid"></v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-icon color="grey lighten-1" v-show="selectedNetwork === i">check</v-icon>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
                <v-text-field
                  v-show="showPassword"
                  label="Password"
                  type="password"
                  filled
                  prepend-icon="lock"
                  v-model="password"
                  :disabled="busy"
                ></v-text-field>
                <v-btn color="primary" @click="onContinue" :disabled="busy || !claimCode">
                  {{ continueButtonText }}
                  <v-icon v-show="networks.length" right dark>refresh</v-icon>
                </v-btn>
                <v-btn
                  class="ml-2"
                  color="primary"
                  @click="onConnect"
                  :disabled="busy"
                  v-show="networks.length"
                >Connect
                  <v-icon right dark>wifi</v-icon>
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-snackbar v-model="notification" :multi-line="true" :timeout="3000">
      {{ notificationText }}
      <v-btn text :color="notificationColor" @click="notification = false">Close</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import { PropagateLoader } from '@saeris/vue-spinners';
import pify from 'pify';
import qs from 'qs';
import SoftAPSetup from 'softap-setup';
import axios from 'axios';

const sap = pify(new SoftAPSetup({ protocol: 'http' }));

export default {
  components: {
    loader: PropagateLoader
  },
  data() {
    return {
      busy: false,
      claimCode: null,
      deviceID: '',
      networks: [],
      selectedNetwork: -1,
      showPassword: false,
      password: null,
      notification: false,
      notificationText: '',
      notificationColor: 'info',
      checkingWifiConfig: false,
      connectionStepText: ''
    };
  },
  computed: {
    continueButtonText() {
      return this.networks.length ? 'Refresh' : 'Continue';
    }
  },
  methods: {
    // TODO: import new icon library to use in this function. signal_wifi_#_bar is no longer supported
    // https://material.io/resources/icons

    // wifiStrengthIcon(index) {
    //   const network = this.networks[index];
    //   if (network.rssi <= -90) {
    //     return 'signal_wifi_0_bar';
    //   } else if (network.rssi > -90 && network.rssi <= -80) {
    //     return 'signal_wifi_1_bar';
    //   } else if (network.rssi > -80 && network.rssi <= -70) {
    //     return 'signal_wifi_2_bar';
    //   } else if (network.rssi > -70 && network.rssi <= -60) {
    //     return 'signal_wifi_3_bar';
    //   }
    //   return 'signal_wifi_4_bar';
    // },
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
        this.connectionStepText = 'Configuring device'
        this.deviceID = await sap.deviceInfo().then(res => res.id);
        if (this.claimCode !== "wifireset") {
          await sap.setClaimCode(this.claimCode);
        }
        await sap.publicKey();
        await sap.configure({
          ssid: network.ssid,
          security: network.security,
          password: this.password,
          channel: network.channel
        });
        await sap.connect();

        // After sap.connect(), it will automatically disconnect from the DIGIPIGGY wifi network
        // Then the user's device (laptop, cell phone, etc) will automatically re-connect to their wifi network
        // Wait until they are back on their network before proceeding.
        
        this.connectionStepText = 'Reconnecting to your wifi.'
        let wiFiOnline = await this.checkIfWiFiIsOnline();
        if (!wiFiOnline) return;
        
        let deviceOnline = false;
        this.connectionStepText = 'Confirming Digi-Pig connected to network.'

        // TODO: remove access token from URI
        // TODO: move this to it's own function
        await axios.put(`https://api.particle.io/v1/products/8466/devices/${this.deviceID}/ping?access_token=5043aee54ba12b3d3968325d3e653fc6eaf1e693`)
        .then(response => {
          if (response.data.online) {
            deviceOnline = true; 
          }
          else {
            this.handleError(response, 'Pig failed to connect to WiFi network. Please try again.')
          }
        }).catch(err => {
          this.handleError(err, 'Failed to ping the pig. Please try again.')
        });

        if (!deviceOnline) return;

        await new Promise(resolve => {
          this.connectionStepText = 'Connection successful. Time to get Digi.'
          setTimeout(() => {
            resolve()
          }, 5000)
        })
        
        if (this.claimCode !== "wifireset") {
          window.location = `${process.env.VUE_APP_WIFI_REDIRECT_URL}/setup#finish`;
        }
        else {
          window.location = `${process.env.VUE_APP_WIFI_REDIRECT_URL}/settings`;
        }
      } catch (err) {
        this.handleError(err, 'Failed to connect to WiFi network');
      } finally {
        this.busy = false;
        this.connectionStepText = ''
      }
    },
    async checkIfWiFiIsOnline() {
      let attemptsLeft = 4;
      let isOnline = false;
      const wait = (delay) => new Promise(resolve => setTimeout(resolve, delay));

      while (attemptsLeft > 0 && !isOnline) {
        await axios.get('https://dynamodb.us-east-2.amazonaws.com')
        .then(response => {
          if (response.status >= 200 && response.status <= 300) {
            isOnline = true;
          }
        })
        .catch(err => {
          console.log("error", err)
        })
        if (isOnline) {
          // TODO: add retry logic into the device ping
          // wait 5 seconds, this allows the device fully come online.
          await wait(5000)
          return true;
        }
        else {
          await wait(15000);
          attemptsLeft--;
        }
      }
      this.handleError({}, 'Unable to connect to the internet. Please try again.');
      return isOnline;
    },
    async onContinue() {
      this.networks = [];
      this.showPassword = false;
      try {
        const found = await sap.scan();
        found.forEach(f => {
          this.networks.push({
            ssid: f.ssid,
            security: f.sec,
            channel: f.ch,
            rssi: f.rssi
          });
        });
      } catch (err) {
        this.handleError(err, 'Unable to locate any valid WiFi networks');
      }
    },
    handleError(err, message) {
      if (err) {
        console.error(err);
      }

      this.notificationText = message;
      this.notificationColor = 'error';
      this.notification = true;
    }
  },
  mounted() {
    const hash = (window.location.hash || '').replace(/^#?\/?/, '');
    if (hash) {
      const params = qs.parse(hash);
      if (params.code) {
        this.claimCode = decodeURIComponent(params.code);
        return;
      }
    }
    this.handleError(null, 'No claim code provided');
  }
};
</script>

<style>
.offscreen {
  position: absolute;
  top: -1000px;
}
</style>
