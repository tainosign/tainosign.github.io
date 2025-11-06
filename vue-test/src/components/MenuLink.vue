<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MenuLink',
  props: {
    href: { type: String, required: true },
    label: { type: String, required: true },
    colorClass: { type: String, required: true },
  },
  setup(props) {
    return { props };
  },
});
</script>

<template>
  <a :href="props.href" :class="['menu-link', props.colorClass]">
    {{ props.label }}
  </a>
</template>
