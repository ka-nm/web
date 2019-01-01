<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Goals</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="/">
        <v-icon>arrow_back</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text class="grey lighten-5">
      <v-alert
        class="mb-3"
        :value="!totalPercentageValid"
        type="warning"
      >Total percentage does not add up to 100.</v-alert>
      <v-expansion-panel popout>
        <v-expansion-panel-content v-for="(goal, i) in goals" :key="i">
          <div slot="header">
            <v-chip color="white" :disabled="true" :class="(goal.enabled ? 'goal-enabled' : '')">
              <v-avatar :color="goal.enabled ? $color(goal.color) : 'grey'"></v-avatar>
              {{ goal.name }}
            </v-chip>
          </div>
          <v-card>
            <goal v-model="goals[i]" :busy="busy" @valid="onValid(i, $event)"/>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        @click="onSave"
        :disabled="!totalPercentageValid || !allGoalsValid || busy"
      >Save Goals
        <v-icon right dark>cloud_upload</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Goal from '@/components/Goal';

export default {
  components: {
    goal: Goal
  },
  data() {
    return {
      allGoalsValid: true,
      totalPercentageValid: true,
      valid: [true, true, true, true],
      busy: false,
      goals: []
    };
  },
  computed: {
    ...mapState(['device'])
  },
  methods: {
    ...mapActions(['storeDevice', 'displayMessage']),
    onValid(index, isValid) {
      this.valid[index] = isValid;
      this.allGoalsValid = this.valid.every(x => x);
    },
    onPercentage() {
      const enabledGoals = this.goals.filter(g => g.enabled);
      if (!enabledGoals.length) {
        this.totalPercentageValid = true;
      } else {
        const total = enabledGoals.reduce((sum, goal) => +goal.percentage + sum, 0);
        this.totalPercentageValid = total === 100;
      }
    },
    async onSave() {
      this.busy = true;
      const device = {
        deviceId: this.device.deviceId,
        deviceCode: this.device.deviceCode,
        goals: this.goals.map(g => {
          return {
            name: g.name,
            enabled: g.enabled,
            color: +g.color,
            percentage: +g.percentage / 100,
            total: +g.total,
            current: +g.current,
            promise: +g.promise
          };
        })
      };

      if (await this.storeDevice(device)) {
        this.displayMessage({ text: 'Goals updated', color: 'info' });
      } else {
        this.displayMessage({ text: 'Failed to update goals', color: 'error' });
      }

      this.busy = false;
    }
  },
  mounted() {
    this.goals = this.device.goals.map(g => {
      return {
        name: g.name,
        color: g.color,
        enabled: g.enabled,
        percentage: g.percentage * 100,
        total: g.total,
        current: g.current,
        promise: g.promise
      };
    });

    for (let index in this.goals) {
      this.$watch(['goals', index, 'percentage'].join('.'), this.onPercentage);
      this.$watch(['goals', index, 'enabled'].join('.'), this.onPercentage);
    }
  }
};
</script>

<style scoped>
.goal-enabled {
  background: #e0e0e0;
  color: rgba(0, 0, 0, 0.87);
}
</style>