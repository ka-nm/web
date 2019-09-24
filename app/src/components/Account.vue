<template>
  <v-card class="elevation-0">
    <v-card-text>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field
          label="Email"
          type="email"
          filled
          required
          prepend-icon="email"
          :rules="[rules.emailRequired, rules.email]"
          v-model="email"
        ></v-text-field>
        <v-text-field
          label="Password"
          type="password"
          filled
          required
          prepend-icon="lock"
          :rules="[rules.passwordRequired, rules.passwordLength]"
          v-model="password"
        ></v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="onCreate" :disabled="!valid || busy">Create
        <v-icon right dark>person</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex';

const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default {
  props: {
    tokenInfo: Object
  },
  data() {
    return {
      busy: false,
      valid: false,
      email: null,
      password: null,
      rules: {
        emailRequired: v => !!v || 'Email is required',
        email: v => emailPattern.test(v) || 'Invalid email',
        passwordRequired: v => !!v || 'Password is required',
        passwordLength: v => (v && v.length >= 8) || 'Password must be at least 8 characters'
      }
    };
  },
  computed: {
    ...mapState(['baseUrl'])
  },
  methods: {
    ...mapActions(['displayMessage']),
    async onCreate() {
      if (this.$refs.form.validate()) {
        try {
          this.busy = true;
          try {
            const response = await this.$http.post(`${this.baseUrl}/api/account`, {
              deviceCode: this.tokenInfo.code,
              token: this.tokenInfo.token,
              email: this.email,
              password: this.password
            });

            this.$emit('continue', response.data.claimCode);
          } finally {
            this.busy = false;
          }
        } catch (err) {
          console.error(err);

          let text = 'Failed to create account';
          if (err.response) {
            if (err.response.status === 409) {
              text = 'An account with this email already exists';
            }
          }

          this.displayMessage({ text, color: 'error' });
        }
      }
    }
  }
};
</script>
