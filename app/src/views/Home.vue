<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>DigiPiggy</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="settings">
        <v-tooltip top>
          <v-icon slot="activator">settings</v-icon>
          <span>Settings</span>
        </v-tooltip>
      </v-btn>
      <v-dialog v-model="logoutDialogDisplayed" max-width="320">
        <v-btn icon slot="activator">
          <v-tooltip top>
            <v-icon slot="activator">power_settings_new</v-icon>
            <span>Logout</span>
          </v-tooltip>
        </v-btn>
        <v-card>
          <v-card-text>Are you sure you want to logout?</v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red lighten-2" flat @click="onLogout">Logout</v-btn>
            <v-btn color="primary" flat @click="logoutDialogDisplayed = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-card-text>
      <v-container fluid>
        <v-layout align-center justify-center row fill-height>
          <div v-for="(goal, i) in enabledGoals" :key="i" class="text-xs-center mx-2">
            <v-progress-circular
              class="align-center"
              :rotate="90"
              :size="60"
              :width="10"
              :value="getGoalValue(i)"
              :color="getGoalColor(i)"
            ></v-progress-circular>
            <p class="mt-1" style="max-width: 60px;">{{ goal.name }}</p>
          </div>
          <div v-if="!enabledGoals.length">
            <p>You don't have any enabled goals.</p>
            <p>Click the gear in the upper right to configure your goals.</p>
          </div>
        </v-layout>
      </v-container>
      <v-text-field
        v-model="deposit"
        prefix="$"
        label="Deposit"
        mask="#######"
        box
        autofocus
        placeholder="20"
        append-outer-icon="add_circle"
        @click:append-outer="onDeposit"
        @keyup.enter="onDeposit"
        :disabled="busy || !enabledGoals.length"
      ></v-text-field>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Auth from '../auth';

export default {
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
