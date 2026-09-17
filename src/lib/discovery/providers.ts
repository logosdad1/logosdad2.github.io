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

export class MockSearchDiscoveryProvider implements DigitalDiscoveryProvider {
  sourceType: EvidenceSource["sourceType"] = "SEARCH";
  
  async discover(identity: BusinessIdentity): Promise<Evidence[]> {
    // REAL IMPLEMENTATION PENDING: Attach Google Custom Search / Serper API here.
    // RULE: DO NOT FABRICATE DATA.
    return [];
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
