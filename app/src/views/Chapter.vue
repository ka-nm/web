<template>
  <v-card v-if="chapter.title" class="red">
    <v-card-title>{{chapter.title}}</v-card-title>
    <div>
      {{chapter.length}}
    </div>
    <v-img :src="`/chapters/introduction/${chapter.pages[0].image}`" height="350" contain class="d-block"></v-img>
    <v-card-text>
      {{ chapter.pages[currentPageIndex].text }}
    </v-card-text>
  </v-card>
</template>

<script>

export default {
  data() {
    return {
      chapter: {},
      currentPageIndex: 0
    }
  },

  async mounted() {
    try {
      const title = this.$route.params.title
      this.chapter = this.$store.state.chapters.find( chap => chap.title == title)
    } catch (err) {
      console.error(err);
    }
  }
};
</script>
