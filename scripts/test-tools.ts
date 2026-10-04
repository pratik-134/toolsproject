import { runTests as testJson } from "../components/tools/pilot/json-formatter/logic.test";
import { runTests as testBase64 } from "../components/tools/pilot/base64-converter/logic.test";
import { runTests as testWordCounter } from "../components/tools/pilot/word-counter/logic.test";
import { runTests as testMortgage } from "../components/tools/pilot/mortgage-calculator/logic.test";
import { runTests as testQr } from "../components/tools/pilot/qr-generator/logic.test";

// Phase 1 tools
import { runTests as testCsvJson } from "../components/tools/phase1/csv-json/logic.test";
import { runTests as testHash } from "../components/tools/phase1/hash-generator/logic.test";
import { runTests as testPassword } from "../components/tools/phase1/password-generator/logic.test";
import { runTests as testCase } from "../components/tools/phase1/case-converter/logic.test";
import { runTests as testCompoundInterest } from "../components/tools/phase1/compound-interest/logic.test";
import { runTests as testUrlEncoder } from "../components/tools/phase1/url-encoder/logic.test";
import { runTests as testLorem } from "../components/tools/phase1/lorem-generator/logic.test";
import { runTests as testPercentage } from "../components/tools/phase1/percentage-calculator/logic.test";
import { runTests as testBmi } from "../components/tools/phase1/bmi-calculator/logic.test";
import { runTests as testBarcode } from "../components/tools/phase1/barcode-generator/logic.test";
import { runTests as testDedupe } from "../components/tools/phase1/duplicate-line-remover/logic.test";
import { runTests as testBeautifier } from "../components/tools/phase1/html-beautifier/logic.test";
import { runTests as testDiff } from "../components/tools/phase1/text-diff/logic.test";
import { runTests as testDateCalc } from "../components/tools/phase1/date-calculator/logic.test";
import { runTests as testUnitConv } from "../components/tools/phase1/unit-converter/logic.test";
import { runTests as testRegex } from "../components/tools/phase1/regex-tester/logic.test";
import { runTests as testHtmlEntity } from "../components/tools/phase1/html-entity-encoder/logic.test";
import { runTests as testAge } from "../components/tools/phase1/age-calculator/logic.test";
import { runTests as testDiscount } from "../components/tools/phase1/discount-calculator/logic.test";
import { runTests as testJsonXml } from "../components/tools/phase1/json-xml-converter/logic.test";
import { runTests as testEpoch } from "../components/tools/phase1/epoch-converter/logic.test";
import { runTests as testBase } from "../components/tools/phase1/base-converter/logic.test";
import { runTests as testSalesTax } from "../components/tools/phase1/sales-tax-calculator/logic.test";
import { runTests as testFreelance } from "../components/tools/phase1/freelance-rate-calculator/logic.test";
import { runTests as testUnicode } from "../components/tools/phase1/unicode-normalizer/logic.test";
import { runTests as testSqlFormatter } from "../components/tools/phase1/sql-formatter/logic.test";
import { runTests as testHmac } from "../components/tools/phase1/hmac-generator/logic.test";
import { runTests as testCalorie } from "../components/tools/phase1/calorie-calculator/logic.test";
import { runTests as testWaterIntake } from "../components/tools/phase1/water-intake-calculator/logic.test";
import { runTests as testJsonYaml } from "../components/tools/phase1/json-yaml-converter/logic.test";
import { runTests as testChecksum } from "../components/tools/phase1/checksum-verifier/logic.test";
import { runTests as testAutoLoan } from "../components/tools/phase1/auto-loan-calculator/logic.test";
import { runTests as testScientific } from "../components/tools/phase1/scientific-calculator/logic.test";
import { runTests as testJsonSchema } from "../components/tools/phase1/json-schema-validator/logic.test";
import { runTests as testAspectRatio } from "../components/tools/phase1/aspect-ratio-calculator/logic.test";
import { runTests as testCodeMinifier } from "../components/tools/phase1/code-minifier/logic.test";
import { runTests as testChmod } from "../components/tools/phase1/chmod-calculator/logic.test";
import { runTests as testBmr } from "../components/tools/phase1/bmr-tdee-calculator/logic.test";
import { runTests as testInflation } from "../components/tools/phase1/inflation-calculator/logic.test";
import { runTests as testIpSubnet } from "../components/tools/phase1/ip-subnet-calculator/logic.test";
import { runTests as testStats } from "../components/tools/phase1/statistics-calculator/logic.test";
import { runTests as testFraction } from "../components/tools/phase1/fraction-simplifier/logic.test";
import { runTests as testGeometry } from "../components/tools/phase1/geometry-calculator/logic.test";
import { runTests as testTimeCard } from "../components/tools/phase1/time-card-calculator/logic.test";
import { runTests as testWorldClock } from "../components/tools/phase1/world-clock-converter/logic.test";
import { runTests as testBandwidth } from "../components/tools/phase1/bandwidth-calculator/logic.test";
import { runTests as testSip } from "../components/tools/phase1/sip-calculator/logic.test";
import { runTests as testRetirement } from "../components/tools/phase1/retirement-401k-calculator/logic.test";
import { runTests as testDebtPayoff } from "../components/tools/phase1/debt-payoff-calculator/logic.test";
import { runTests as testRoi } from "../components/tools/phase1/roi-calculator/logic.test";
import { runTests as testProfitMargin } from "../components/tools/phase1/profit-margin-calculator/logic.test";
import { runTests as testBreakEven } from "../components/tools/phase1/break-even-calculator/logic.test";
import { runTests as testPayroll } from "../components/tools/phase1/payroll-paycheck-calculator/logic.test";
import { runTests as testBodyFat } from "../components/tools/phase1/body-fat-calculator/logic.test";
import { runTests as testHeartRate } from "../components/tools/phase1/target-heart-rate-calculator/logic.test";
import { runTests as testPregnancy } from "../components/tools/phase1/pregnancy-due-date-calculator/logic.test";
import { runTests as testSqlDump } from "../components/tools/phase1/sql-dump-to-csv/logic.test";
import { runTests as testExcel } from "../components/tools/phase1/excel-to-json-csv/logic.test";
import { runTests as testArchiveExtractor } from "../components/tools/phase1/archive-extractor/logic.test";
import { runTests as testArchivePacker } from "../components/tools/phase1/archive-packer/logic.test";
import { runTests as testBarcodeScanner } from "../components/tools/phase1/barcode-scanner/logic.test";
import { runTests as testQrScanner } from "../components/tools/phase1/qr-scanner/logic.test";
import { runTests as testAtsChecker } from "../components/tools/phase1/ats-resume-checker/logic.test";
import { runTests as testResumeViewer } from "../components/tools/phase1/resume-import-viewer/logic.test";
import { runTests as testPdfMerger } from "../components/tools/phase2/pdf-merger/logic.test";
import { runTests as testPdfSplitter } from "../components/tools/phase2/pdf-splitter/logic.test";
import { runTests as testPdfRotator } from "../components/tools/phase2/pdf-page-rotator/logic.test";
import { runTests as testPdfOrganizer } from "../components/tools/phase2/pdf-page-organizer/logic.test";
import { runTests as testPdfCompressor } from "../components/tools/phase2/pdf-compressor/logic.test";
import { runTests as testPdfBatesStamper } from "../components/tools/phase2/pdf-bates-stamper/logic.test";
import { runTests as testPdfFlattener } from "../components/tools/phase2/pdf-flattener/logic.test";
import { runTests as testPdfFormExtractor } from "../components/tools/phase2/pdf-form-extractor/logic.test";
import { runTests as testPdfFormBuilder } from "../components/tools/phase2/pdf-form-builder/logic.test";
import { runTests as testPdfDigitalSigner } from "../components/tools/phase2/pdf-digital-signer/logic.test";
import { runImageConverterTests } from "../components/tools/phase2/image-converter/logic.test";
import { runAspectRatioCropperTests } from "../components/tools/phase2/aspect-ratio-cropper/logic.test";
import { runCanvasResizerTests } from "../components/tools/phase2/canvas-resizer/logic.test";
import { runBatchImageCompressorTests } from "../components/tools/phase2/batch-image-compressor/logic.test";
import { runExifStripperTests } from "../components/tools/phase2/exif-stripper/logic.test";
import { runMarkdownToPdfTests } from "../components/tools/phase2/markdown-to-pdf/logic.test";
import { runHtmlToPdfTests } from "../components/tools/phase2/html-to-pdf/logic.test";
import { runDirectTxtEditorTests } from "../components/tools/phase2/direct-txt-editor/logic.test";
import { runDirectMarkdownEditorTests } from "../components/tools/phase2/direct-markdown-editor/logic.test";
import { runDirectHtmlEditorTests } from "../components/tools/phase2/direct-html-editor/logic.test";
import { runFileEncryptorTests } from "../components/tools/phase2/file-encryptor/logic.test";
import { runFileDecryptorTests } from "../components/tools/phase2/file-decryptor/logic.test";
import { runSteganographyTests } from "../components/tools/phase2/steganography-tool/logic.test";
import { runPdfRedactionTests } from "../components/tools/phase2/pdf-redaction-tool/logic.test";
import { runImageBase64ConverterTests } from "../components/tools/phase2/image-base64-converter/logic.test";
import { runTests as runSvgMinifierTests } from "../components/tools/phase2/svg-minifier/logic.test";
import { runTests as runFaviconGeneratorTests } from "../components/tools/phase2/favicon-generator/logic.test";
import { runTests as runImageRotatorTests } from "../components/tools/phase2/image-rotator-flipper/logic.test";
import { runTests as runPhotoFilterStudioTests } from "../components/tools/phase2/photo-filter-studio/logic.test";
import { runTests as runImageWatermarkerTests } from "../components/tools/phase2/image-watermarker/logic.test";
import { runTests as runMetadataStripperTests } from "../components/tools/phase2/metadata-stripper/logic.test";
import { runTests as runDirectRtfCreatorTests } from "../components/tools/phase2/direct-rtf-creator/logic.test";
import { runTests as runDirectDocxEditorTests } from "../components/tools/phase2/direct-docx-editor/logic.test";
import { runTests as runPdfAnnotatorTests } from "../components/tools/phase2/pdf-annotator/logic.test";
import { runTests as runMarkdownNoteMakerTests } from "../components/tools/phase2/markdown-note-maker/logic.test";
import { runTests as runExcelToPdfTests } from "../components/tools/phase2/excel-to-pdf/logic.test";
import { runTests as runDocxToPdfTests } from "../components/tools/phase2/docx-to-pdf/logic.test";
import { runTests as runPdfToDocxTests } from "../components/tools/phase2/pdf-to-docx/logic.test";
import { runTests as runPdfEncryptorTests } from "../components/tools/phase2/pdf-encryptor/logic.test";
import { runTests as runPdfDecryptorTests } from "../components/tools/phase2/pdf-decryptor/logic.test";
import { runTests as runPowerPointToPdfTests } from "../components/tools/phase2/powerpoint-to-pdf/logic.test";

