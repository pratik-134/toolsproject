import { env, pipeline, RawImage } from '@huggingface/transformers';
import { postProcessAlphaMatte } from './logic';

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

      try {
        this.instance = await pipeline(this.task as any, this.model, {
          device,
          dtype: 'fp32',
          progress_callback,
        });
      } catch (initErr) {
        // If WebGPU shader compilation or memory allocation failed, fallback to WASM
        if (device === 'webgpu') {
          console.warn('WebGPU pipeline initialization failed, falling back to WASM:', initErr);
          this.instance = await pipeline(this.task as any, this.model, {
            device: 'wasm',
            dtype: 'fp32',
            progress_callback,
          });
        } else {
          throw initErr;
        }
      }
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
      self.postMessage({ type: 'status', status: 'loading-model' });

      const pipe = await PipelineSingleton.getInstance((progressData) => {
        if (progressData && typeof progressData === 'object') {
          if (progressData.status === 'progress' || typeof progressData.progress === 'number') {
            self.postMessage({
              type: 'download-progress',
              file: progressData.file || 'model',
              loaded: progressData.loaded || 0,
              total: progressData.total || 0,
              progress: Math.min(100, Math.max(0, progressData.progress || 0)),
            });
          }
        }
      });

      // Model is fully loaded in memory! Now signal active background removal
      self.postMessage({
        type: 'status',
        status: 'removing-bg',
        message: 'AI neural network removing background...',
      });

      // Construct RawImage from transferable RGBA Uint8ClampedArray
      const rawImage = new RawImage(new Uint8ClampedArray(data), width, height, 4);

      // Execute MODNet background removal with fallback on GPU inference error
      let output: any;
      try {
        output = await pipe(rawImage);
      } catch (gpuInferErr) {
        console.warn('WebGPU inference failed, retrying with WASM pipeline:', gpuInferErr);
        PipelineSingleton.instance = await pipeline(
          PipelineSingleton.task as any,
          PipelineSingleton.model,
          {
            device: 'wasm',
            dtype: 'fp32',
          }
        );
        output = await PipelineSingleton.instance(rawImage);
      }

      // Extract raw RGBA taking byteOffset into account
      const rawOutputData = new Uint8ClampedArray(
        output.data.buffer,
        output.data.byteOffset,
        output.data.byteLength
      );

      // Post-process the matte: fixes double-sigmoid bug, cleans low-alpha background noise, and solidifies foreground
      const cleanedRgba = postProcessAlphaMatte(rawOutputData, output.width, output.height);
      const outputBuffer = cleanedRgba.buffer;

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
