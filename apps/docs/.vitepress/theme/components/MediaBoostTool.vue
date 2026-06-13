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
const result = ref<MediaBoostResult>();
const error = ref('');
const busy = ref(false);
const completed = ref(false);
const dragging = ref(false);
let worker: Worker | undefined;
let requestId = 0;

const labels = computed(() =>
  isZh.value
    ? {
        dropzone: '将 .apkg 文件拖放到此处，或点击选择',
        dropzoneActive: '释放文件以开始分析',
        generate: '生成 Media Boost APKG',
        cancel: '取消',
        reset: '选择其他文件',
        download: '下载文件',
        media: '媒体文件',
        local: '所有处理均在浏览器本地完成，文件不会上传到服务器',
        analyzing: '正在分析 APKG，请稍候…',
        done: '生成完成。请在待媒体同步的设备中导入文件，媒体导入完成后删除 "AnkiEco Media Boost" 牌组。',
        outputSummary: (name: string, size: string, count: number) =>
          `输出文件：${name}（${size}），包含 ${count} 个媒体文件`,
        stageLabels: {
          reading: '正在读取文件',
          'parsing-media': '正在解析媒体',
          'building-collection': '正在构建集合',
          'writing-media': '正在写入媒体',
          finalizing: '正在完成',
        } as Record<string, string>,
      }
    : {
        dropzone: 'Drag and drop an .apkg file here, or click to select',
        dropzoneActive: 'Release to start analysis',
        generate: 'Generate Media Boost APKG',
        cancel: 'Cancel',
        reset: 'Choose another file',
        download: 'Download file',
        media: 'Media files',
        local: 'All processing happens locally in your browser. Nothing is uploaded.',
        analyzing: 'Analyzing the APKG, please wait…',
        done: 'Done. Import the file on the device awaiting media sync, then delete the "AnkiEco Media Boost" deck.',
        outputSummary: (name: string, size: string, count: number) =>
          `Output: ${name} (${size}), ${count} media files`,
        stageLabels: {
          reading: 'Reading file',
          'parsing-media': 'Parsing media',
          'building-collection': 'Building collection',
          'writing-media': 'Writing media',
          finalizing: 'Finalizing',
        } as Record<string, string>,
      },
);

const percent = computed(() => {
  const value = progress.value;
  if (!value || value.total === 0) return 0;
  return Math.round((value.completed / value.total) * 100);
});

const fileName = computed(() => file.value?.name);

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

