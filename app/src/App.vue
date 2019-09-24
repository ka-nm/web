<template>
  <v-app id="app">
    <v-content>
      <v-container fluid>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-img :src="require('@/assets/logo.png')" height="128px" contain class="d-block my-4"></v-img>
            <transition name="component-fade" mode="out-in">
              <router-view/>
            </transition>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <v-snackbar v-model="notification" :multi-line="true" :timeout="3000">
      {{ notificationText }}
      <v-btn text :color="notificationColor" @click="notification = false">Close</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      notificationText: '',
      notificationColor: 'info',
      notificationQueue: [],
      notification: false
    };
  },
  computed: {
    ...mapState({
      messageText: state => state.message.text,
      messageColor: state => state.message.color
    }),
    hasNotificationsPending() {
      return this.notificationQueue.length > 0;
    }
  },
  watch: {
    messageText() {
      if (this.messageText) {
        this.notificationQueue.push({ text: this.messageText, color: this.messageColor });
        if (!this.notification) {
          const options = this.notificationQueue.shift();
          this.notificationText = options.text;
          this.notificationColor = options.color;
          this.notification = true;
        }
      }
    },
    notification() {
      if (!this.notification && this.hasNotificationsPending) {
        const options = this.notificationQueue.shift();
        this.notificationText = options.text;
        this.notificationColor = options.color;
        this.$nextTick(() => (this.notification = true));
      }
    }
  },
  methods: {
    ...mapActions(['initialize'])
  }
};
</script>

<style>
.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.3s ease;
}
.component-fade-enter,
.component-fade-leave-to {
  opacity: 0;
}
</style>
