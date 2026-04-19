<script setup lang="ts">
defineProps<{
  title?: string;
  showCta?: boolean;
}>();

const sponsors = SPONSORS;
</script>

<template>
  <div class="sponsor-list">
    <h2 v-if="title" class="sponsor-title">{{ title }}</h2>
    <div class="sponsor-grid">
      <a
        v-for="sponsor in sponsors"
        :key="sponsor.username"
        :href="sponsor.url"
        target="_blank"
        rel="noopener noreferrer"
        class="sponsor-card"
      >
        <img :src="sponsor.avatar" :alt="sponsor.username" class="sponsor-avatar" loading="lazy" />
        <span class="sponsor-name">@{{ sponsor.username }}</span>
      </a>
    </div>
    <div v-if="showCta" class="sponsor-cta">
      <a
        href="https://github.com/sponsors/ikkz"
        target="_blank"
        rel="noopener noreferrer"
        class="sponsor-cta-link"
      >
        ❤️ Become a sponsor
      </a>
    </div>
  </div>
</template>

<style scoped>
.sponsor-list {
  padding: 24px 0;
}

.sponsor-title {
  font-size: 1.4em;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
  background: linear-gradient(
    135deg,
    var(--vp-c-brand-1),
    var(--vp-c-brand-2, var(--vp-c-brand-1))
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sponsor-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.sponsor-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 24px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  text-decoration: none;
  transition: all 0.3s ease;
  min-width: 140px;
}

.sponsor-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.sponsor-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--vp-c-divider);
  transition: border-color 0.3s ease;
}

.sponsor-card:hover .sponsor-avatar {
  border-color: var(--vp-c-brand-1);
}

.sponsor-name {
  font-size: 0.9em;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.sponsor-cta {
  margin-top: 28px;
  text-align: center;
}

.sponsor-cta-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 28px;
  border-radius: 20px;
  background: linear-gradient(135deg, #ea4aaa, #ee6a5f);
  color: #fff;
  font-weight: 600;
  font-size: 0.95em;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(234, 74, 170, 0.3);
}

.sponsor-cta-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(234, 74, 170, 0.4);
}
</style>
