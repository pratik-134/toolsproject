import { analyzeResumeText } from "./logic";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`[ats-resume-checker] Assertion failed: ${msg}`);
}

export function runTests(): boolean {
  // 1. Test Strong High-Scoring Resume
  const strongResume = `
    Alex Morgan
    alex.morgan@example.com | (555) 234-5678 | linkedin.com/in/alexmorgan | San Francisco, CA

    Professional Summary
    Results-oriented Senior Software Engineer with 8+ years of experience architecting distributed cloud systems.
    Proven track record of improving system performance by 40% and leading engineering teams.

    Work Experience
    Senior Software Engineer | TechScale Inc. | 2021 - Present
    - Architected and deployed microservices architecture handling 150M daily API requests with 99.99% uptime.
    - Spearheaded migration to Kubernetes, decreasing cloud infrastructure costs by $120,000 annually.
    - Optimized database query indexes, accelerating search response times by 3x across 12 services.
    - Mentored 6 junior engineers and established automated CI/CD deployment pipelines.

    Software Engineer | CloudBase Systems | 2017 - 2021
    - Engineered high-throughput payment processing pipeline processing over $45M in transactions.
    - Automated unit and integration testing suite, reducing production defect rate by 65%.
    - Collaborated with product management to deliver 14 core features ahead of schedule.

    Education
    Bachelor of Science in Computer Science | University of California, Berkeley | 2017

    Technical Skills
    Languages: TypeScript, Go, Python, SQL, C++
    Frameworks & Tools: React, Next.js, Node.js, Docker, Kubernetes, AWS, PostgreSQL, Redis
  `;

  const strongReport = analyzeResumeText(strongResume);
  assert(strongReport.overallScore >= 80, `Expected strong resume score >= 80, got ${strongReport.overallScore}`);
  assert(strongReport.rating === "Excellent" || strongReport.rating === "Good", `Expected high rating, got ${strongReport.rating}`);
  assert(strongReport.categories.contact.score === 15, "Contact score should be 15/15");
  assert(strongReport.categories.sections.score >= 20, "Sections score should be >= 20/25");
  assert(strongReport.metricsCount >= 4, `Expected at least 4 metrics, got ${strongReport.metricsCount}`);
  assert(strongReport.powerVerbsCount >= 5, `Expected at least 5 power verbs, got ${strongReport.powerVerbsCount}`);

  // 2. Test Weak Draft Resume
  const weakResume = `
    John Doe
    Looking for a software job.

    Experience
    Worked at a company. Responsible for helping with tasks and was a good team player.
    Handled meetings and assisted with website fixes.
  `;

  const weakReport = analyzeResumeText(weakResume);
  assert(weakReport.overallScore < 55, `Expected weak resume score < 55, got ${weakReport.overallScore}`);
  assert(weakReport.rating === "Poor" || weakReport.rating === "Needs Improvement", "Expected low rating");
  assert(weakReport.categories.contact.score < 10, "Weak contact info should score low");
  assert(weakReport.metricsCount === 0, "No metrics should be found");
  assert(weakReport.weakVerbsCount > 0, "Should detect passive phrases (responsible for, helped with)");

  // 3. Test Empty / Short Text
  const emptyReport = analyzeResumeText("");
  assert(emptyReport.overallScore === 0, "Empty text should score 0");
  assert(emptyReport.rating === "Poor", "Empty text should be Poor");
  assert(emptyReport.wordCount === 0, "Word count should be 0");

  // 4. Test Metric Regex Extraction
  const textWithMetrics = "Grew revenue by 45%, managed $300k, expanded 5x, and saved 1,500 hours.";
  const metricReport = analyzeResumeText(textWithMetrics);
  assert(metricReport.foundMetrics.length >= 3, `Expected at least 3 metrics extracted, got ${metricReport.foundMetrics.length}`);

  return true;
}
