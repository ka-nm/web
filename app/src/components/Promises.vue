<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Promises</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <div >
      <div v-if="busy"
        style="position: absolute;left: 0; top: 0; right: 0; bottom: 0;z-index: 2;background-color: rgba(255,255,255,0.8);">
        <div
          style="position: absolute;
                transform: translateY(-50%);
                 -webkit-transform: translateY(-50%);
                 -ms-transform: translateY(-50%);
                top: 50%;
                left: 0;
                right: 0;
                text-align: center;
                color: #555;"
          >
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>
      </div>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-subheader>
          Add Promise
        </v-subheader>
        <v-container fluid>
          <v-row>
            <v-col :cols="8">
              <v-text-field
                label="Activity"
                :rules="[rules.activityRequired]"
                type="text"
                filled
                required
                v-model="activity"
              ></v-text-field>
            </v-col>
            <v-col :cols="4">
              <v-text-field
                label="Amount"
                :rules="[rules.amountRequired]"
                type="text"
                mask="#######"
                filled
                required
                prefix="$"
                v-model="amount"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row fluid>
            <v-col :cols="8">
              <v-select
                :items="device.goals"
                item-text="name"
                :rules="[rules.goalRequired]"
                filled
                label="For Goal"
                v-model="goal"
              ></v-select>
            </v-col>
            <v-col :cols="4">
              <v-icon @click="onAddPromise" class="text-xs-center" style="margin-top: 16px">
                add_circle
              </v-icon>
            </v-col>
          </v-row>
        </v-container>
      </v-form>

      <v-subheader>
        Open Promises
      </v-subheader>
      <v-container grid-list-md text-xs-left>
        <div v-for="(promise, i) in promises" :key="i">
          <v-layout row fluid align-center mb-2>
            <v-flex xs10>
              Deposit promise of ${{promise.amount}} for {{promise.activity}} into goal for {{promise.goalName}}?
            </v-flex>
            <v-flex xs2>
              <v-icon @click="onCompletePromise(promise)" class="text-xs-center" color="green darken-2" >check_circle</v-icon>
              <v-icon @click="onDeletePromise(promise)" class="text-xs-center" color="red darken-2">block</v-icon>
            </v-flex>
          </v-layout>
        </div>
      </v-container>
    </div>
  </v-card>
</template>

<script>
  import {mapState, mapActions} from 'vuex';

  export default {
    data() {
      return {
        busy: false,
        valid: true,
        activity: null,
        amount: null,
        goal: null,
        rules: {
          activityRequired: v => !!v || 'Activity is required',
          amountRequired: v => !!v || 'Amount is required',
          goalRequired: v => !!v || 'Goal is required'
        }
      }
    },
    computed: {
      ...mapState(['device']),
      promises () {
        return this.$store.getters.promises;
      }
    },
    methods: {
      ...mapActions(['addPromise', 'removePromise', 'completePromise', 'displayMessage']),
      async onAddPromise () {
        this.busy = true;
        if (this.$refs.form.validate()) {
          if (await this.addPromise({
            goalName: this.goal,
            activity: this.activity,
            amount: this.amount
          })) {
            this.displayMessage({ text: 'Promise added', color: 'info' });
            this.$refs.form.reset();
            this.goal = null;
            this.activity = null;
            this.amount = null;
          } else {
            this.displayMessage({ text: 'Promise add failed', color: 'error' });
          }
        }
        this.busy = false;
      },
      async onCompletePromise (promise) {
        this.busy = true;
        if (await this.completePromise(promise)) {
          this.displayMessage({ text: 'Promise completed', color: 'info' });
        } else {
          this.displayMessage({ text: 'Promise complete failed', color: 'error' });
        }
        this.busy = false;

      },
      async onDeletePromise (promise) {
        this.busy = true;
        if (await this.removePromise(promise)) {
          this.displayMessage({ text: 'Promise deleted', color: 'info' });
        } else {
          this.displayMessage({ text: 'Promise delete failed', color: 'error' });
        }
        this.busy = false;
      }
    },
    watch: {
      valid() {
        this.$emit('valid', this.valid);
      }
    }
  };
</script>
