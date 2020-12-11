<template>
  
  <v-card class="green">
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
            to="/chapter"
          >
            <v-img :src="`/chapters/${n.thumbnail}`" height="50" contain class="d-block"></v-img>
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

export default {
  components: {},
  data() {
    return {
      chapters: [
        {
          title: "Introduction 1",
          thumbnail: "introduction/thumbnail.png",
          subtitle: "",
          mediaType: "video",
          length: "01:25",
          pages: []
        },
        {
          title: "Introduction 2",
          subtitle: "",
          blurb: "Get to know the Piggles. I this adventure....",
          readTime: [5, 7], 
          mediaType: "book",
          pages: [
            {
              image: "Intro image 1.png",
              text: "‘Whose idea was it to move in the middle of winter?’, Penny Piggle wondered, as her breath frosted the glass of the piggy-mini van window."
            },
            {
              image: "Intro image 2.png",
              text: "They'd been packing for weeks. All Penny and her brother Rex knew was that they were going to a bigger place."
            },
            {
              image: "Intro image 3.png",
              text: "Penny and Rex’s parents couldn’t wait to show them in person. They wanted to keep everything about their new house a surprise, so they didn’t show the piglets any pictures."
            },
            {
              image: "Intro image 4.png",
              text: "Penny sat with her snout against the glass, squinting to see through the falling ice and snow. ‘How did their new house look?’, she worried. 'Would she like it?', she thought."
            },
            {
              image: "Intro image 5.png",
              text: "It felt like they'd been driving forever. Finally, Mama Piggle turned around. \"Look! We're almost to our new house! Would you two like a clue?\"."
            },
          ]
        },
                {
          title: "Introduction 3",
          subtitle: "",
          blurb: "Get to know the Piggles. I this adventure....",
          readTime: [5, 7], 
          mediaType: "book",
          pages: [
            {
              image: "Intro image 1.png",
              text: "‘Whose idea was it to move in the middle of winter?’, Penny Piggle wondered, as her breath frosted the glass of the piggy-mini van window."
            },
            {
              image: "Intro image 2.png",
              text: "They'd been packing for weeks. All Penny and her brother Rex knew was that they were going to a bigger place."
            },
            {
              image: "Intro image 3.png",
              text: "Penny and Rex’s parents couldn’t wait to show them in person. They wanted to keep everything about their new house a surprise, so they didn’t show the piglets any pictures."
            },
            {
              image: "Intro image 4.png",
              text: "Penny sat with her snout against the glass, squinting to see through the falling ice and snow. ‘How did their new house look?’, she worried. 'Would she like it?', she thought."
            },
            {
              image: "Intro image 5.png",
              text: "It felt like they'd been driving forever. Finally, Mama Piggle turned around. \"Look! We're almost to our new house! Would you two like a clue?\"."
            },
          ]
        },
                {
          title: "Introduction 4",
          subtitle: "",
          blurb: "Get to know the Piggles. I this adventure....",
          readTime: [5, 7], 
          mediaType: "book",
          pages: [
            {
              image: "Intro image 1.png",
              text: "‘Whose idea was it to move in the middle of winter?’, Penny Piggle wondered, as her breath frosted the glass of the piggy-mini van window."
            },
            {
              image: "Intro image 2.png",
              text: "They'd been packing for weeks. All Penny and her brother Rex knew was that they were going to a bigger place."
            },
            {
              image: "Intro image 3.png",
              text: "Penny and Rex’s parents couldn’t wait to show them in person. They wanted to keep everything about their new house a surprise, so they didn’t show the piglets any pictures."
            },
            {
              image: "Intro image 4.png",
              text: "Penny sat with her snout against the glass, squinting to see through the falling ice and snow. ‘How did their new house look?’, she worried. 'Would she like it?', she thought."
            },
            {
              image: "Intro image 5.png",
              text: "It felt like they'd been driving forever. Finally, Mama Piggle turned around. \"Look! We're almost to our new house! Would you two like a clue?\"."
            },
          ]
        },
                {
          title: "Introduction 5",
          subtitle: "",
          blurb: "Get to know the Piggles. I this adventure....",
          readTime: [5, 7], 
          mediaType: "book",
          pages: [
            {
              image: "Intro image 1.png",
              text: "‘Whose idea was it to move in the middle of winter?’, Penny Piggle wondered, as her breath frosted the glass of the piggy-mini van window."
            },
            {
              image: "Intro image 2.png",
              text: "They'd been packing for weeks. All Penny and her brother Rex knew was that they were going to a bigger place."
            },
            {
              image: "Intro image 3.png",
              text: "Penny and Rex’s parents couldn’t wait to show them in person. They wanted to keep everything about their new house a surprise, so they didn’t show the piglets any pictures."
            },
            {
              image: "Intro image 4.png",
              text: "Penny sat with her snout against the glass, squinting to see through the falling ice and snow. ‘How did their new house look?’, she worried. 'Would she like it?', she thought."
            },
            {
              image: "Intro image 5.png",
              text: "It felt like they'd been driving forever. Finally, Mama Piggle turned around. \"Look! We're almost to our new house! Would you two like a clue?\"."
            },
          ]
        },
      ]
    };
  }
};
</script>
