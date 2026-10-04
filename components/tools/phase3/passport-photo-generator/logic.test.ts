import {
  PASSPORT_PRESETS,
  PRINT_PAPERS,
  DEFAULT_TRANSFORM,
  computePrintSheetLayout,
  mmToPixels,
  inchesToPixels,
  drawNameOverlay,
} from "./logic";

export function runTests(): boolean {
  let passed = true;

  function assert(cond: boolean, msg: string) {
    if (!cond) {
      console.error(`❌ [passport-photo-generator] Test failed: ${msg}`);
      passed = false;
    }
  }

  // 1. Verify Presets Integrity
  assert(PASSPORT_PRESETS.length >= 10, "Should contain at least 10 official presets");

  const usPreset = PASSPORT_PRESETS.find((p) => p.id === "us-passport");
  assert(Boolean(usPreset), "US Passport preset must exist");
  assert(usPreset?.widthMm === 51 && usPreset?.heightMm === 51, "US Passport dimensions 51x51mm");
  assert(usPreset?.targetWidthPx === 600 && usPreset?.targetHeightPx === 600, "US Passport 600x600 px @ 300 DPI");

  const inPreset = PASSPORT_PRESETS.find((p) => p.id === "in-passport");
  assert(Boolean(inPreset), "India Passport preset must exist");
  assert(inPreset?.widthMm === 35 && inPreset?.heightMm === 45, "India Passport dimensions 35x45mm");
  assert(inPreset?.targetWidthPx === 413 && inPreset?.targetHeightPx === 531, "India Passport 413x531 px @ 300 DPI");

  // 2. Unit Conversions
  const mmPx = mmToPixels(50.8, 300); // 2 inches in mm
  assert(Math.abs(mmPx - 600) <= 1, "50.8 mm should convert to ~600 px at 300 DPI");

  const inPx = inchesToPixels(2, 300);
  assert(inPx === 600, "2 inches should convert to 600 px at 300 DPI");

  // 3. Print Sheet Layout Calculation
  const paper4x6 = PRINT_PAPERS.find((p) => p.id === "4x6")!;
  assert(Boolean(paper4x6), "4x6 paper preset must exist");

  // Test 2x2 US photo on 4x6" paper
  const usSheet = computePrintSheetLayout(paper4x6, usPreset!);
  assert(usSheet.totalPhotos >= 4, `4x6" paper should hold at least 4 2x2" photos (got ${usSheet.totalPhotos})`);
  assert(usSheet.offsetX >= 0 && usSheet.offsetY >= 0, "Grid offsets must be non-negative");

  // Test 35x45mm India photo on 4x6" paper
  const inSheet = computePrintSheetLayout(paper4x6, inPreset!);
  assert(inSheet.totalPhotos >= 6, `4x6" paper should hold at least 6 35x45mm photos (got ${inSheet.totalPhotos})`);

  // Test Single Photo format
  const singlePaper = PRINT_PAPERS.find((p) => p.id === "single")!;
  const singleSheet = computePrintSheetLayout(singlePaper, usPreset!);
  assert(singleSheet.totalPhotos === 1, "Single format must output exactly 1 photo");
  assert(singleSheet.cellWidthPx === 600, "Single format cell width matches preset");

  // 4. US Letter Paper & Requested Photo Count Calculation
  const paperLetter = PRINT_PAPERS.find((p) => p.id === "letter")!;
  assert(Boolean(paperLetter), "US Letter paper preset must exist");
  assert(paperLetter.pdfWidthPt === 612 && paperLetter.pdfHeightPt === 792, "US Letter 612x792 pt");

  const letterFullSheet = computePrintSheetLayout(paperLetter, inPreset!);
  assert(letterFullSheet.totalCapacity >= 15, `Letter paper should hold >= 15 photos (got ${letterFullSheet.totalCapacity})`);
  assert(letterFullSheet.photosToRender === letterFullSheet.totalCapacity, "Full sheet renders totalCapacity");

  const letter4Photos = computePrintSheetLayout(paperLetter, inPreset!, 4);
  assert(letter4Photos.photosToRender === 4, `Requested 4 photos must return photosToRender=4 (got ${letter4Photos.photosToRender})`);
  assert(letter4Photos.totalCapacity === letterFullSheet.totalCapacity, "Total capacity remains constant");

  // 5. Name and Date Overlay Functionality
  const mockCtx = {
    save: () => {},
    restore: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fillText: () => {},
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    textAlign: "center",
    textBaseline: "middle",
  } as unknown as CanvasRenderingContext2D;

  // Should not throw under any scenario
  drawNameOverlay(mockCtx, 413, 531, { enabled: false, name: "JOHN DOE", date: "15/10/2026" });
  drawNameOverlay(mockCtx, 413, 531, { enabled: true, name: "JOHN DOE", date: "15/10/2026" });
  drawNameOverlay(mockCtx, 413, 531, { enabled: true, name: "JOHN DOE", date: "" });
  drawNameOverlay(mockCtx, 413, 531, { enabled: true, name: "", date: "15/10/2026" });
  drawNameOverlay(mockCtx, 413, 531, { enabled: true, name: "", date: "" });

  // 6. Default Transform sanity
  assert(DEFAULT_TRANSFORM.zoom === 1.0, "Default zoom is 1.0");
  assert(DEFAULT_TRANSFORM.rotation === 0, "Default rotation is 0");
  assert(DEFAULT_TRANSFORM.flipH === false, "Default flip is false");

  return passed;
}
