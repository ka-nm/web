<template>
  <v-container fluid >
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4>
        <div>
          <v-img :src="require('@/assets/logo.png')" height="128px" contain class="d-block my-4"></v-img>
          <v-card class="elevation-12 mb-4">
            <v-toolbar dark color="primary">
              <v-toolbar-title>My DigiPiggy</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon to="/">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on">home</v-icon>
                  </template>
                  <span>Home</span>
                </v-tooltip>
              </v-btn>
              <v-btn icon to="pigSettings">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on">settings</v-icon>
                  </template>
                  <span>settings</span>
                </v-tooltip>
              </v-btn>
              <v-dialog v-model="logoutDialogDisplayed" max-width="320">
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on">
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on">power_settings_new</v-icon>
                      </template>
                      <span>Logout</span>
                    </v-tooltip>
                  </v-btn>
                </template>
                <v-card>
                  <v-card-text>Are you sure you want to logout?</v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red lighten-2" text @click="onLogout">Logout</v-btn>
                    <v-btn color="primary" text @click="logoutDialogDisplayed = false">Cancel</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
            <v-card-text>
              <v-container fluid>
                <v-row align="start" justify="center" align-content="center">
                  <template v-for="(goal, i) in enabledGoals">
                    <v-col :key="i" align="center">
                      <v-progress-circular
                        class="align-center"
                        :rotate="90"
                        :size="60"
                        :width="10"
                        :value="getGoalValue(i)"
                        :color="getGoalColor(i)"
                      ></v-progress-circular>
                      <p class="mt-1">{{ goal.name }}</p>
                    </v-col>
                  </template>
                  <div v-if="!enabledGoals.length">
                    <p>You don't have any enabled goals.</p>
                    <p>Click the gear in the upper right to configure your goals.</p>
                  </div>
                </v-row>
              </v-container>
              <v-text-field
                v-model="deposit"
                prefix="$"
                label="Deposit"
                mask="#######"
                filled
                autofocus
                placeholder="20"
                append-outer-icon="add_circle"
                @click:append-outer="onDeposit"
                @keyup.enter="onDeposit"
                :disabled="busy || !enabledGoals.length"
              ></v-text-field>
            </v-card-text>
          </v-card>

          <Promises/>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Auth from '../auth';
import Promises from '@/components/Promises';

export default {
  components: {Promises},
  data() {
    return {
      logoutDialogDisplayed: false,
      busy: false,
      deposit: null
    };
  },
  computed: {
    ...mapState(['device']),
    enabledGoals() {
      return this.device.goals.filter(g => g.enabled);
    }
  },
  methods: {
    ...mapActions(['displayMessage', 'depositIntoGoals']),
    getGoalName(index) {
      return this.device.goals[index].name;
    },
    getGoalValue(index) {
      const data = this.enabledGoals[index];
      return (data.current / data.total) * 100;
    },
    getGoalColor(index) {
      const goals = this.enabledGoals[index];
      return this.$color(goals.color);
    },
    onLogout() {
      Auth.logout();
    },
    async onDeposit() {
      if (+this.deposit === 0) {
        return this.displayMessage({ text: 'Please enter an amount to deposit', color: 'info' });
      }

      this.busy = true;
      if (await this.depositIntoGoals(+this.deposit)) {
        this.deposit = 0;
        this.displayMessage({ text: 'Deposit successful', color: 'info' });
      } else {
        this.displayMessage({ text: 'Deposit failed', color: 'error' });
      }

      this.busy = false;
    }
  }
};
</script>
