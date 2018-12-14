<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Goals</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="/">
        <v-icon>keyboard_backspace</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text class="grey lighten-5">
      <v-expansion-panel popout>
        <v-expansion-panel-content v-for="(goal, i) in goals" :key="i">
          <div slot="header">
            <v-chip color="white" :disabled="true" :class="(goal.enabled ? 'goal-enabled' : '')">
              <v-avatar :color="$color(goal.color)"></v-avatar>
              {{ goal.name }}
            </v-chip>
          </div>
          <v-card>
            <goal v-model="goals[i]" :busy="isBusy"/>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="onSave" :disabled="isBusy">Save Goals
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
      isBusy: false,
      goals: []
    };
  },
  computed: {
    ...mapState(['device'])
  },
  methods: {
    ...mapActions(['storeDevice', 'displayMessage']),
    async onSave() {
      this.isBusy = true;
      const device = {
        deviceId: this.device.deviceId,
        buckets: this.goals.map(g => {
          return {
            name: g.name,
            enabled: g.enabled,
            color: g.color,
            percentage: +g.percentage / 100
          };
        }),
        data: this.goals.map(g => {
          return {
            total: +g.total,
            current: +g.current,
            promise: g.promise
          };
        })
      };

      if (await this.storeDevice(device)) {
        this.displayMessage({ text: 'Goals updated', color: 'info' });
      } else {
        this.displayMessage({ text: 'Failed to update goals', color: 'error' });
      }

      this.isBusy = false;
    }
  },
  mounted() {
    const self = this;
    this.goals = this.device.buckets.map((b, i) => {
      return {
        name: b.name,
        color: b.color,
        enabled: b.enabled,
        percentage: b.percentage * 100,
        total: self.device.data[i].total,
        current: self.device.data[i].current,
        promise: self.device.data[i].promise
      };
    });
  }
};
</script>

<style scoped>
.goal-enabled {
  background: #e0e0e0;
  color: rgba(0, 0, 0, 0.87);
}
</style>