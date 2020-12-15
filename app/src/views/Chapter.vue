<template>
 <!--TODO: Throw in an if here to show the video player if the mediaType is video -->
 <!--else show the story-->
 <v-container>
  <v-card v-if="chapter.title && chapter.mediaType == 'book' " class="red">
    <v-card-title>{{chapter.title}}</v-card-title>
     <!--TODO: Use assets for this img-->
    <v-img :src="`/chapters/${chapter.folder}/${currentPage.image}`" height="350" contain class="d-block"></v-img>
    <v-card-text>
      {{ currentPage.text }}
    </v-card-text>
    <v-bottom-navigation >
        <v-btn @click="previousPage" :disabled="this.currentPageIndex <= 0">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <v-btn to="/story">
          <v-icon>mdi-library</v-icon>
        </v-btn>

        <v-btn @click="nextPage">
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
      </v-bottom-navigation>
  </v-card>
  <v-card v-if="chapter.title && chapter.mediaType == 'video' " class="">
    <div>
      <video width="100%" height="100%" controls>
        <source :src="require(`@/assets/chapters/${chapter.folder}/${chapter.videoName}`)" type="video/mp4">
        <!-- <source :src="`/chapters/${chapter.folder}/${chapter.videoName}`" type="video/mp4"> -->
        Your browser does not support the video tag.
      </video>
    </div>
  </v-card>
 </v-container>
</template>

<script>

export default {
  data() {
    return {
      chapter: {},
      currentPage: {},
      currentPageIndex: 0,
    }
  },
  async mounted() {
    try {
      const title = this.$route.params.title
      this.chapter = this.$store.state.chapters.find( chap => chap.title == title)
      if (this.chapter.mediaType == 'book') {
        this.currentPage = this.chapter.pages[this.currentPageIndex]
      }
    } catch (err) {
      console.error(err);
    }
  },
  methods: {
    nextPage() {
      if (this.currentPageIndex < this.chapter.pages.length){
        this.currentPageIndex = this.currentPageIndex + 1;
        this.currentPage = this.chapter.pages[this.currentPageIndex];
      }
      else {
        //Show the final page with questions at the end
        this.currentPageIndex = -1
        this.currentPage = {}
      }
    },
    previousPage() {
      if (this.currentPageIndex < this.chapter.pages.length){
        this.currentPageIndex = this.currentPageIndex - 1;
        this.currentPage = this.chapter.pages[this.currentPageIndex];
      }
    }
  }
};
</script>
