<template>
  <v-container fluid >
    <v-layout align-center justify-center>
      <v-flex xs12 sm8>
        <v-card class="pb-4">
          <v-toolbar dark color="primary">
            <v-toolbar-title>Stories</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon to="/">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on">home</v-icon>
                </template>
                <span>Home</span>
              </v-tooltip>
            </v-btn>
          </v-toolbar>
          <v-card-text >Your Story Track</v-card-text>
          <v-sheet
            class="mx-auto mb-4"
            elevation="12"
          >
            <v-slide-group
              class="pa-4"
              show-arrows
            >
              <v-slide-item
                v-for="n in chapters"
                :key="n.title"
              >
                <div>
                  <v-card
                    v-if="n.released"
                    class="ma-2"
                    height="150"
                    width="100"
                    :to="`/chapter/${n.title}`"
                  >
                    <!-- <v-img :src="require(`@/assets/chapters/${n.folder}/${n.thumbnail}`)"  contain class="d-block"></v-img> -->
                    <v-img :src="require(`@/assets/chapters/${n.folder}/${n.thumbnail}`)"  contain class="d-block"></v-img>
                    <!-- <v-img :src="`/chapters/${n.folder}/${n.thumbnail}`"  contain class="d-block"></v-img> -->
                    <v-card-text class="pa-2">
                      <div>{{n.title}}</div>
                    </v-card-text>
                  </v-card>
                  <v-card
                    v-if="!n.released"
                    class="ma-2"
                    height="150"
                    width="100"
                  >
                    <v-img :src="require('@/assets/comingSoon.jpg')"  contain class="d-block"></v-img>
                    <v-card-text class="pa-2">
                      <div>{{n.title}}</div>
                    </v-card-text>
                  </v-card>
                </div>
              </v-slide-item>
            </v-slide-group>
          </v-sheet>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';

export default {
  components: {},
  computed: {
    ...mapState(['chapters'])
  }
};
</script>
