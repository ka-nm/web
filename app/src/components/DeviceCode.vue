<template>
  <v-card class="elevation-0">
    <v-card-text>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
        <v-text-field
          label="Code"
          type="text"
          filled
          autofocus
          required
          prepend-icon="memory"
          :rules="[rules.required, rules.deviceCode]"
          v-model="deviceCode"
        ></v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn type="button" color="primary" @click="onSubmit" :disabled="!valid || busy">Continue
        <v-icon right dark>arrow_forward</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex';

const deviceCodePattern = /([A-Z]|[0-9]){6}/;

export default {
  data() {
    return {
      busy: false,
      valid: false,
      deviceCode: null,
      rules: {
        required: v => !!v || 'Device code is required',
        deviceCode: v => deviceCodePattern.test(v) || 'Invalid device code'
      }
    };
  },
  computed: {
    ...mapState(['baseUrl'])
  },
  methods: {
    ...mapActions(['displayMessage']),
    async onSubmit() {
      if (this.$refs.form.validate()) {
        try {
          this.busy = true;
          try {
            const response = await this.$http.get(`${this.baseUrl}/api/account/${this.deviceCode}`);
            this.$emit('continue', { code: this.deviceCode, token: response.data.token });
          } finally {
            this.busy = false;
          }
        } catch (err) {
          console.error(err);

          let text = 'Unexpected error occurred';
          if (err.response) {
            if (err.response.status === 404) {
              text = 'Unable to find device';
            } else if (err.response.status === 409) {
              text = 'Device has already been claimed';
            }
          }

          this.displayMessage({ text, color: 'error' });
        }
      }
    }
  }
};
</script>
