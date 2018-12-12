<template>
  <v-card class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title>Add a Goal</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="/">
        <v-icon>keyboard_backspace</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text>
      <v-text-field
          label="Goal Name:"
          placeholder="College"
          box
          required
          @click:append-outer="deposit"
          :disabled="isBusy"
        ></v-text-field>
        <v-text-field
          label="Goal Total:"
          prefix="$"
          placeholder="200.00"
          box
          required
          @click:append-outer="deposit"
          :disabled="isBusy"
        ></v-text-field>
        <v-text-field
          label="Starting savings toward goal:"
          prefix="$"
          placeholder="10.00"
          box
          required
          @click:append-outer="deposit"
          :disabled="isBusy"
        ></v-text-field>
        <v-text-field
          label="Percentage allocated from each deposit:"
          prefix="%"
          placeholder="60"
          box
          required
          @click:append-outer="deposit"
          :disabled="isBusy"
        ></v-text-field>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary">Save New Goal
        <v-icon right dark>cloud_upload</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "setup",
  props:{}
};
</script>