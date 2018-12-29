<template>
  <v-card-text>
    <v-form v-model="valid" lazy-validation>
      <v-text-field
        label="Name"
        :rules="[rules.nameRequired, rules.nameLength]"
        box
        counter="20"
        clearable
        required
        v-model="value.name"
        :disabled="busy"
      ></v-text-field>
      <v-text-field
        label="Goal total"
        prefix="$"
        box
        mask="#######"
        required
        v-model="value.total"
        :disabled="busy"
      ></v-text-field>
      <v-text-field
        label="Current amount saved"
        :rules="[rules.currentValue]"
        prefix="$"
        box
        mask="#######"
        required
        v-model="value.current"
        :disabled="busy"
      ></v-text-field>
      <v-text-field
        label="Amount promised"
        :rules="[rules.promiseValue]"
        prefix="$"
        box
        mask="#######"
        required
        v-model="value.promise"
        :disabled="busy"
      ></v-text-field>
      <v-text-field
        label="Percentage allocated from each deposit"
        prefix="%"
        box
        mask="###"
        required
        v-model="value.percentage"
        :disabled="busy"
      ></v-text-field>
    </v-form>
    <v-switch label="Enabled" v-model="value.enabled" :disabled="busy"></v-switch>
  </v-card-text>
</template>

<script>
export default {
  props: {
    value: Object,
    busy: Boolean
  },
  data() {
    return {
      valid: true,
      rules: {
        nameRequired: v => !!v || 'Name is required',
        nameLength: v => (v && v.length <= 20) || 'Name must be less than 20 characters',
        currentValue: v => +v <= +this.value.total || 'Current amount cannot exceed total',
        promiseValue: v => +v < +this.value.total || 'Promise amount cannot match or exceed total'
      }
    };
  },
  watch: {
    valid() {
      this.$emit('valid', this.valid);
    }
  }
};
</script>