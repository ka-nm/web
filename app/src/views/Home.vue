<template>
  <v-container fluid >
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4>
        <div>
          <v-card class="elevation-12 mb-4 pb-1">
            <v-toolbar dark color="primary">
              <v-toolbar-title>Home</v-toolbar-title>
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
            <v-container fluid >
              <v-layout align-center justify-center>
                <v-flex xs10 >
                  <v-card-text>Access Stories</v-card-text>
                  <v-card class="mx-4" to="/story"> 
                      <v-img
                        :src="require('@/assets/rex&Penny.jpg')"
                        contain
                      ></v-img>
                  </v-card>
                  <v-card-text>Access Your DigiPiggy</v-card-text>
                  <v-card class="mx-4 mb-4" to="/pigdashboard"> 
                      <v-img
                        :src="require('@/assets/logo.png')"
                        contain
                      ></v-img>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
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
