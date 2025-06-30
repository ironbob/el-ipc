<template>
  <div :class="stackClasses" v-bind="$attrs" v-on="$listeners">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Stack from './Stack.vue'

export default Vue.extend({
  name: 'VStack',
  extends: Stack,
  props: {
    direction: {
      type: String,
      default: 'vertical'
    }
  }
})
</script>
