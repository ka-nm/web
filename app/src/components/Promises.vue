<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Promises</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-subheader>
        Add Promise
      </v-subheader>
    <v-container fluid>
      <v-layout>
        <v-flex xs5>
          <v-text-field
            label="Activity"
            :rules="[rules.activityRequired]"
            type="text"
            box
            required
            v-model="activity"
          ></v-text-field>
        </v-flex>
        <v-flex xs3>
          <v-text-field
            label="Amount"
            :rules="[rules.amountRequired]"
            type="text"
            mask="#######"
            box
            required
            prefix="$"
            v-model="amount"
          ></v-text-field>
        </v-flex>
        <v-flex xs4>
          <v-select
            :items="device.goals"
            item-text="name"
            :rules="[rules.goalRequired]"
            box
            label="For Goal"
            v-model="goal"
            append-outer-icon="add_circle"
            @click:append-outer="onAddPromise"
            @keyup.enter="onAddPromise"
          ></v-select>
        </v-flex>
      </v-layout>
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
            <v-icon @click="onCompletePromise(i)" class="text-xs-center" color="green darken-2" >check_circle</v-icon>
            <v-icon @click="onDeletePromise(i)" class="text-xs-center" color="red darken-2">block</v-icon>
          </v-flex>
        </v-layout>
      </div>
    </v-container>

  </v-card>
</template>

<script>
  import {mapState, mapActions} from 'vuex';

  export default {
    data() {
      return {
        valid: true,
        activity: null,
        amount: null,
        goal: null,
        promises: [],
        rules: {
          activityRequired: v => !!v || 'Activity is required',
          amountRequired: v => !!v || 'Amount is required',
          goalRequired: v => !!v || 'Goal is required'
        }
      }
    },
    computed: {
      ...mapState(['device'])
    },
    methods: {
      ...mapActions['updateDevice'],
      onAddPromise () {
        if (this.$refs.form.validate()) {
          this.promises.push({
            goalName: this.goal,
            activity: this.activity,
            amount: this.amount
          });
          this.$refs.form.reset();
          this.goal = null;
          this.activity = null;
          this.amount = null;
        }
      },
      onCompletePromise (index) {
        this.promises.splice(index, 1);
      },
      onDeletePromise (index) {
        this.promises.splice(index, 1);
      },
      initialize() {
        this.promises = this.device.goals.reduce((acc, cur) => {
          if (cur.promises) {
            return acc.concat(cur.promises)
          }
          return acc;
        }, []);
      }
    },
    watch: {
      valid() {
        this.$emit('valid', this.valid);
      }
    },
    mounted() {
      this.initialize();
    }
  };
</script>
