import { env, pipeline, RawImage } from '@huggingface/transformers';

// Enforce browser-side caching & disable local filesystem checks
env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
  static task = 'background-removal';
  static model = 'Xenova/modnet';
  static instance: any = null;

  static async getInstance(progress_callback?: (progress: any) => void) {
    if (!this.instance) {
      let device: 'webgpu' | 'wasm' = 'wasm';
      if (typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu) {
        try {
          const adapter = await (navigator as any).gpu.requestAdapter();
          if (adapter) {
            device = 'webgpu';
          }
        } catch {
          device = 'wasm';
        }
      }

      this.instance = await pipeline(this.task as any, this.model, {
        device,
        progress_callback,
      });
    }
    return this.instance;
  }
}

self.addEventListener('message', async (e: MessageEvent) => {
  const { type, id, data, width, height } = e.data;

  if (type === 'init') {
    try {
      self.postMessage({ type: 'status', status: 'loading-model' });
      await PipelineSingleton.getInstance((progressData) => {
        if (progressData && typeof progressData === 'object') {
          self.postMessage({
            type: 'download-progress',
            file: progressData.file || 'model',
            loaded: progressData.loaded || 0,
            total: progressData.total || 0,
            progress: typeof progressData.progress === 'number' ? progressData.progress : 0,
          });
        }
      });
      self.postMessage({ type: 'status', status: 'ready' });
    } catch (err: any) {
      self.postMessage({
        type: 'error',
        error: err?.message || 'Failed to initialize AI background removal model.',
      });
    }
    return;
  }

  if (type === 'process') {
    try {
      self.postMessage({ type: 'status', status: 'processing' });

      const pipe = await PipelineSingleton.getInstance((progressData) => {
        if (progressData && typeof progressData === 'object') {
          self.postMessage({
            type: 'download-progress',
            file: progressData.file || 'model',
            loaded: progressData.loaded || 0,
            total: progressData.total || 0,
            progress: typeof progressData.progress === 'number' ? progressData.progress : 0,
          });
        }
      });

      // Construct RawImage from transferable RGBA Uint8ClampedArray
      const rawImage = new RawImage(new Uint8ClampedArray(data), width, height, 4);

      // Execute MODNet background removal
      const output = await pipe(rawImage);

      // Extract result RGBA buffer containing the alpha matte
      const outputBuffer = output.data.buffer;

      (self as any).postMessage(
        {
          type: 'done',
          id,
          data: outputBuffer,
          width: output.width,
          height: output.height,
        },
        // Transfer ArrayBuffer for zero-copy high performance
        [outputBuffer]
      );
      self.postMessage({ type: 'status', status: 'ready' });
    } catch (err: any) {
      self.postMessage({
        type: 'error',
        id,
        error: err?.message || 'AI inference failed. The image may be too large for device memory.',
      });
    }
  }
});
