<script setup lang="ts">
import type {
  MediaBoostAnalysis,
  MediaBoostProgress,
  MediaBoostResult,
} from '@anki-eco/media-boost';
import { computed, onBeforeUnmount, ref } from 'vue';
import { useData } from 'vitepress';

const { lang } = useData();
const isZh = computed(() => lang.value === 'zh');
const file = ref<File>();
const analysis = ref<MediaBoostAnalysis>();
const progress = ref<MediaBoostProgress>();
const error = ref('');
const busy = ref(false);
const completed = ref(false);
let worker: Worker | undefined;
let requestId = 0;

const labels = computed(() =>
  isZh.value
    ? {
        choose: '选择 APKG',
        generate: '生成 Media Boost APKG',
        cancel: '取消',
        media: '媒体文件',
        notes: '辅助笔记',
        size: '输入大小',
        local: '文件只在本地浏览器中处理，不会上传到服务器。',
        analyzing: '正在分析 APKG，请稍候。大文件可能需要一些时间。',
        done: '生成完成。请在设备 B 导入文件，媒体导入完成后删除 “AnkiEco Media Boost” 牌组。',
      }
    : {
        choose: 'Choose APKG',
        generate: 'Generate Media Boost APKG',
        cancel: 'Cancel',
        media: 'Media files',
        notes: 'Helper notes',
        size: 'Input size',
        local: 'Your file is processed locally in this browser and is never uploaded.',
        analyzing: 'Analyzing the APKG. Large files may take a moment.',
        done: 'Done. Import the file on device B, then delete the “AnkiEco Media Boost” deck.',
      },
);

const percent = computed(() => {
  const value = progress.value;
  if (!value || value.total === 0) return 0;
  return Math.round((value.completed / value.total) * 100);
});

function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GiB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function getWorker() {
  return (worker ??= new Worker(new URL('./MediaBoostTool.worker.ts', import.meta.url), {
    type: 'module',
  }));
}

function runWorker<T>(type: 'analyze' | 'generate', payload: Record<string, unknown>): Promise<T> {
  const activeWorker = getWorker();
  const id = String(++requestId);
  return new Promise((resolve, reject) => {
    const listener = (event: MessageEvent) => {
      if (event.data.id !== id) return;
      if (event.data.type === 'progress') {
        progress.value = event.data.progress;
      } else {
        activeWorker.removeEventListener('message', listener);
        if (event.data.type === 'result') resolve(event.data.result);
        else reject(Object.assign(new Error(event.data.error.message), event.data.error));
      }
    };
    activeWorker.addEventListener('message', listener);
    activeWorker.postMessage({ id, type, ...payload });
  });
}

async function selectFile(event: Event) {
  const selected = (event.target as HTMLInputElement).files?.[0];
  if (!selected) return;
  file.value = selected;
  analysis.value = undefined;
  completed.value = false;
  error.value = '';
  busy.value = true;
  try {
    analysis.value = await runWorker<MediaBoostAnalysis>('analyze', { file: selected });
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason);
  } finally {
    busy.value = false;
  }
}

async function generate() {
  if (!file.value || !analysis.value) return;
  error.value = '';
  completed.value = false;
  progress.value = undefined;
  busy.value = true;
  try {
    const result = await runWorker<MediaBoostResult>('generate', { file: file.value });
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.outputName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    completed.value = true;
  } catch (reason) {
    if ((reason as { code?: string }).code !== 'ABORTED') {
      error.value = reason instanceof Error ? reason.message : String(reason);
    }
  } finally {
    busy.value = false;
  }
}

function cancel() {
  getWorker().postMessage({ id: String(requestId), type: 'cancel' });
}

onBeforeUnmount(() => {
  worker?.terminate();
  worker = undefined;
});
</script>

<template>
  <section class="media-boost-tool">
    <p class="privacy">{{ labels.local }}</p>
    <label class="file-picker">
      <span>{{ labels.choose }}</span>
      <input type="file" accept=".apkg" :disabled="busy" @change="selectFile" />
    </label>

    <dl v-if="analysis" class="analysis">
      <div>
        <dt>{{ labels.size }}</dt>
        <dd>{{ formatBytes(analysis.inputBytes) }}</dd>
      </div>
      <div>
        <dt>{{ labels.media }}</dt>
        <dd>{{ analysis.mediaCount.toLocaleString() }}</dd>
      </div>
      <div>
        <dt>{{ labels.notes }}</dt>
        <dd>{{ analysis.helperNoteCount.toLocaleString() }}</dd>
      </div>
    </dl>

    <p v-if="busy && !analysis && !progress" class="message">{{ labels.analyzing }}</p>

    <div v-if="progress" class="progress">
      <div class="progress-label">
        <span>{{ progress.stage }}</span
        ><span>{{ percent }}%</span>
      </div>
      <progress :value="progress.completed" :max="progress.total || 1" />
      <small v-if="progress.currentFile">{{ progress.currentFile }}</small>
    </div>

    <div class="actions">
      <button :disabled="!analysis || busy" @click="generate">{{ labels.generate }}</button>
      <button v-if="busy" class="secondary" @click="cancel">{{ labels.cancel }}</button>
    </div>

    <p v-if="error" class="message error">{{ error }}</p>
    <p v-if="completed" class="message success">{{ labels.done }}</p>
  </section>
</template>

<style scoped>
.media-boost-tool {
  margin: 24px 0;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.privacy {
  margin-top: 0;
}
.file-picker {
  display: grid;
  gap: 8px;
  font-weight: 600;
}
.analysis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 20px 0;
}
.analysis div {
  padding: 12px;
  border-radius: 8px;
  background: var(--vp-c-bg);
}
.analysis dt {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
.analysis dd {
  margin: 4px 0 0;
  font-weight: 700;
}
.progress {
  margin: 20px 0;
}
.progress-label {
  display: flex;
  justify-content: space-between;
}
progress {
  width: 100%;
}
.progress small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.actions {
  display: flex;
  gap: 10px;
}
button {
  padding: 8px 16px;
  border-radius: 8px;
  color: white;
  background: var(--vp-c-brand-1);
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
button.secondary {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}
.message {
  margin-bottom: 0;
  padding: 12px;
  border-radius: 8px;
}
.error {
  color: var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft);
}
.success {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
@media (max-width: 640px) {
  .analysis {
    grid-template-columns: 1fr;
  }
}
</style>
