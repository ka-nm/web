<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Allowance</v-toolbar-title>
      <v-spacer></v-spacer>
      <div>
        <v-switch label="" hide-details v-model="allowance.enabled" ></v-switch>
      </div>
    </v-toolbar>
    <v-card-text>
      <v-form ref="form" lazy-validation>
        <v-select
          :items="depositSchedules"
          item-text="label"
          item-value="value"
          filled
          label="Schedule"
          v-model="allowance.depositSchedule"
          :disabled="!allowance.enabled  || busy"
          :rules="[rules.depositScheduleRequired]"
        ></v-select>
        <v-text-field
          v-model="allowance.amount"
          label="Amount"
          type="number"
          filled
          prefix="$"
          :disabled="!allowance.enabled || busy"
          :rules="[rules.amountRequired]"
        ></v-text-field>
      </v-form>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="onSave"
        >Save Sleep
          <v-icon right dark>cloud_upload</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-text>
  </v-card>
</template>

<script>
  import {mapState, mapActions} from 'vuex';

  export default {
    data () {
      return {
        busy: false,
        valid: true,
        depositSchedules: [
          {label: 'Weekly', value: 'Weekly'},
          {label: 'Monthly', value: 'Monthly'}
        ],
        allowance: {},
        rules: {
          amountRequired: value => !this.allowance.enabled || value ? true : 'Amount is required.',
          depositScheduleRequired: value => !this.allowance.enabled || value ? true : 'Payment Schedule is required.'
        }
      }
    },
    computed: {
      ...mapState(['device']),
    },
    methods: {
      ...mapActions(['saveAllowance', 'displayMessage']),
      async onSave() {
        this.busy = true;
        if (this.$refs.form.validate()) {
          if (await this.saveAllowance(this.allowance)){
            this.displayMessage({ text: 'Allowance settings saved', color: 'info' });
          } else {
            this.displayMessage({ text: 'Allowance settings save failed', color: 'error' });
          }
        }
        this.busy = false;
      },
      initialize() {
        if (this.device.allowance) {
          this.allowance = this.device.allowance;
        } else {
          this.allowance = {
            enabled: false,
            amount: null,
            depositSchedule: null
          }
        }
      }
    },
    mounted() {
      this.initialize();
    }
  };
</script>
