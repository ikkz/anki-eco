<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import hostHtml from './anki-host.html?raw';

type Entry = 'mcq' | 'tf' | 'basic' | 'match' | 'cloze' | 'input' | 'mcq_10' | 'mcq_26';

const props = defineProps<{
  entry: Entry;
  options?: number[];
}>();

type Locale = 'en' | 'zh' | 'ja' | 'pt_br';
type Field = 'native' | 'markdown';

const locales: Locale[] = ['en', 'zh', 'ja', 'pt_br'];
const fields: Field[] = ['native', 'markdown'];

const selectedLocale = ref<Locale>(
  typeof location !== 'undefined' && location.pathname.startsWith('/zh/') ? 'zh' : 'en',
);
const selectedField = ref<Field>('native');
const selectedOptions = ref<number>(props.options?.[0] ?? 6);

const effectiveEntry = computed<Entry>(() => {
  if (props.options && props.options.length > 0) {
    if (selectedOptions.value === 10) return 'mcq_10';
    if (selectedOptions.value === 26) return 'mcq_26';
    return 'mcq';
  }
  return props.entry;
});

const distHost = import.meta.env.DEV ? 'http://localhost:4200' : 'https://classic.anki.ikkz.fun';

const distPublicBase = `${distHost}/dist`;
const releasePublicBase = `${distHost}/release`;

const variantKey = computed(
  () => `${effectiveEntry.value}.${selectedLocale.value}.${selectedField.value}`,
);

const downloadPath = computed(() => `${releasePublicBase}/${variantKey.value}.apkg`);

const downloadName = computed(() => `${variantKey.value}.apkg`);

const version = ref<string>('...');

// Simple i18n-ish labels
const labels = {
  title: 'Classic Template',
  locale: 'Locale',
  field: 'Field',
  options: 'Options',
  preview: 'Preview',
  download: 'Download',
};

// --- dynamic previewer logic ---
const iframeRef = ref<HTMLIFrameElement | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const renderToken = ref(0);

function interpolate(html: string, data: Record<string, string>) {
  // lodash-like "{{ key }}" interpolation (no eval, just replace)
  return html.replace(/{{([\s\S]+?)}}/g, (_, expr) => {
    const key = String(expr).trim();
    return data[key] ?? '';
  });
}

async function fetchText(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return await res.text();
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return (await res.json()) as T;
}