// Phase 3 Stage 1 Tools
import { runTests as runInvoiceGeneratorTests } from "../components/tools/phase3/invoice-generator/logic.test";
import { runTests as runEstimateQuoteTests } from "../components/tools/phase3/estimate-quote-builder/logic.test";
import { runTests as runCertificateGeneratorTests } from "../components/tools/phase3/certificate-generator/logic.test";
import { runTests as runProposalBuilderTests } from "../components/tools/phase3/proposal-builder/logic.test";
import { runTests as runDesktopScreenRecorderTests } from "../components/tools/phase3/desktop-screen-recorder/logic.test";
import { runTests as runWebTabRecorderTests } from "../components/tools/phase3/web-tab-recorder/logic.test";
import { runTests as runWebcamOverlayRecorderTests } from "../components/tools/phase3/webcam-overlay-recorder/logic.test";
import { runTests as runSocialPostMakerTests } from "../components/tools/phase3/social-post-maker/logic.test";
import { runTests as runStoryReelsMakerTests } from "../components/tools/phase3/story-reels-maker/logic.test";
import { runTests as runChartGraphVisualizerTests } from "../components/tools/phase3/chart-graph-visualizer/logic.test";
import { runTests as runMemeCaptionGeneratorTests } from "../components/tools/phase3/meme-caption-generator/logic.test";
import { runTests as runLatexEditorTests } from "../components/tools/phase3/latex-editor/logic.test";
import { runTests as runCameraToPdfScannerTests } from "../components/tools/phase3/camera-to-pdf-scanner/logic.test";
import { runTests as runPassportPhotoGeneratorTests } from "../components/tools/phase3/passport-photo-generator/logic.test";
import { runTests as runPdfEditorTests } from "../components/tools/phase3/pdf-editor/logic.test";
import { runTests as runJwtDecoderTests } from "../components/tools/phase3/jwt-decoder/logic.test";
import { runTests as runJobKeywordMatcherTests } from "../components/tools/phase3/job-keyword-matcher/logic.test";
import { runTests as runPdfPageNumbererTests } from "../components/tools/phase3/pdf-page-numberer/logic.test";
import { runTests as runCronExpressionBuilderTests } from "../components/tools/phase3/cron-expression-builder/logic.test";
import { runTests as runCurlToCodeConverterTests } from "../components/tools/phase3/curl-to-code-converter/logic.test";
import { runTests as runSalaryTaxCalculatorTests } from "../components/tools/phase3/salary-tax-calculator/logic.test";
import { runTests as runBurnAfterReadSecretTests } from "../components/tools/phase3/burn-after-read-secret/logic.test";
import { runTests as runClientPastebinTests } from "../components/tools/phase3/client-pastebin/logic.test";
import { runTests as runLinkProtectorTests } from "../components/tools/phase3/link-protector/logic.test";
import { runTests as runPipelineHandoffTests } from "../lib/pipeline/handoff.test";
import { runConverterEngineTests } from "../components/tools/engines/logic.test";
import { resumeDataSchema, initialResumeData } from "../lib/schema";

