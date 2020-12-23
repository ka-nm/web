<template>
 <v-container class="fill-height justify-center">
  <v-card 
    v-if="chapter.title && chapter.mediaType == 'book'" 
    class=""
    width="100%"
  >
    <v-sheet v-if="currentPageIndex == -1">
      <v-card-title class="justify-center">{{chapter.title}} Questions</v-card-title>
      <v-divider></v-divider>
      <p class="text-h4 font-weight-medium pl-3 pt-5">
        Questions for Kids
      </p>
      <v-card-text 
        class="text-body-2 font-weight-regular pl-6" 
        v-for="question in chapter.questions.kids"
        :key="question"
      >
        🐷 {{question}}
      </v-card-text>
      <p class="text-h4 font-weight-medium pl-3 pt-5">
        Questions for Parents
      </p>
      <v-card-text 
        class="text-body-2 font-weight-regular pl-6" 
        v-for="question in chapter.questions.parents"
        :key="question"
      >
        🐷 {{question}}
      </v-card-text>
      <v-sheet class="text-center my-7 px-2">
        <v-btn color="primary" @click="reRoute">
          {{chapter.cta.btnText}}
        </v-btn>
      </v-sheet>
      <v-bottom-navigation >
        <v-btn @click="previousPage">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-btn to="/story">
          <v-icon>mdi-library</v-icon>
        </v-btn>
        <v-btn @click="nextPage" :disabled=true>
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
      </v-bottom-navigation>
    </v-sheet>
    <v-sheet v-else>
      <v-card-title class="justify-center ">{{chapter.title}}</v-card-title>
      <v-divider></v-divider>
      <v-img 
        :src="require(`@/assets/chapters/${chapter.folder}/${currentPage.image}`)"
        aspect-ratio="1.3"
        contain
        class="d-block"
      ></v-img>
      <v-card-text >
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
    </v-sheet>
  </v-card>
  <v-card v-if="chapter.title && chapter.mediaType == 'video' " class="">
    <div>
      <video 
        width="100%"
        height="100%"
        :src="videoSource"
        controls>
        <!-- <source  type="video/mp4"> -->
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
      videoSource: ''
    }
  },
  async mounted() {
    try {
      const title = this.$route.params.title
      this.chapter = this.$store.state.chapters.find( chap => chap.title == title)
      if (this.chapter.mediaType == 'book') {
        this.currentPage = this.chapter.pages[this.currentPageIndex]
      }
      if (this.chapter.mediaType == 'video') {
        // TODO: change the prop from videoName to videoSource or videoURL
        this.videoSource = this.chapter.videoName
      }
    } catch (err) {
      console.error(err);
    }
  },
  methods: {
    nextPage() {
      if (this.currentPageIndex < this.chapter.pages.length - 1){
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
      if (this.currentPageIndex == -1) {
        this.currentPageIndex = this.chapter.pages.length - 1;
        this.currentPage = this.chapter.pages[this.currentPageIndex];
      }
      else if (this.currentPageIndex < this.chapter.pages.length){
        this.currentPageIndex = this.currentPageIndex - 1;
        this.currentPage = this.chapter.pages[this.currentPageIndex];
      }
    },
    reRoute() {
      this.$router.push(`/${this.chapter.cta.route}`)
    }
  }
};
</script>
