<template>
  
  <v-card class="green">
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
    <v-card-title>Your Story Track</v-card-title>
    <v-sheet
      class="mx-auto"
      elevation="12"
      max-width="800"
    >
      <v-slide-group
        class="pa-4"
        show-arrows
      >
        <v-slide-item
          v-for="n in chapters"
          :key="n.title"
        >
          <v-card
            class="ma-2"
            height="150"
            width="100"
            :to="`/chapter/${n.title}`"
          >
            <v-img :src="`/chapters/${n.folder}/${n.thumbnail}`" height="50" contain class="d-block"></v-img>
            <v-card-text>
              <div>{{n.title}}</div>
            </v-card-text>
          </v-card>
        </v-slide-item>
      </v-slide-group>
    </v-sheet>
  </v-card>
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
