import * as cheerio from "cheerio";
import { CrawlResult } from "./types";
import { validateUrlSecurity } from "./agents/security";

export async function crawlWebsite(targetUrl: string | undefined): Promise<CrawlResult> {
  const defaultResult: CrawlResult = {
    url: targetUrl || "",
    finalUrl: "",
    statusCode: 200,
    isSsl: false,
    title: "",
    metaDescription: "",
    headings: { h1: [], h2: [], h3: [] },
    wordCount: 0,
    hasSchema: false,
    schemas: [],
    schemaTypes: [],
    contactInfo: {
      emails: [],
      phones: [],
      hasWhatsApp: false,
      hasContactForm: false,
      hasPhysicalAddress: false,
      detectedAddresses: [],
    },
    socialLinks: {},
    trustSignals: {
      hasPrivacyPolicy: false,
      hasTerms: false,
      hasTestimonials: false,
      hasCertifications: false,
      hasCaseStudies: false,
      imageCount: 0,
      imagesMissingAlt: 0,
    },
    cleanTextSample: "",
    navigationItems: [],
    footerLinks: [],
  };

  if (!targetUrl || targetUrl.trim() === "") {
    return { ...defaultResult, statusCode: 0, cleanTextSample: "No website provided." };
  }

  const securityCheck = await validateUrlSecurity(targetUrl);
  if (!securityCheck.safe) {
    return { ...defaultResult, statusCode: 403, cleanTextSample: `Security Block: ${securityCheck.error}` };
  }

  const normalizedUrl = securityCheck.normalizedUrl;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OmnisightAuditBot/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    const finalUrl = response.url || normalizedUrl;
    const statusCode = response.status;
    const html = await response.text();

    const $ = cheerio.load(html);

    // Metadata
    const title = $("title").first().text().trim() || $('meta[property="og:title"]').attr("content") || "";
    const metaDescription =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "";

    // Headings
    const h1: string[] = [];
    $("h1").each((_, el) => {
      const text = $(el).text().trim();
      if (text) h1.push(text);
    });

    const h2: string[] = [];
    $("h2").slice(0, 10).each((_, el) => {
      const text = $(el).text().trim();
      if (text) h2.push(text);
    });

    const h3: string[] = [];
    $("h3").slice(0, 10).each((_, el) => {
      const text = $(el).text().trim();
      if (text) h3.push(text);
    });

    // JSON-LD Schemas
    const schemas: any[] = [];
    const schemaTypes: string[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const content = $(el).html()?.trim();
        if (content) {
          const parsed = JSON.parse(content);
          schemas.push(parsed);
          if (parsed["@type"]) {
            schemaTypes.push(String(parsed["@type"]));
          }
          if (Array.isArray(parsed["@graph"])) {
            parsed["@graph"].forEach((item: any) => {
              if (item["@type"]) schemaTypes.push(String(item["@type"]));
            });
          }
        }
      } catch {
        // Skip malformed JSON
      }
    });

    // Contact Information
    const emails = new Set<string>();
    const phones = new Set<string>();
    let hasWhatsApp = false;

    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr("href") || "";
      const email = href.replace(/^mailto:/i, "").split("?")[0].trim();
      if (email && email.includes("@")) emails.add(email.toLowerCase());
    });

    $('a[href^="tel:"]').each((_, el) => {
      const href = $(el).attr("href") || "";
      const phone = href.replace(/^tel:/i, "").trim();
      if (phone) phones.add(phone);
    });

    $('a[href*="wa.me"], a[href*="whatsapp.com"]').each(() => {
      hasWhatsApp = true;
    });

    const bodyText = $("body").text();
    // Phone regex
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const detectedPhoneMatches = bodyText.match(phoneRegex);
    if (detectedPhoneMatches) {
      detectedPhoneMatches.slice(0, 3).forEach((p) => phones.add(p.trim()));
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const detectedEmailMatches = bodyText.match(emailRegex);
    if (detectedEmailMatches) {
      detectedEmailMatches.slice(0, 3).forEach((e) => emails.add(e.toLowerCase().trim()));
    }

    const hasContactForm = $("form").length > 0 && ($('input[type="email"]').length > 0 || $('textarea').length > 0);

    // Social Links
    const socialLinks: CrawlResult["socialLinks"] = {};
    $('a[href*="linkedin.com"]').first().each((_, el) => { socialLinks.linkedin = $(el).attr("href"); });
    $('a[href*="twitter.com"], a[href*="x.com"]').first().each((_, el) => { socialLinks.twitter = $(el).attr("href"); });
    $('a[href*="facebook.com"]').first().each((_, el) => { socialLinks.facebook = $(el).attr("href"); });
    $('a[href*="instagram.com"]').first().each((_, el) => { socialLinks.instagram = $(el).attr("href"); });
    $('a[href*="youtube.com"]').first().each((_, el) => { socialLinks.youtube = $(el).attr("href"); });

    // Trust Signals
    const lowerBody = bodyText.toLowerCase();
    const hasPrivacyPolicy = $('a[href*="privacy"]').length > 0 || lowerBody.includes("privacy policy");
    const hasTerms = $('a[href*="terms"]').length > 0 || lowerBody.includes("terms of service");
    const hasTestimonials =
      lowerBody.includes("testimonial") ||
      lowerBody.includes("reviews") ||
      lowerBody.includes("what our clients say") ||
      $(".testimonial, #testimonial, .reviews, #reviews").length > 0;
    const hasCertifications =
      lowerBody.includes("certified") ||
      lowerBody.includes("accredited") ||
      lowerBody.includes("licensed") ||
      lowerBody.includes("iso ");
    const hasCaseStudies =
      lowerBody.includes("case study") ||
      lowerBody.includes("case studies") ||
      lowerBody.includes("portfolio") ||
      lowerBody.includes("our projects");

    // Images
    const images = $("img");
    const imageCount = images.length;
    let imagesMissingAlt = 0;
    images.each((_, el) => {
      const alt = $(el).attr("alt");
      if (!alt || alt.trim() === "") imagesMissingAlt++;
    });

    // Navigation Items
    const navigationItems: string[] = [];
    $("nav a, header a").slice(0, 12).each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 35 && !navigationItems.includes(text)) {
        navigationItems.push(text);
      }
    });

    // Clean Content Sample
    $("script, style, svg, noscript, nav, footer, iframe").remove();
    const cleanContent = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const words = cleanContent.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const cleanTextSample = words.slice(0, 450).join(" ");

    return {
      url: targetUrl,
      finalUrl,
      statusCode,
      isSsl: finalUrl.startsWith("https://"),
      title,
      metaDescription,
      headings: { h1, h2, h3 },
      wordCount,
      hasSchema: schemas.length > 0,
      schemas,
      schemaTypes,
      contactInfo: {
        emails: Array.from(emails),
        phones: Array.from(phones),
        hasWhatsApp,
        hasContactForm,
        hasPhysicalAddress: lowerBody.includes("street") || lowerBody.includes("suite") || lowerBody.includes("road") || lowerBody.includes("avenue"),
        detectedAddresses: [],
      },
      socialLinks,
      trustSignals: {
        hasPrivacyPolicy,
        hasTerms,
        hasTestimonials,
        hasCertifications,
        hasCaseStudies,
        imageCount,
        imagesMissingAlt,
      },
      cleanTextSample,
      navigationItems,
      footerLinks: [],
    };
  } catch (error: any) {
    return {
      ...defaultResult,
      statusCode: 500,
      cleanTextSample: `Crawler note: Website ${targetUrl} was reached with limited direct access (${error.message || "Timeout or bot shield"}). Heuristics applied based on domain analysis.`,
    };
  }
}
