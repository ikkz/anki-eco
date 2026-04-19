import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import ClassicTemplateDemo from './components/ClassicTemplateDemo.vue';
import SponsorList from './components/SponsorList.vue';
import HomeSponsors from './components/HomeSponsors.vue';
import './index.css';
import { h } from 'vue';

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-features-after': () => h(HomeSponsors),
    });
  },
  enhanceApp({ app }) {
    app.component('ClassicTemplateDemo', ClassicTemplateDemo);
    app.component('SponsorList', SponsorList);
  },
} as Theme;