async function main() {
  console.log("=== CLEARTRIX TOOL LOGIC UNIT TESTS ===");

  console.log("Testing [json-formatter] logic...");
  testJson();
  console.log("✅ [json-formatter] unit tests passed!");

  console.log("Testing [base64-converter] logic...");
  testBase64();
  console.log("✅ [base64-converter] unit tests passed!");

  console.log("Testing [word-counter] logic...");
  testWordCounter();
  console.log("✅ [word-counter] unit tests passed!");

  console.log("Testing [mortgage-calculator] logic...");
  testMortgage();
  console.log("✅ [mortgage-calculator] unit tests passed!");

  console.log("Testing [qr-generator] logic...");
  testQr();
  console.log("✅ [qr-generator] unit tests passed!");

  console.log("Testing [csv-json-converter] logic...");
  testCsvJson();
  console.log("✅ [csv-json-converter] unit tests passed!");

  console.log("Testing [hash-generator] logic...");
  await testHash();
  console.log("✅ [hash-generator] unit tests passed!");

  console.log("Testing [password-generator] logic...");
  testPassword();
  console.log("✅ [password-generator] unit tests passed!");

  console.log("Testing [case-converter] logic...");
  testCase();
  console.log("✅ [case-converter] unit tests passed!");

  console.log("Testing [compound-interest-calculator] logic...");
  testCompoundInterest();
  console.log("✅ [compound-interest-calculator] unit tests passed!");

  console.log("Testing [url-encoder] logic...");
  testUrlEncoder();
  console.log("✅ [url-encoder] unit tests passed!");

  console.log("Testing [lorem-generator] logic...");
  testLorem();
  console.log("✅ [lorem-generator] unit tests passed!");

  console.log("Testing [percentage-calculator] logic...");
  testPercentage();
  console.log("✅ [percentage-calculator] unit tests passed!");

  console.log("Testing [bmi-calculator] logic...");
  testBmi();
  console.log("✅ [bmi-calculator] unit tests passed!");

  console.log("Testing [barcode-generator] logic...");
  testBarcode();
  console.log("✅ [barcode-generator] unit tests passed!");

  console.log("Testing [duplicate-line-remover] logic...");
  testDedupe();
  console.log("✅ [duplicate-line-remover] unit tests passed!");

  console.log("Testing [html-beautifier] logic...");
  testBeautifier();
  console.log("✅ [html-beautifier] unit tests passed!");

  console.log("Testing [text-diff] logic...");
  testDiff();
  console.log("✅ [text-diff] unit tests passed!");

  console.log("Testing [date-calculator] logic...");
  testDateCalc();
  console.log("✅ [date-calculator] unit tests passed!");

  console.log("Testing [unit-converter] logic...");
  testUnitConv();
  console.log("✅ [unit-converter] unit tests passed!");

  console.log("Testing [regex-tester] logic...");
  testRegex();
  console.log("✅ [regex-tester] unit tests passed!");

  console.log("Testing [html-entity-encoder] logic...");
  testHtmlEntity();
  console.log("✅ [html-entity-encoder] unit tests passed!");

  console.log("Testing [age-calculator] logic...");
  testAge();
  console.log("✅ [age-calculator] unit tests passed!");

  console.log("Testing [discount-calculator] logic...");
  testDiscount();
  console.log("✅ [discount-calculator] unit tests passed!");

  console.log("Testing [json-xml-converter] logic...");
  testJsonXml();
  console.log("✅ [json-xml-converter] unit tests passed!");

  console.log("Testing [epoch-converter] logic...");
  testEpoch();
  console.log("✅ [epoch-converter] unit tests passed!");

  console.log("Testing [base-converter] logic...");
  testBase();
  console.log("✅ [base-converter] unit tests passed!");

  console.log("Testing [sales-tax-calculator] logic...");
  testSalesTax();
  console.log("✅ [sales-tax-calculator] unit tests passed!");

  console.log("Testing [freelance-rate-calculator] logic...");
  testFreelance();
  console.log("✅ [freelance-rate-calculator] unit tests passed!");

  console.log("Testing [unicode-normalizer] logic...");
  testUnicode();
  console.log("✅ [unicode-normalizer] unit tests passed!");

  console.log("Testing [sql-formatter] logic...");
  testSqlFormatter();
  console.log("✅ [sql-formatter] unit tests passed!");

  console.log("Testing [hmac-generator] logic...");
  await testHmac();
  console.log("✅ [hmac-generator] unit tests passed!");

  console.log("Testing [calorie-calculator] logic...");
  testCalorie();
  console.log("✅ [calorie-calculator] unit tests passed!");

  console.log("Testing [water-intake-calculator] logic...");
  testWaterIntake();
  console.log("✅ [water-intake-calculator] unit tests passed!");

  console.log("Testing [json-yaml-converter] logic...");
  testJsonYaml();
  console.log("✅ [json-yaml-converter] unit tests passed!");

  console.log("Testing [checksum-verifier] logic...");
  await testChecksum();
  console.log("✅ [checksum-verifier] unit tests passed!");

  console.log("Testing [auto-loan-calculator] logic...");
  testAutoLoan();
  console.log("✅ [auto-loan-calculator] unit tests passed!");

  console.log("Testing [scientific-calculator] logic...");
  testScientific();
  console.log("✅ [scientific-calculator] unit tests passed!");

  console.log("Testing [json-schema-validator] logic...");
  testJsonSchema();
  console.log("✅ [json-schema-validator] unit tests passed!");

  console.log("Testing [aspect-ratio-calculator] logic...");
  testAspectRatio();
  console.log("✅ [aspect-ratio-calculator] unit tests passed!");

  console.log("Testing [code-minifier] logic...");
  testCodeMinifier();
  console.log("✅ [code-minifier] unit tests passed!");

  console.log("Testing [chmod-calculator] logic...");
  testChmod();
  console.log("✅ [chmod-calculator] unit tests passed!");

  console.log("Testing [bmr-tdee-calculator] logic...");
  testBmr();
  console.log("✅ [bmr-tdee-calculator] unit tests passed!");

  console.log("Testing [inflation-calculator] logic...");
  testInflation();
  console.log("✅ [inflation-calculator] unit tests passed!");

  console.log("Testing [ip-subnet-calculator] logic...");
  testIpSubnet();
  console.log("✅ [ip-subnet-calculator] unit tests passed!");

  console.log("Testing [statistics-calculator] logic...");
  testStats();
  console.log("✅ [statistics-calculator] unit tests passed!");

  console.log("Testing [fraction-simplifier] logic...");
  testFraction();
  console.log("✅ [fraction-simplifier] unit tests passed!");

  console.log("Testing [geometry-calculator] logic...");
  testGeometry();
  console.log("✅ [geometry-calculator] unit tests passed!");

  console.log("Testing [time-card-calculator] logic...");
  testTimeCard();
  console.log("✅ [time-card-calculator] unit tests passed!");

  console.log("Testing [world-clock-converter] logic...");
  testWorldClock();
  console.log("✅ [world-clock-converter] unit tests passed!");

  console.log("Testing [bandwidth-calculator] logic...");
  testBandwidth();
  console.log("✅ [bandwidth-calculator] unit tests passed!");

  console.log("Testing [sip-calculator] logic...");
  testSip();
  console.log("✅ [sip-calculator] unit tests passed!");

  console.log("Testing [retirement-401k-calculator] logic...");
  testRetirement();
  console.log("✅ [retirement-401k-calculator] unit tests passed!");

  console.log("Testing [debt-payoff-calculator] logic...");
  testDebtPayoff();
  console.log("✅ [debt-payoff-calculator] unit tests passed!");

  console.log("Testing [roi-calculator] logic...");
  testRoi();
  console.log("✅ [roi-calculator] unit tests passed!");

  console.log("Testing [profit-margin-calculator] logic...");
  testProfitMargin();
  console.log("✅ [profit-margin-calculator] unit tests passed!");

  console.log("Testing [break-even-calculator] logic...");
  testBreakEven();
  console.log("✅ [break-even-calculator] unit tests passed!");

  console.log("Testing [payroll-paycheck-calculator] logic...");
  testPayroll();
  console.log("✅ [payroll-paycheck-calculator] unit tests passed!");

  console.log("Testing [body-fat-calculator] logic...");
  testBodyFat();
  console.log("✅ [body-fat-calculator] unit tests passed!");

  console.log("Testing [target-heart-rate-calculator] logic...");
  testHeartRate();
  console.log("✅ [target-heart-rate-calculator] unit tests passed!");

  console.log("Testing [pregnancy-due-date-calculator] logic...");
  testPregnancy();
  console.log("✅ [pregnancy-due-date-calculator] unit tests passed!");

  console.log("Testing [sql-dump-to-csv] logic...");
  testSqlDump();
  console.log("✅ [sql-dump-to-csv] unit tests passed!");

  console.log("Testing [excel-to-json-csv] logic...");
  testExcel();
  console.log("✅ [excel-to-json-csv] unit tests passed!");

  console.log("Testing [archive-extractor] logic...");
  testArchiveExtractor();
  console.log("✅ [archive-extractor] unit tests passed!");

  console.log("Testing [archive-packer] logic...");
  testArchivePacker();
  console.log("✅ [archive-packer] unit tests passed!");

  console.log("Testing [barcode-scanner] logic...");
  testBarcodeScanner();
  console.log("✅ [barcode-scanner] unit tests passed!");

  console.log("Testing [qr-scanner] logic...");
  testQrScanner();
  console.log("✅ [qr-scanner] unit tests passed!");

  console.log("Testing [ats-resume-checker] logic...");
  testAtsChecker();
  console.log("✅ [ats-resume-checker] unit tests passed!");

  console.log("Testing [resume-import-viewer] logic...");
  testResumeViewer();
  console.log("✅ [resume-import-viewer] unit tests passed!");

  console.log("Testing [pdf-merger] logic...");
  await testPdfMerger();
  console.log("✅ [pdf-merger] unit tests passed!");

  console.log("Testing [pdf-splitter] logic...");
  await testPdfSplitter();
  console.log("✅ [pdf-splitter] unit tests passed!");

  console.log("Testing [pdf-page-rotator] logic...");
  await testPdfRotator();
  console.log("✅ [pdf-page-rotator] unit tests passed!");

  console.log("Testing [pdf-page-organizer] logic...");
  await testPdfOrganizer();
  console.log("✅ [pdf-page-organizer] unit tests passed!");

  console.log("Testing [pdf-compressor] logic...");
  await testPdfCompressor();
  console.log("✅ [pdf-compressor] unit tests passed!");

  console.log("Testing [pdf-bates-stamper] logic...");
  await testPdfBatesStamper();
  console.log("✅ [pdf-bates-stamper] unit tests passed!");

  console.log("Testing [pdf-flattener] logic...");
  await testPdfFlattener();
  console.log("✅ [pdf-flattener] unit tests passed!");

  console.log("Testing [pdf-form-extractor] logic...");
  await testPdfFormExtractor();
  console.log("✅ [pdf-form-extractor] unit tests passed!");

  console.log("Testing [pdf-form-builder] logic...");
  await testPdfFormBuilder();
  console.log("✅ [pdf-form-builder] unit tests passed!");

  console.log("Testing [pdf-digital-signer] logic...");
  await testPdfDigitalSigner();
  console.log("✅ [pdf-digital-signer] unit tests passed!");

  console.log("Testing [image-converter] logic...");
  runImageConverterTests();
  console.log("✅ [image-converter] unit tests passed!");

  console.log("Testing [aspect-ratio-cropper] logic...");
  runAspectRatioCropperTests();
  console.log("✅ [aspect-ratio-cropper] unit tests passed!");

  console.log("Testing [canvas-resizer] logic...");
  runCanvasResizerTests();
  console.log("✅ [canvas-resizer] unit tests passed!");

  console.log("Testing [batch-image-compressor] logic...");
  runBatchImageCompressorTests();
  console.log("✅ [batch-image-compressor] unit tests passed!");

  console.log("Testing [exif-stripper] logic...");
  runExifStripperTests();
  console.log("✅ [exif-stripper] unit tests passed!");

  console.log("Testing [markdown-to-pdf] logic...");
  await runMarkdownToPdfTests();
  console.log("✅ [markdown-to-pdf] unit tests passed!");

  console.log("Testing [html-to-pdf] logic...");
  await runHtmlToPdfTests();
  console.log("✅ [html-to-pdf] unit tests passed!");

  console.log("Testing [direct-txt-editor] logic...");
  await runDirectTxtEditorTests();
  console.log("✅ [direct-txt-editor] unit tests passed!");

  console.log("Testing [direct-markdown-editor] logic...");
  await runDirectMarkdownEditorTests();
  console.log("✅ [direct-markdown-editor] unit tests passed!");

  console.log("Testing [direct-html-editor] logic...");
  await runDirectHtmlEditorTests();
  console.log("✅ [direct-html-editor] unit tests passed!");

  console.log("Testing [file-encryptor] logic...");
  await runFileEncryptorTests();
  console.log("✅ [file-encryptor] unit tests passed!");

  console.log("Testing [file-decryptor] logic...");
  await runFileDecryptorTests();
  console.log("✅ [file-decryptor] unit tests passed!");

  console.log("Testing [steganography-tool] logic...");
  await runSteganographyTests();
  console.log("✅ [steganography-tool] unit tests passed!");

  console.log("Testing [pdf-redaction-tool] logic...");
  await runPdfRedactionTests();
  console.log("✅ [pdf-redaction-tool] unit tests passed!");

  console.log("Testing [image-base64-converter] logic...");
  await runImageBase64ConverterTests();
  console.log("✅ [image-base64-converter] unit tests passed!");

  console.log("Testing [svg-minifier] logic...");
  await runSvgMinifierTests();
  console.log("✅ [svg-minifier] unit tests passed!");

  console.log("Testing [favicon-generator] logic...");
  await runFaviconGeneratorTests();
  console.log("✅ [favicon-generator] unit tests passed!");

  console.log("Testing [image-rotator-flipper] logic...");
  await runImageRotatorTests();
  console.log("✅ [image-rotator-flipper] unit tests passed!");

  console.log("Testing [photo-filter-studio] logic...");
  await runPhotoFilterStudioTests();
  console.log("✅ [photo-filter-studio] unit tests passed!");

  console.log("Testing [image-watermarker] logic...");
  await runImageWatermarkerTests();
  console.log("✅ [image-watermarker] unit tests passed!");

  console.log("Testing [metadata-stripper] logic...");
  await runMetadataStripperTests();
  console.log("✅ [metadata-stripper] unit tests passed!");

  console.log("Testing [direct-rtf-creator] logic...");
  await runDirectRtfCreatorTests();
  console.log("✅ [direct-rtf-creator] unit tests passed!");

  console.log("Testing [direct-docx-editor] logic...");
  await runDirectDocxEditorTests();
  console.log("✅ [direct-docx-editor] unit tests passed!");

  console.log("Testing [pdf-annotator] logic...");
  await runPdfAnnotatorTests();
  console.log("✅ [pdf-annotator] unit tests passed!");

  console.log("Testing [markdown-note-maker] logic...");
  runMarkdownNoteMakerTests();
  console.log("✅ [markdown-note-maker] unit tests passed!");

  console.log("Testing [excel-to-pdf] logic...");
  await runExcelToPdfTests();
  console.log("✅ [excel-to-pdf] unit tests passed!");

  console.log("Testing [docx-to-pdf] logic...");
  await runDocxToPdfTests();
  console.log("✅ [docx-to-pdf] unit tests passed!");

  console.log("Testing [pdf-to-docx] logic...");
  await runPdfToDocxTests();
  console.log("✅ [pdf-to-docx] unit tests passed!");

  console.log("Testing [pdf-encryptor] logic...");
  await runPdfEncryptorTests();
  console.log("✅ [pdf-encryptor] unit tests passed!");

  console.log("Testing [pdf-decryptor] logic...");
  await runPdfDecryptorTests();
  console.log("✅ [pdf-decryptor] unit tests passed!");

  console.log("Testing [powerpoint-to-pdf] logic...");
  await runPowerPointToPdfTests();
  console.log("✅ [powerpoint-to-pdf] unit tests passed!");

  // Phase 3 Stage 1 Tools
  console.log("Testing [invoice-receipt-generator] logic...");
  runInvoiceGeneratorTests();
  console.log("✅ [invoice-receipt-generator] unit tests passed!");

  console.log("Testing [estimate-quote-builder] logic...");
  runEstimateQuoteTests();
  console.log("✅ [estimate-quote-builder] unit tests passed!");

  console.log("Testing [certificate-diploma-generator] logic...");
  runCertificateGeneratorTests();
  console.log("✅ [certificate-diploma-generator] unit tests passed!");

  console.log("Testing [proposal-builder] logic...");
  runProposalBuilderTests();
  console.log("✅ [proposal-builder] unit tests passed!");

  console.log("Testing [desktop-screen-recorder] logic...");
  runDesktopScreenRecorderTests();
  console.log("✅ [desktop-screen-recorder] unit tests passed!");

  console.log("Testing [web-tab-recorder] logic...");
  runWebTabRecorderTests();
  console.log("✅ [web-tab-recorder] unit tests passed!");

  console.log("Testing [webcam-overlay-recorder] logic...");
  runWebcamOverlayRecorderTests();
  console.log("✅ [webcam-overlay-recorder] unit tests passed!");

  console.log("Testing [social-post-maker] logic...");
  runSocialPostMakerTests();
  console.log("✅ [social-post-maker] unit tests passed!");

  console.log("Testing [story-reels-maker] logic...");
  runStoryReelsMakerTests();
  console.log("✅ [story-reels-maker] unit tests passed!");

  console.log("Testing [chart-graph-visualizer] logic...");
  runChartGraphVisualizerTests();
  console.log("✅ [chart-graph-visualizer] unit tests passed!");

  console.log("Testing [meme-caption-generator] logic...");
  runMemeCaptionGeneratorTests();
  console.log("✅ [meme-caption-generator] unit tests passed!");

  console.log("Testing [latex-editor] logic...");
  runLatexEditorTests();
  console.log("✅ [latex-editor] unit tests passed!");

  console.log("Testing [camera-to-pdf-scanner] logic...");
  runCameraToPdfScannerTests();
  console.log("✅ [camera-to-pdf-scanner] unit tests passed!");

  console.log("Testing [passport-photo-generator] logic...");
  if (!runPassportPhotoGeneratorTests()) {
    throw new Error("Passport photo generator tests failed!");
  }
  console.log("✅ [passport-photo-generator] unit tests passed!");

  // Flagship Tool: Resume Builder
  console.log("Testing [resume-builder] logic...");
  const parsedResume = resumeDataSchema.safeParse(initialResumeData);
  if (!parsedResume.success) {
    throw new Error("Resume builder schema verification failed");
  }
  console.log("✅ [resume-builder] unit tests passed!");

  // Flagship Tool: PDF Editor
  console.log("Testing [pdf-editor] logic...");
  await runPdfEditorTests();
  console.log("✅ [pdf-editor] unit tests passed!");

  // 38 Converter Engine Tools
  console.log("Testing [38 converter engine tools] logic...");
  await runConverterEngineTests();

  console.log("Testing [jwt-decoder] logic...");
  if (!runJwtDecoderTests()) {
    throw new Error("JWT decoder tests failed!");
  }
  console.log("✅ [jwt-decoder] unit tests passed!");

  console.log("Testing [job-keyword-matcher] logic...");
  if (!runJobKeywordMatcherTests()) {
    throw new Error("Job keyword matcher tests failed!");
  }
  console.log("✅ [job-keyword-matcher] unit tests passed!");

  console.log("Testing [pdf-page-numberer] logic...");
  if (!runPdfPageNumbererTests()) {
    throw new Error("PDF page numberer tests failed!");
  }
  console.log("✅ [pdf-page-numberer] unit tests passed!");

  console.log("Testing [cron-expression-builder] logic...");
  if (!runCronExpressionBuilderTests()) {
    throw new Error("Cron expression builder tests failed!");
  }
  console.log("✅ [cron-expression-builder] unit tests passed!");

  console.log("Testing [curl-to-code-converter] logic...");
  if (!runCurlToCodeConverterTests()) {
    throw new Error("cURL to code converter tests failed!");
  }
  console.log("✅ [curl-to-code-converter] unit tests passed!");

  console.log("Testing [salary-tax-calculator] logic...");
  if (!runSalaryTaxCalculatorTests()) {
    throw new Error("Salary tax calculator tests failed!");
  }
  console.log("✅ [salary-tax-calculator] unit tests passed!");

  console.log("Testing [burn-after-read-secret] logic...");
  if (!(await runBurnAfterReadSecretTests())) {
    throw new Error("Burn-after-read secret tests failed!");
  }
  console.log("✅ [burn-after-read-secret] unit tests passed!");

  console.log("Testing [client-pastebin] logic...");
  if (!(await runClientPastebinTests())) {
    throw new Error("Client pastebin tests failed!");
  }
  console.log("✅ [client-pastebin] unit tests passed!");

  console.log("Testing [link-protector] logic...");
  if (!(await runLinkProtectorTests())) {
    throw new Error("Link protector tests failed!");
  }
  console.log("✅ [link-protector] unit tests passed!");

  console.log("Testing [cross-tool-pipeline-handoff] logic...");
  if (!runPipelineHandoffTests()) {
    throw new Error("Cross-tool pipeline handoff tests failed!");
  }
  console.log("✅ [cross-tool-pipeline-handoff] unit tests passed!");

  console.log("===============================================");
  console.log("🎉 ALL TOOL UNIT TESTS PASSED (172/172)!");
}

main().catch((err) => {
  console.error("❌ Tool logic test failed:", err);
  process.exit(1);
});
