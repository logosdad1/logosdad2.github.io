import { Evidence, BusinessIdentity, EvidenceSource } from "../agents/types";

export interface DigitalDiscoveryProvider {
  sourceType: EvidenceSource["sourceType"];
  discover(identity: BusinessIdentity): Promise<Evidence[]>;
}

export class WebsiteDiscoveryProvider implements DigitalDiscoveryProvider {
  sourceType: EvidenceSource["sourceType"] = "WEBSITE";
  
  // This would take the existing crawl result and convert it into Evidence objects
  async discover(identity: BusinessIdentity): Promise<Evidence[]> {
    if (!identity.website) return [];
    
    // Abstracted: the pipeline already runs the cheerio crawler, 
    // so we'd map its output to formal Evidence objects here in a full refactor.
    // For now, we just return basic observed evidence.
    return [
      {
        id: `web-${Date.now()}-1`,
        sourceType: "WEBSITE",
        sourceUrl: identity.website,
        sourceName: "Official Website",
        evidenceType: "HTTPS_SECURE",
        observedValue: identity.website.startsWith("https") ? "TRUE" : "FALSE",
        confidence: "VERIFIED",
        collectedAt: new Date(),
      }
    ];
  }
}

// MOCK ADAPTERS (as requested in rule 36: DO NOT FAKE EXTERNAL DATA)
// These explicitly return test evidence based on input for Phase 3 architecture verification.

export class SerperSearchDiscoveryProvider implements DigitalDiscoveryProvider {
  sourceType: EvidenceSource["sourceType"] = "SEARCH";
  
  async discover(identity: BusinessIdentity): Promise<Evidence[]> {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      console.warn("SERPER_API_KEY is missing. Search discovery disabled.");
      return [];
    }

    const query = `${identity.name} ${identity.location}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query, gl: "us" }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.statusText}`);
      }

      const data = await response.json();
      const evidence: Evidence[] = [];

      // 1. Check if they have a knowledge graph panel
      if (data.knowledgeGraph) {
        evidence.push({
          id: `search-kg-${Date.now()}`,
          sourceType: "SEARCH",
          sourceUrl: data.knowledgeGraph.website || "google.com",
          sourceName: "Google Knowledge Graph",
          evidenceType: "VERIFIED_ENTITY",
          observedValue: data.knowledgeGraph.title || identity.name,
          confidence: "VERIFIED",
          collectedAt: new Date(),
        });
      }

      // 2. Check their organic ranking for their own brand name
      if (data.organic && data.organic.length > 0) {
        const topResult = data.organic[0];
        const isFirst = topResult.title.toLowerCase().includes(identity.name.toLowerCase()) || 
                       (identity.website && topResult.link.includes(new URL(identity.website).hostname.replace('www.', '')));
        
        if (isFirst) {
          evidence.push({
            id: `search-org-${Date.now()}`,
            sourceType: "SEARCH",
            sourceUrl: topResult.link,
            sourceName: "Google Organic Search",
            evidenceType: "BRAND_DOMINANCE",
            observedValue: "Ranks #1 for brand query",
            confidence: "VERIFIED",
            collectedAt: new Date(),
          });
        }
      }

      // 3. Extract competitor or generic directory mentions
      const directories = data.organic?.filter((res: any) => 
        res.link.includes("yelp.com") || 
        res.link.includes("bbb.org") || 
        res.link.includes("angi.com") ||
        res.link.includes("tripadvisor.com")
      );

      if (directories && directories.length > 0) {
        directories.forEach((dir: any, index: number) => {
          evidence.push({
            id: `search-dir-${Date.now()}-${index}`,
            sourceType: "SEARCH",
            sourceUrl: dir.link,
            sourceName: new URL(dir.link).hostname.replace('www.', ''),
            evidenceType: "THIRD_PARTY_MENTION",
            observedValue: dir.title,
            confidence: "OBSERVED",
            collectedAt: new Date(),
          });
        });
      }

      return evidence;
    } catch (err) {
      console.error("Failed to execute Serper discovery:", err);
      return [];
    }
  }
}

export class MockLocalDiscoveryProvider implements DigitalDiscoveryProvider {
  sourceType: EvidenceSource["sourceType"] = "LOCAL";
  
  async discover(identity: BusinessIdentity): Promise<Evidence[]> {
    // REAL IMPLEMENTATION PENDING: Attach Google Places API here.
    // RULE: DO NOT FABRICATE DATA.
    return [];
  }
}

export class MockSocialDiscoveryProvider implements DigitalDiscoveryProvider {
  sourceType: EvidenceSource["sourceType"] = "SOCIAL";
  
  async discover(identity: BusinessIdentity): Promise<Evidence[]> {
    // REAL IMPLEMENTATION PENDING: Attach Social Graph / Scraping API here.
    // RULE: DO NOT FABRICATE DATA.
    return [];
  }
}
