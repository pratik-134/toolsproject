import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const BREAKPOINTS = [
  { name: "Mobile (iPhone SE / Extra Small)", width: 320, height: 568 },
  { name: "Mobile (iPhone 12/13/14 Mini)", width: 375, height: 667 },
  { name: "Mobile (Large Phone / Plus)", width: 414, height: 896 },
  { name: "Phablet / Small Tablet (sm: 640px)", width: 640, height: 900 },
  { name: "Tablet Portrait (md: 768px)", width: 768, height: 1024 },
  { name: "Tablet Landscape / Laptop (lg: 1024px)", width: 1024, height: 768 },
  { name: "Desktop (xl: 1280px)", width: 1280, height: 800 },
  { name: "Wide Desktop (1440px)", width: 1440, height: 900 },
  { name: "Ultra-Wide Desktop (1920px)", width: 1920, height: 1080 },
];

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 3055;
const CDP_PORT = 9223;
const TEMP_USER_DIR = path.resolve("./.edge-temp-profile");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await sleep(500);
  }
  return false;
}

async function runTests() {
  console.log("=== STARTING RESPONSIVE NAVIGATION TESTS (320px - 1920px) ===\n");

  // 1. Start Next.js server
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const nextServer = spawn("npx.cmd", ["next", "start", "-p", String(PORT)], {
    stdio: "pipe",
    shell: true,
  });

  nextServer.stderr.on("data", (d) => {
    // console.error("Next stderr:", d.toString());
  });

  const serverReady = await waitForServer(`http://localhost:${PORT}`);
  if (!serverReady) {
    console.error("Failed to start Next.js server");
    nextServer.kill();
    process.exit(1);
  }
  console.log("✅ Next.js server is up and responding.\n");

  // 2. Start Microsoft Edge Headless with CDP
  console.log("Launching headless Microsoft Edge...");
  if (!fs.existsSync(TEMP_USER_DIR)) {
    fs.mkdirSync(TEMP_USER_DIR, { recursive: true });
  }

  const edgeProc = spawn(
    EDGE_PATH,
    [
      "--headless=new",
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${TEMP_USER_DIR}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `http://localhost:${PORT}`,
    ],
    { stdio: "pipe" }
  );

  await sleep(1500);

  // 3. Connect to CDP tab
  let targets;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      targets = await res.json();
      if (targets && targets.length > 0) break;
    } catch {}
    await sleep(400);
  }

  if (!targets || targets.length === 0) {
    console.error("Could not find Edge CDP target");
    edgeProc.kill();
    nextServer.kill();
    process.exit(1);
  }

  const pageTarget = targets.find((t) => t.type === "page") || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let messageId = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      cb(data);
    }
  };

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  function sendCommand(method, params = {}) {
    return new Promise((resolve) => {
      const id = messageId++;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await sendCommand("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.result?.value;
  }

  // Enable necessary domains
  await sendCommand("Page.enable");
  await sendCommand("DOM.enable");
  await sendCommand("Runtime.enable");

  // Navigate to local test page
  await sendCommand("Page.navigate", { url: `http://localhost:${PORT}` });
  await sleep(1500);

  let totalTests = 0;
  let passedTests = 0;

  for (const bp of BREAKPOINTS) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`TESTING BREAKPOINT: ${bp.width}px × ${bp.height}px (${bp.name})`);
    console.log(`------------------------------------------------------------`);

    // Set viewport
    await sendCommand("Emulation.setDeviceMetricsOverride", {
      width: bp.width,
      height: bp.height,
      deviceScaleFactor: 1,
      mobile: bp.width < 768,
    });

    await sleep(250);

    // 1. Test Horizontal Overflow
    totalTests++;
    const overflowInfo = await evaluate(`
      (() => {
        const docWidth = document.documentElement.scrollWidth;
        const bodyWidth = document.body.scrollWidth;
        const winWidth = window.innerWidth;
        const hasOverflow = docWidth > winWidth || bodyWidth > winWidth;
        return { docWidth, bodyWidth, winWidth, hasOverflow };
      })()
    `);

    if (!overflowInfo.hasOverflow) {
      console.log(`  ✅ [PASS] No horizontal overflow (scrollWidth: ${overflowInfo.docWidth}px, viewport: ${overflowInfo.winWidth}px)`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] Horizontal overflow detected! docWidth: ${overflowInfo.docWidth}px, viewport: ${overflowInfo.winWidth}px`);
    }

    // 2. Test Header Integrity & Bounding
    totalTests++;
    const headerInfo = await evaluate(`
      (() => {
        const header = document.querySelector('header');
        if (!header) return { exists: false };
        const rect = header.getBoundingClientRect();
        const headerScroll = header.scrollWidth;
        const headerClient = header.clientWidth;
        const overflow = headerScroll > headerClient + 1;
        return {
          exists: true,
          width: rect.width,
          height: rect.height,
          headerScroll,
          headerClient,
          overflow
        };
      })()
    `);

    if (headerInfo.exists && !headerInfo.overflow) {
      console.log(`  ✅ [PASS] Header fits cleanly within viewport without clipping (height: ${Math.round(headerInfo.height)}px)`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] Header clipped or overflowing:`, headerInfo);
    }

    // 3. Test Navigation Links & Hamburger Visibility depending on breakpoint (< 768px vs >= 768px)
    if (bp.width < 768) {
      // Mobile Viewport Checks
      totalTests++;
      const mobileNavCheck = await evaluate(`
        (() => {
          const hamburger = document.querySelector('button[aria-label*="navigation menu"]');
          const desktopNav = document.querySelector('nav[aria-label="Main Navigation"]');
          const hamburgerStyle = hamburger ? window.getComputedStyle(hamburger) : null;
          const desktopNavStyle = desktopNav ? window.getComputedStyle(desktopNav) : null;

          const isHamburgerVisible = hamburger && hamburgerStyle.display !== 'none' && hamburger.offsetWidth > 0;
          const isDesktopNavHidden = !desktopNav || desktopNavStyle.display === 'none' || desktopNav.offsetWidth === 0;

          return { isHamburgerVisible, isDesktopNavHidden, hamburgerBounds: hamburger?.getBoundingClientRect() };
        })()
      `);

      if (mobileNavCheck.isHamburgerVisible && mobileNavCheck.isDesktopNavHidden) {
        console.log(`  ✅ [PASS] Mobile view has visible Hamburger button and hidden desktop nav`);
        passedTests++;
      } else {
        console.error(`  ❌ [FAIL] Mobile navigation visibility mismatch:`, mobileNavCheck);
      }

      // 4. Test Mobile Hamburger Menu Open / Interaction
      totalTests++;
      const interactionCheck = await evaluate(`
        (async () => {
          const hamburger = document.querySelector('button[aria-label*="navigation menu"]');
          if (!hamburger) return { success: false, reason: 'No hamburger button' };

          // Click to open
          hamburger.click();
          await new Promise(r => setTimeout(r, 350));

          const drawer = document.querySelector('#mobile-navigation-drawer');
          const drawerHeight = drawer ? drawer.offsetHeight : 0;
          const isOpen = hamburger.getAttribute('aria-expanded') === 'true';

          const links = drawer ? Array.from(drawer.querySelectorAll('a')).map(a => a.textContent.trim()) : [];

          // Click to close
          hamburger.click();
          await new Promise(r => setTimeout(r, 350));
          const isClosed = hamburger.getAttribute('aria-expanded') === 'false';

          return {
            success: isOpen && isClosed && drawerHeight > 100,
            drawerHeight,
            linksCount: links.length,
            links
          };
        })()
      `);

      if (interactionCheck.success) {
        console.log(`  ✅ [PASS] Hamburger drawer opens smoothly (${interactionCheck.drawerHeight}px high, ${interactionCheck.linksCount} links) and closes properly`);
        passedTests++;
      } else {
        console.error(`  ❌ [FAIL] Hamburger drawer interaction failed:`, interactionCheck);
      }
    } else {
      // Desktop / Tablet Viewport Checks (>= 768px)
      totalTests++;
      const desktopNavCheck = await evaluate(`
        (() => {
          const hamburger = document.querySelector('button[aria-label*="navigation menu"]');
          const desktopNav = document.querySelector('nav[aria-label="Main Navigation"]');
          const hamburgerStyle = hamburger ? window.getComputedStyle(hamburger) : null;
          const desktopNavStyle = desktopNav ? window.getComputedStyle(desktopNav) : null;

          const isHamburgerHidden = !hamburger || hamburgerStyle.display === 'none' || hamburger.offsetWidth === 0;
          const isDesktopNavVisible = desktopNav && desktopNavStyle.display !== 'none' && desktopNav.offsetWidth > 0;

          // Check if links wrap onto multiple lines
          const links = desktopNav ? Array.from(desktopNav.querySelectorAll('a')) : [];
          let wraps = false;
          if (links.length > 1) {
            const firstTop = links[0].getBoundingClientRect().top;
            for (let i = 1; i < links.length; i++) {
              if (Math.abs(links[i].getBoundingClientRect().top - firstTop) > 6) {
                wraps = true;
                break;
              }
            }
          }

          return {
            isHamburgerHidden,
            isDesktopNavVisible,
            wraps,
            linkCount: links.length
          };
        })()
      `);

      if (desktopNavCheck.isHamburgerHidden && desktopNavCheck.isDesktopNavVisible && !desktopNavCheck.wraps) {
        console.log(`  ✅ [PASS] Desktop nav visible (${desktopNavCheck.linkCount} links on single line, no wrapping) & Hamburger hidden`);
        passedTests++;
      } else {
        console.error(`  ❌ [FAIL] Desktop navigation layout issue:`, desktopNavCheck);
      }
    }
  }

  // Cleanup
  console.log(`\n============================================================`);
  console.log(`FINAL RESULTS: ${passedTests} / ${totalTests} CHECKS PASSED`);
  console.log(`============================================================\n`);

  ws.close();
  edgeProc.kill();
  nextServer.kill();

  if (fs.existsSync(TEMP_USER_DIR)) {
    try {
      fs.rmSync(TEMP_USER_DIR, { recursive: true, force: true });
    } catch {}
  }

  if (passedTests === totalTests) {
    console.log("🎉 ALL RESPONSIVE BREAKPOINT TESTS PASSED WITH ZERO ERRORS!");
    process.exit(0);
  } else {
    console.error("Some tests failed.");
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
