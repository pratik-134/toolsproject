import {
  parseQRPayload,
  checkFinderPatternRatio,
  decodeQRCodewords,
  scanQRCode,
  ImageDataLike,
} from "./logic";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`[qr-scanner] Assertion failed: ${msg}`);
}

export function runTests(): boolean {
  // 1. Test Wi-Fi Payload Parsing
  const wifiRaw = "WIFI:S:OfficeGuest;T:WPA;P:SecretKey2026;H:false;;";
  const parsedWifi = parseQRPayload(wifiRaw);
  assert(parsedWifi.type === "wifi", "Expected type 'wifi'");
  assert(parsedWifi.wifi?.ssid === "OfficeGuest", `Expected ssid OfficeGuest, got ${parsedWifi.wifi?.ssid}`);
  assert(parsedWifi.wifi?.password === "SecretKey2026", "Password mismatch");
  assert(parsedWifi.wifi?.authType === "WPA", "AuthType mismatch");

  // 2. Test vCard Payload Parsing
  const vcardRaw = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:Dr. Jane Watson",
    "TEL:+1-555-0199",
    "EMAIL:jane@watson.org",
    "ORG:Baker Street Health",
    "TITLE:Lead Researcher",
    "END:VCARD"
  ].join("\n");
  const parsedVCard = parseQRPayload(vcardRaw);
  assert(parsedVCard.type === "vcard", "Expected type 'vcard'");
  assert(parsedVCard.vcard?.name === "Dr. Jane Watson", "vCard name mismatch");
  assert(parsedVCard.vcard?.phone === "+1-555-0199", "vCard phone mismatch");
  assert(parsedVCard.vcard?.email === "jane@watson.org", "vCard email mismatch");
  assert(parsedVCard.vcard?.organization === "Baker Street Health", "vCard org mismatch");

  // 3. Test URL Payload Parsing
  const urlRaw = "https://cleartrix.com/tools/developer/json-formatter";
  const parsedUrl = parseQRPayload(urlRaw);
  assert(parsedUrl.type === "url", "Expected type 'url'");
  assert(parsedUrl.url === urlRaw, "URL string mismatch");

  // 4. Test Email Payload Parsing
  const emailRaw = "mailto:team@cleartrix.com?subject=Inquiry&body=Hello%20Team";
  const parsedEmail = parseQRPayload(emailRaw);
  assert(parsedEmail.type === "email", "Expected type 'email'");
  assert(parsedEmail.email?.address === "team@cleartrix.com", "Email address mismatch");
  assert(parsedEmail.email?.subject === "Inquiry", "Email subject mismatch");

  // 5. Test Phone and SMS
  const phoneRaw = "tel:+14155552671";
  const parsedPhone = parseQRPayload(phoneRaw);
  assert(parsedPhone.type === "phone", "Expected type 'phone'");
  assert(parsedPhone.phone === "+14155552671", "Phone mismatch");

  const smsRaw = "smsto:5551234:Need assistance";
  const parsedSms = parseQRPayload(smsRaw);
  assert(parsedSms.type === "sms", "Expected type 'sms'");
  assert(parsedSms.sms?.number === "5551234", "SMS number mismatch");
  assert(parsedSms.sms?.message === "Need assistance", "SMS message mismatch");

  // 6. Test Plain Text
  const textRaw = "Cleartrix is a 100% private, client-side toolkit.";
  const parsedText = parseQRPayload(textRaw);
  assert(parsedText.type === "text", "Expected type 'text'");
  assert(parsedText.raw === textRaw, "Text raw mismatch");

  // 7. Test Finder Pattern Ratio (1:1:3:1:1)
  const validPattern = [10, 10, 30, 10, 10];
  assert(checkFinderPatternRatio(validPattern) === true, "Valid 1:1:3:1:1 pattern should match");

  const skewedValid = [9, 11, 29, 10, 11];
  assert(checkFinderPatternRatio(skewedValid) === true, "Slightly skewed pattern should match");

  const invalidPattern = [10, 10, 10, 10, 10];
  assert(checkFinderPatternRatio(invalidPattern) === false, "1:1:1:1:1 pattern should not match");

  // 8. Test decodeQRCodewords (Byte Mode: mode 4, count 4, 'TEST')
  // Mode 4 = '0100'
  // Length 4 = '00000100'
  // 'T' = 84 = '01010100'
  // 'E' = 69 = '01000101'
  // 'S' = 83 = '01010011'
  // 'T' = 84 = '01010100'
  // Binary string: 0100 0000 0100 0101 0100 0100 0101 0101 0011 0101 0100 0000 (term)
  // Bytes: 0x40, 0x45, 0x44, 0x55, 0x35, 0x40
  const byteStream = [0x40, 0x45, 0x44, 0x55, 0x35, 0x40];
  const decodedText = decodeQRCodewords(byteStream);
  assert(decodedText === "TEST", `Expected "TEST", got "${decodedText}"`);

  // 9. Test Synthetic Image Scan with 3 Finder Patterns
  const imgWidth = 200;
  const imgHeight = 200;
  const pixelData = new Uint8ClampedArray(imgWidth * imgHeight * 4);
  pixelData.fill(255); // initialize white

  // Helper to draw a 7x7 module finder pattern centered at (cx, cy) with module size m
  const drawFinder = (cx: number, cy: number, m: number) => {
    for (let dy = -3 * m; dy <= 3 * m; dy++) {
      for (let dx = -3 * m; dx <= 3 * m; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || x >= imgWidth || y < 0 || y >= imgHeight) continue;

        const distMax = Math.max(Math.abs(dx), Math.abs(dy));
        // Ring 1 (outer 7x7): distMax <= 3*m -> Black
        // Ring 2 (inner 5x5): distMax <= 2*m -> White
        // Ring 3 (center 3x3): distMax <= 1*m -> Black
        const isBlack = distMax <= m || distMax > 2 * m;

        if (isBlack) {
          const idx = (y * imgWidth + x) * 4;
          pixelData[idx] = 0;
          pixelData[idx + 1] = 0;
          pixelData[idx + 2] = 0;
        }
      }
    }
  };

  // Draw 3 finder patterns: Top-Left (40, 40), Top-Right (160, 40), Bottom-Left (40, 160)
  drawFinder(40, 40, 4);
  drawFinder(160, 40, 4);
  drawFinder(40, 160, 4);

  const scanRes = scanQRCode({
    width: imgWidth,
    height: imgHeight,
    data: pixelData,
  });

  assert(scanRes.found === true, "scanQRCode should detect valid QR code geometry");
  assert(scanRes.confidence !== undefined && scanRes.confidence > 0.9, "High confidence expected");

  // 10. Blank & Tiny Image Edge Cases
  const blankRes = scanQRCode({
    width: 100,
    height: 100,
    data: new Uint8ClampedArray(100 * 100 * 4).fill(255),
  });
  assert(blankRes.found === false, "Blank image should return found=false");

  const tinyRes = scanQRCode({
    width: 10,
    height: 10,
    data: new Uint8ClampedArray(10 * 10 * 4),
  });
  assert(tinyRes.found === false, "Tiny image should return found=false");

  return true;
}