async function fetchClassicVersion() {
  try {
    const res = await fetch(`${distHost}/package.json`, {
      cache: 'no-cache',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch version (${res.status})`);
    }

    const body = (await res.json()) as unknown;
    if (!body || typeof body !== 'object') {
      throw new Error('Invalid version payload');
    }

    const value = (body as { version?: unknown }).version;
    if (typeof value !== 'string') {
      throw new Error('Missing version field');
    }

    version.value = value;
  } catch (error) {
    console.error(error);
    version.value = 'unknown';
  }
}

type BuildJson = {
  config: {
    entry: string;
    name: string;
  };
  notes: Array<{ fields: Record<string, string> }>;
  fields: string[];
};

async function loadAndRender() {
  const token = ++renderToken.value;
  loading.value = true;
  error.value = null;
  try {
    const base = `${distPublicBase}/${variantKey.value}`;

    // parallel fetch
    const [front, back, build] = await Promise.all([
      fetchText(`${base}/front.html`),
      fetchText(`${base}/back.html`),
      fetchJson<BuildJson>(`${base}/build.json`),
    ]);

    const iframe = iframeRef.value;
    if (!iframe) return;
    // wait e2e host ready (iframe srcdoc contains hostHtml and stays constant)
    await new Promise<void>((resolve) => {
      const tick = () => {
        if ((iframeRef.value?.contentWindow as any)?.e2eAnki) resolve();
        else requestAnimationFrame(tick);
      };
      tick();
    });

    // abort if a newer render has started
    if (token !== renderToken.value) return;

    const page = iframeRef.value!.contentWindow!;

    // prepare fields
    const baseFields: Record<string, string> = Object.fromEntries(build.fields.map((k) => [k, '']));
    const noteFields = build.notes[0]?.fields ?? {};
    const renderFields = { ...baseFields, ...noteFields };

    // emulate some preferences used by template runtime
    page.localStorage.clear();
    page.sessionStorage.clear();
    page.localStorage.setItem(`at:${effectiveEntry.value}:hideAbout`, 'true');

    const frontHtml = interpolate(front, renderFields);
    const backHtml = interpolate(back, {
      ...renderFields,
      FrontSide: frontHtml,
    });

    // render front and attach flip callback
    (page as any).e2eAnki.clean?.();
    (page as any).e2eAnki.render(frontHtml);
    (page as any).e2eAnki.flipToBack = () => {
      requestAnimationFrame(() => {
        (page as any).e2eAnki.render(backHtml);
        setTimeout(() => {
          page.document.getElementById('answer')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      });
    };
  } catch (e: any) {
    error.value = e?.message || String(e);
  } finally {
    loading.value = false;
  }
}

watch([variantKey], () => {
  loadAndRender();
});

onMounted(() => {
  loadAndRender();
  fetchClassicVersion();
});
</script>

<template>
  <div class="tw-space-y-3 tw-mt-2">
    <div>Latest version: {{ version }}</div>
    <div class="tw-flex tw-items-center tw-gap-3 tw-text-sm tw-text-gray-700">
      <div class="tw-relative">
        <select
          v-model="selectedLocale"
          class="tw-appearance-none tw-bg-transparent tw-pr-5 tw-pl-0 tw-py-1 tw-border-0 tw-cursor-pointer hover:tw-underline focus:tw-outline-none"
        >
          <option v-for="l in locales" :key="l" :value="l">
            {{ l }}
          </option>
        </select>
        <svg
          class="tw-pointer-events-none tw-absolute tw-right-0 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <span class="tw-text-gray-300">·</span>

      <div v-if="options && options.length > 0" class="tw-relative">
        <select
          v-model="selectedOptions"
          class="tw-appearance-none tw-bg-transparent tw-pr-5 tw-pl-0 tw-py-1 tw-border-0 tw-cursor-pointer hover:tw-underline focus:tw-outline-none"
        >
          <option v-for="o in options" :key="o" :value="o">
            {{ o }}
          </option>
        </select>
        <svg
          class="tw-pointer-events-none tw-absolute tw-right-0 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <span v-if="options && options.length > 0" class="tw-text-gray-300">·</span>

      <div class="tw-relative">
        <select
          v-model="selectedField"
          class="tw-appearance-none tw-bg-transparent tw-pr-5 tw-pl-0 tw-py-1 tw-border-0 tw-cursor-pointer hover:tw-underline focus:tw-outline-none"
        >
          <option v-for="f in fields" :key="f" :value="f">
            {{ f }}
          </option>
        </select>
        <svg
          class="tw-pointer-events-none tw-absolute tw-right-0 tw-top-1/2 -tw-translate-y-1/2 tw-w-4 tw-h-4 tw-text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <div class="tw-ml-auto tw-flex tw-items-center tw-gap-3">
        <button
          type="button"
          class="tw-text-gray-700 hover:tw-underline tw-p-1"
          @click="() => (iframeRef?.contentWindow as any)?.e2eAnki?.flipToBack?.()"
        >
          Flip
        </button>
        <a
          class="tw-text-blue-600 hover:tw-underline tw-p-1 tw-font-medium"
          :href="downloadPath"
          :download="downloadName"
        >
          {{ labels.download }}
        </a>
      </div>
    </div>
    <div v-if="loading" class="tw-text-xs tw-text-gray-500 tw-mt-2">Loading…</div>

    <div>
      <div class="tw-border tw-rounded tw-overflow-hidden tw-bg-white tw-h-[680px] tw-shadow-sm">
        <iframe ref="iframeRef" class="tw-w-full tw-h-full" :srcdoc="hostHtml" />
      </div>
      <div v-if="error" class="tw-text-xs tw-text-red-500 tw-mt-2">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<style scoped></style>
