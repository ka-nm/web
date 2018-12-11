<template>
  <v-app id="app">
    <v-content>
      <v-container fluid>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-img :src="require('@/assets/logo.png')" height="128px" contain class="d-block mb-3"></v-img>
            <transition name="component-fade" mode="out-in">
              <router-view/>
            </transition>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <v-snackbar v-model="notification" :multi-line="true" :timeout="5000">
      {{ notificationText }}
      <v-btn flat @click="notification = false">Close</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      notificationText: "",
      notificationQueue: [],
      notification: false
    };
  },
  computed: {
    ...mapState({
      message: state => state.message
    }),
    hasNotificationsPending() {
      return this.notificationQueue.length > 0;
    }
  },
  watch: {
    message() {
      if (this.message) {
        this.notificationQueue.push(this.message);
        if (!this.notification) {
          this.notificationText = this.notificationQueue.shift();
          this.notification = true;
        }
      }
    },
    notification() {
      if (!this.notification && this.hasNotificationsPending) {
        this.notificationText = this.notificationQueue.shift();
        this.$nextTick(() => (this.notification = true));
      }
    }
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