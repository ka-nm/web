<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>DigiPiggy</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="settings">
        <v-icon>settings</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text>
      <v-container fluid>
        <v-layout align-center justify-center row fill-height>
          <div v-if="enabledGoals.length">
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
          </div>
          <div v-else>
            <p>You don't have any goals setup yet.</p>
            <p>Click the gear in the upper right to get started.</p>
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

export default {
  data() {
    return {
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
    ...mapActions(['displayMessage', 'updateGoalTotals']),
    getGoalName(index) {
      return this.device.goals[index].name;
    },
    getGoalValue(index) {
      const data = this.device.goals[index];
      return (data.current / data.total) * 100;
    },
    getGoalColor(index) {
      const goals = this.device.goals[index];
      return this.$color(goals.color);
    },
    async onDeposit() {
      if (+this.deposit === 0) {
        return this.displayMessage({ text: 'Please enter an amount to deposit', color: 'info' });
      }

      this.busy = true;

      const deposits = [0, 0, 0, 0];
      let remainder = +this.deposit;
      do {
        remainder = this.device.goals.reduce((r, g, i) => {
          if (g.enabled && g.total > g.current + deposits[i]) {
            const deposit = Math.round(g.percentage * remainder);
            const runningTotal = g.current + deposits[i];
            if (runningTotal + deposit > g.total) {
              const diff = g.total - runningTotal;
              deposits[i] += diff;
              r += deposit - diff;
            } else {
              deposits[i] += deposit;
            }
          }

          return r;
        }, 0);
      } while (remainder > 0 && !this.device.goals.every((d, i) => d.total === d.current + deposits[i]));

      if (await this.updateGoalTotals(deposits)) {
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
