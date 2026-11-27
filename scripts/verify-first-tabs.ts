import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";

async function verifyFirstTabs() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Load Authority audit
  await page.goto(`${BASE_URL}/audit/cmuwzr6vv000ke1ggthz1cbmp`, { waitUntil: "networkidle2" });
  
  // Wait 2.5 seconds for completion transition
  await new Promise((r) => setTimeout(r, 2500));

  const firstTabs = [
    "Executive Summary",
    "Priority Action Plan",
    "AI Visibility",
    "Business & Website Clarity",
    "Search & Local",
    "Content & Authority",
  ];

  for (const t of firstTabs) {
    await page.evaluate((tabName) => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((x) => x.innerText.trim().toLowerCase().includes(tabName.toLowerCase()));
      b?.click();
    }, t);

    await new Promise((r) => setTimeout(r, 300));

    const info = await page.evaluate(() => {
      const h2 = document.querySelector("h2")?.innerText || "";
      const text = document.body.innerText;
      return {
        h2,
        hasContent: text.length > 500,
        hasError: text.includes("TypeError") || text.includes("Cannot read properties"),
      };
    });

    console.log(`Tab [${t.padEnd(28)}]: Header: "${info.h2}" | Content > 500 chars: ${info.hasContent} | Errors: ${info.hasError}`);
  }

  await browser.close();
}

verifyFirstTabs().catch(console.error);
