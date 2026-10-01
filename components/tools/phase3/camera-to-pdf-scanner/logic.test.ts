import {
  applyDocumentFilter,
  calculateA4Fitting,
} from "./logic";

export function runTests(): boolean {
  // Test 1: A4 Fitting calculations
  const fit = calculateA4Fitting(1000, 1414, 595.28, 841.89, 20);
  if (fit.width <= 0 || fit.height <= 0 || fit.x < 20 || fit.y < 20) {
    throw new Error(`Unexpected A4 fit: ${JSON.stringify(fit)}`);
  }

  // Test 2: Filter mock
  const mockData = new Uint8ClampedArray([200, 100, 50, 255]); // 1 pixel
  const mockImageData = { data: mockData } as ImageData;

  applyDocumentFilter(mockImageData, "grayscale");
  // Perceptual gray: 0.299*200 + 0.587*100 + 0.114*50 = 59.8 + 58.7 + 5.7 = 124.2
  if (mockData[0] !== mockData[1] || mockData[1] !== mockData[2]) {
    throw new Error("Grayscale pixel values must be identical across R, G, B");
  }

  // Test 3: High-contrast threshold
  applyDocumentFilter(mockImageData, "high-contrast");
  if (mockData[0] !== 0 && mockData[0] !== 255) {
    throw new Error("High contrast pixel must be pure 0 or 255");
  }

  return true;
}
