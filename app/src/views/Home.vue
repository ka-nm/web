<template>
  <div>
    <v-card class="elevation-12 mb-4 pb-1">
      <v-toolbar dark color="primary">
        <v-toolbar-title>Welcome to the Piggles</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog v-model="logoutDialogDisplayed" max-width="320">
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on">power_settings_new</v-icon>
                </template>
                <span>Logout</span>
              </v-tooltip>
            </v-btn>
          </template>
          <v-card>
            <v-card-text>Are you sure you want to logout?</v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red lighten-2" text @click="onLogout">Logout</v-btn>
              <v-btn color="primary" text @click="logoutDialogDisplayed = false">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
          <v-card-text>Access Stories</v-card-text>
          <v-card class="mx-12" to="/story"> 
              <v-img
                :src="require('@/assets/rex&Penny.jpg')"
                contain
              ></v-img>
          </v-card>
          <v-card-text>Access Your DigiPiggy</v-card-text>
          <v-card class="mx-12 mb-4" to="/pigdashboard"> 
              <v-img
                :src="require('@/assets/logo.png')"
                contain
              ></v-img>
          </v-card>
    </v-card>
  </div>
</template>

<script>
import Auth from '../auth';

export default {
  data() {
    return {
      logoutDialogDisplayed: false,
    };
  },
  methods: {
    onLogout() {
      Auth.logout();
    }
  }
};
</script>
