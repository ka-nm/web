<template>
  <div>
    <v-card class="elevation-12 mb-4">
      <v-toolbar dark color="primary">
        <v-toolbar-title>Goals</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon to="/">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on">arrow_back</v-icon>
            </template>
            <span>Back</span>
          </v-tooltip>
        </v-btn>
        <a :href="wifiUrl">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on">signal_wifi_4_bar</v-icon>
            </template>
            <span>WiFi Reset</span>
          </v-tooltip>
        </a>
        <v-dialog v-model="clearDialogDisplayed" max-width="320">
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on">delete</v-icon>
                </template>
                <span>Reset</span>
              </v-tooltip>
            </v-btn>
          </template>
          <v-card>
            <v-card-text>Are you sure you want to reset your goals?</v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red lighten-2" text @click="onReset">Reset</v-btn>
              <v-btn color="primary" text @click="clearDialogDisplayed = false">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
      <v-card-text class="grey lighten-5">
        <v-alert
          class="mb-3"
          :value="!totalPercentageValid"
          type="warning"
        >Total percentage does not add up to 100.</v-alert>
        <v-expansion-panels popout>
            <v-expansion-panel v-for="(goal, i) in goals" :key="i">
              <v-expansion-panel-header >
                <v-chip color="white" :class="(goal.enabled ? 'goal-enabled' : '')">
                  <v-avatar :color="goal.enabled ? $color(goal.color) : 'grey'"></v-avatar>
                  <span class="ml-2">{{ goal.name }}</span>
                </v-chip>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <goal v-model="goals[i]" :busy="busy" @valid="onValid(i, $event)"/>
              </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
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
    <sleep />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Goal from '@/components/Goal';
import Sleep from '@/components/Sleep';

export default {
  components: {
    goal: Goal,
    sleep: Sleep
  },
  data() {
    return {
      clearDialogDisplayed: false,
      allGoalsValid: true,
      totalPercentageValid: true,
      valid: [true, true, true, true],
      busy: false,
      goals: [],
      wifiUrl: `${process.env.VUE_APP_WIFI_REDIRECT_URL}#code=wifireset`
    };
  },
  computed: {
    ...mapState(['device'])
  },
  methods: {
    ...mapActions(['updateDevice', 'resetDevice', 'displayMessage']),
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
    async onReset() {
      this.clearDialogDisplayed = false;
      this.busy = true;
      if (await this.resetDevice()) {
        this.displayMessage({ text: 'Goals reset', color: 'info' });
        this.initialize();
      } else {
        this.displayMessage({ text: 'Failed to reset goals', color: 'error' });
      }

      this.busy = false;
    },
    async onSave() {
      this.busy = true;
      const device = {
        deviceId: this.device.deviceId,
        deviceCode: this.device.deviceCode,
        piggySleep: this.device.piggySleep,
        goals: this.goals.map(g => {
          return {
            name: g.name,
            enabled: g.enabled,
            color: +g.color,
            percentage: +g.percentage / 100,
            total: +g.total,
            current: +g.current,
            promise: +g.promise,
            promises: g.promises
          };
        })
      };

      if (await this.updateDevice(device)) {
        this.displayMessage({ text: 'Goals updated', color: 'info' });
      } else {
        this.displayMessage({ text: 'Failed to update goals', color: 'error' });
      }

      this.busy = false;
    },
    initialize() {
      this.goals = this.device.goals.map(g => {
        return {
          name: g.name,
          color: g.color,
          enabled: g.enabled,
          percentage: g.percentage * 100,
          total: g.total,
          current: g.current,
          promise: g.promise,
          promises: g.promises
        };
      });

      for (let index in this.goals) {
        this.$watch(['goals', index, 'percentage'].join('.'), this.onPercentage);
        this.$watch(['goals', index, 'enabled'].join('.'), this.onPercentage);
      }
    }
  },
  mounted() {
    this.initialize();
  }
};
</script>

<style scoped>
.goal-enabled {
  background: #e0e0e0;
  color: rgba(0, 0, 0, 0.87);
}
</style>