async function processFile(selected: File) {
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

function onFileInput(event: Event) {
  const selected = (event.target as HTMLInputElement).files?.[0];
  if (selected) processFile(selected);
}

function onDrop(event: DragEvent) {
  dragging.value = false;
  const selected = event.dataTransfer?.files?.[0];
  if (selected?.name.endsWith('.apkg')) processFile(selected);
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
  dragging.value = true;
}

function onDragLeave(event: DragEvent) {
  if ((event.currentTarget as HTMLElement)?.contains(event.relatedTarget as Node)) return;
  dragging.value = false;
}

async function generate() {
  if (!file.value || !analysis.value) return;
  error.value = '';
  completed.value = false;
  result.value = undefined;
  progress.value = undefined;
  busy.value = true;
  try {
    result.value = await runWorker<MediaBoostResult>('generate', { file: file.value });
    const url = URL.createObjectURL(result.value.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.value.outputName;
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

function reset() {
  file.value = undefined;
  analysis.value = undefined;
  progress.value = undefined;
  result.value = undefined;
  error.value = '';
  completed.value = false;
  busy.value = false;
}

function cancel() {
  getWorker().postMessage({ id: String(requestId), type: 'cancel' });
}

function downloadFile() {
  if (!result.value) return;
  const url = URL.createObjectURL(result.value.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = result.value.outputName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

onBeforeUnmount(() => {
  worker?.terminate();
  worker = undefined;
});
</script>

<template>
  <section class="media-boost-tool">
    <div
      v-if="!analysis && !busy"
      class="dropzone"
      :class="{ active: dragging }"
      @drop.prevent="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
    >
      <label class="dropzone-label">
        <svg
          class="dropzone-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M12 16V4m0 0L8 8m4-4l4 4" stroke-linecap="round" stroke-linejoin="round" />
          <path
            d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="dropzone-text">{{ dragging ? labels.dropzoneActive : labels.dropzone }}</span>
        <input type="file" accept=".apkg" class="sr-only" @change="onFileInput" />
      </label>
    </div>

    <template v-if="busy && !analysis">
      <div class="analyzing">
        <div class="spinner" />
        <span>{{ labels.analyzing }}</span>
      </div>
    </template>

    <template v-if="analysis">
      <div class="file-info">
        <svg
          class="file-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path d="M14 2v6h6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="file-name" :title="fileName">{{ fileName }}</span>
        <span class="file-meta"
          >{{ formatBytes(analysis.inputBytes) }} · {{ analysis.mediaCount.toLocaleString() }}
          {{ labels.media }}</span
        >
      </div>

      <div v-if="progress" class="progress">
        <div class="progress-header">
          <span>{{ labels.stageLabels[progress.stage] ?? progress.stage }}</span>
          <span class="progress-percent">{{ percent }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: percent + '%' }" />
        </div>
        <div v-if="progress.currentFile" class="progress-file">{{ progress.currentFile }}</div>
      </div>

      <div class="actions">
        <button v-if="!busy" class="primary" @click="generate">{{ labels.generate }}</button>
        <button v-if="busy" class="secondary" @click="cancel">{{ labels.cancel }}</button>
      </div>

      <p v-if="error" class="message error">{{ error }}</p>

      <div v-if="completed && result" class="success-box">
        <svg
          class="success-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="12" cy="12" r="10" />
        </svg>
        <div>
          <p class="success-text">{{ labels.done }}</p>
          <p class="success-detail">
            {{
              labels.outputSummary(
                result.outputName,
                formatBytes(result.outputBytes),
                result.mediaCount,
              )
            }}
          </p>
        </div>
      </div>

      <div v-if="completed || error" class="actions">
        <button v-if="completed && result" class="primary" @click="downloadFile">
          {{ labels.download }}
        </button>
        <button class="secondary" @click="reset">{{ labels.reset }}</button>
      </div>
    </template>

    <footer class="privacy">{{ labels.local }}</footer>
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.dropzone {
  border: 2px dashed var(--vp-c-divider);
  border-radius: 10px;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.dropzone:hover,
.dropzone.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.dropzone-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  cursor: pointer;
}
.dropzone-icon {
  width: 36px;
  height: 36px;
  color: var(--vp-c-text-3);
}
.dropzone:hover .dropzone-icon,
.dropzone.active .dropzone-icon {
  color: var(--vp-c-brand-1);
}
.dropzone-text {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.analyzing {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: var(--vp-c-bg);
  font-size: 14px;
}
.file-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: var(--vp-c-text-3);
}
.file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
.file-meta {
  flex-shrink: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.progress {
  margin: 20px 0;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-bottom: 6px;
}
.progress-percent {
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.progress-track {
  height: 6px;
  border-radius: 3px;
  background: var(--vp-c-bg);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--vp-c-brand-1);
  transition: width 0.3s ease;
}
.progress-file {
  margin-top: 6px;
  font-size: 12px;
  color: var(--vp-c-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}
button {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}
button.primary {
  color: white;
  background: var(--vp-c-brand-1);
}
button.primary:hover {
  background: var(--vp-c-brand-2);
}
button.secondary {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}
button.secondary:hover {
  background: var(--vp-c-default-1);
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.message {
  margin: 16px 0 0;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
}
.error {
  color: var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft);
}

.success-box {
  display: flex;
  gap: 12px;
  margin: 16px 0 0;
  padding: 16px;
  border-radius: 8px;
  background: var(--vp-c-brand-soft);
}
.success-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  color: var(--vp-c-brand-1);
  margin-top: 1px;
}
.success-text {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}
.success-detail {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.privacy {
  margin: 16px 0 0;
  font-size: 12px;
  color: var(--vp-c-text-3);
  text-align: center;
}
</style>
