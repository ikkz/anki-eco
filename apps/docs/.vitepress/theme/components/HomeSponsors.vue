<script setup lang="ts">
import SponsorList from './SponsorList.vue';
import { useData } from 'vitepress';

const { lang } = useData();
</script>

<template>
  <div class="home-sponsors">
    <SponsorList :title="lang === 'zh' ? '赞助者' : 'Sponsors'" :show-cta="true" />
  </div>
</template>

<style scoped>
.home-sponsors {
  max-width: 1152px;
  margin: 0 auto;
  padding: 40px 24px 64px;
}
</style>
