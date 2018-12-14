<template>
  <v-card-text>
    <v-text-field
      label="Name:"
      placeholder="College"
      box
      required
      v-model="value.name"
      :disabled="busy"
    ></v-text-field>
    <v-text-field
      label="Goal Total:"
      prefix="$"
      placeholder="200.00"
      box
      required
      v-model="value.total"
      :disabled="busy"
    ></v-text-field>
    <v-text-field
      label="Current amount saved:"
      prefix="$"
      placeholder="10.00"
      box
      required
      v-model="value.current"
      :disabled="busy"
    ></v-text-field>
    <v-text-field
      label="Percentage allocated from each deposit:"
      prefix="%"
      placeholder="60"
      box
      required
      v-model="value.percentage"
      :disabled="busy"
    ></v-text-field>
  </v-card-text>
</template>

<script>
export default {
  props: {
    value: Object,
    busy: Boolean
  }
};
</script>