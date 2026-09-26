import {
  getRunLengths,
  binarizeRow,
  decodeCode128FromRuns,
  decodeEan13FromRuns,
  decodeCode39FromRuns,
  scanBarcode,
  ImageDataLike,
  RunLength,
} from "./logic";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`[barcode-scanner] Assertion failed: ${msg}`);
}

export function runTests(): boolean {
  // 1. Test getRunLengths
  const binaryLine = [true, true, true, false, false, true, false, false, false];
  const runs = getRunLengths(binaryLine);
  assert(runs.length === 4, `Expected 4 runs, got ${runs.length}`);
  assert(runs[0]?.isBlack === true && runs[0]?.length === 3, "Run 0 mismatch");
  assert(runs[1]?.isBlack === false && runs[1]?.length === 2, "Run 1 mismatch");
  assert(runs[2]?.isBlack === true && runs[2]?.length === 1, "Run 2 mismatch");
  assert(runs[3]?.isBlack === false && runs[3]?.length === 3, "Run 3 mismatch");

  // 2. Test binarizeRow
  // Create a 4x1 image: black (0), dark gray (50), light gray (200), white (255)
  const imgMock: ImageDataLike = {
    width: 4,
    height: 1,
    data: new Uint8ClampedArray([
      0, 0, 0, 255,     // x=0: lum=0 (black)
      50, 50, 50, 255,  // x=1: lum=50 (dark)
      200, 200, 200, 255, // x=2: lum=200 (light)
      255, 255, 255, 255  // x=3: lum=255 (white)
    ]),
  };
  const binarized = binarizeRow(imgMock, 0, 128);
  assert(binarized.length === 4, "Binarized length mismatch");
  assert(binarized[0] === true, "x=0 should be black");
  assert(binarized[1] === true, "x=1 should be black");
  assert(binarized[2] === false, "x=2 should be white");
  assert(binarized[3] === false, "x=3 should be white");

  // 3. Test Synthetic Code 128B Decoding
  // Code 128B for "AB":
  // Start B (104): "211214" -> 2B, 1W, 1B, 2W, 1B, 4W
  // 'A' (33): "111323" -> 1B, 1W, 1B, 3W, 2B, 3W
  // 'B' (34): "131123" -> 1B, 3W, 1B, 1W, 2B, 3W
  // Checksum: (104 + 1*33 + 2*34) % 103 = (104 + 33 + 68) % 103 = 205 % 103 = 102
  // Checksum symbol 102: "411131" -> 4B, 1W, 1B, 1W, 3B, 1W
  // Stop (106): "2331112" -> 2B, 3W, 3B, 1W, 1B, 1W, 2B
  const moduleSize = 3;
  const patternStrings = [
    { pat: "211214", startBlack: true }, // Start B
    { pat: "111323", startBlack: true }, // 'A'
    { pat: "131123", startBlack: true }, // 'B'
    { pat: "411131", startBlack: true }, // Checksum (102)
    { pat: "2331112", startBlack: true } // Stop (106)
  ];

  const code128Runs: RunLength[] = [
    { isBlack: false, length: 15 } // Quiet zone before
  ];

  for (const item of patternStrings) {
    let isB = item.startBlack;
    for (let c = 0; c < item.pat.length; c++) {
      const len = parseInt(item.pat.charAt(c), 10) * moduleSize;
      code128Runs.push({ isBlack: isB, length: len });
      isB = !isB;
    }
  }
  code128Runs.push({ isBlack: false, length: 20 }); // Quiet zone after

  const decoded128 = decodeCode128FromRuns(code128Runs);
  assert(decoded128 !== null, "Code 128 decode returned null");
  assert(decoded128?.text === "AB", `Expected "AB", got "${decoded128?.text}"`);
  assert(decoded128?.checksumValid === true, "Checksum should be valid for Code 128 AB");

  // 4. Test Code 39 Decoding
  // Code 39 for "*CAT*"
  // '*' = "010010100" (n, w, n, n, w, n, w, n, n)
  // 'C' = "101001000" (w, n, w, n, n, w, n, n, n)
  // 'A' = "100001001" (w, n, n, n, n, w, n, n, w)
  // 'T' = "000010110" (n, n, n, n, w, n, w, w, n)
  // '*' = "010010100"
  const narrowW = 2;
  const wideW = 6;
  const code39Patterns = ["010010100", "101001000", "100001001", "000010110", "010010100"];

  const code39Runs: RunLength[] = [
    { isBlack: false, length: 10 } // Quiet zone
  ];

  for (let idx = 0; idx < code39Patterns.length; idx++) {
    const pat = code39Patterns[idx] ?? "";
    for (let j = 0; j < 9; j++) {
      const isBlack = j % 2 === 0;
      const isWide = pat.charAt(j) === "1";
      code39Runs.push({ isBlack, length: isWide ? wideW : narrowW });
    }
    // Inter-character space (except after final stop)
    if (idx < code39Patterns.length - 1) {
      code39Runs.push({ isBlack: false, length: narrowW });
    }
  }
  code39Runs.push({ isBlack: false, length: 10 });

  const decoded39 = decodeCode39FromRuns(code39Runs);
  assert(decoded39 !== null, "Code 39 decode returned null");
  assert(decoded39?.text === "CAT", `Expected "CAT", got "${decoded39?.text}"`);

  // 5. Test scanBarcode with synthetic image
  // Build a 120x30 image containing our Code 128 barcode
  const imgWidth = 200;
  const imgHeight = 40;
  const pixelData = new Uint8ClampedArray(imgWidth * imgHeight * 4);
  pixelData.fill(255); // initialize white

  // Render the Code 128 pattern across rows y=10 to 30
  let currentX = 20;
  for (const item of patternStrings) {
    let isB = item.startBlack;
    for (let c = 0; c < item.pat.length; c++) {
      const len = parseInt(item.pat.charAt(c), 10) * 1;
      if (isB) {
        for (let dy = 10; dy < 30; dy++) {
          for (let dx = 0; dx < len; dx++) {
            const px = currentX + dx;
            if (px < imgWidth) {
              const idx = (dy * imgWidth + px) * 4;
              pixelData[idx] = 0;     // R
              pixelData[idx + 1] = 0; // G
              pixelData[idx + 2] = 0; // B
            }
          }
        }
      }
      currentX += len;
      isB = !isB;
    }
  }

  const scanResult = scanBarcode({
    width: imgWidth,
    height: imgHeight,
    data: pixelData,
  });

  assert(scanResult.found === true, "scanBarcode failed to find Code 128 barcode in image");
  assert(scanResult.text === "AB", `Expected "AB", got "${scanResult.text}"`);
  assert(scanResult.format === "CODE128", "Expected CODE128 format");

  // 6. Test Edge Cases: Blank image, tiny image
  const blankImg: ImageDataLike = {
    width: 50,
    height: 30,
    data: new Uint8ClampedArray(50 * 30 * 4).fill(255),
  };
  const blankRes = scanBarcode(blankImg);
  assert(blankRes.found === false, "Blank image should return found=false");

  const tinyImg: ImageDataLike = {
    width: 5,
    height: 5,
    data: new Uint8ClampedArray(5 * 5 * 4),
  };
  const tinyRes = scanBarcode(tinyImg);
  assert(tinyRes.found === false, "Tiny image should return found=false");

  return true;
}
