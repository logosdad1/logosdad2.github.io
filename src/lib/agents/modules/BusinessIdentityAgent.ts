import { BusinessInput } from "../../rule-engine";
import { BusinessIdentity } from "../types";

/**
 * BusinessIdentityAgent
 * 
 * Phase 3C: Responsible for entity resolution before any discovery begins.
 * It normalizes business names, extracts domains, and attempts to resolve basic details
 * to provide a solid identity foundation for the subsequent agents.
 */
export class BusinessIdentityAgent {
  static async resolve(input: BusinessInput): Promise<BusinessIdentity> {
    const normalizedName = input.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    let discoveredDomains: string[] = [];
    if (input.url) {
      try {
        const parsedUrl = new URL(input.url.startsWith('http') ? input.url : `https://${input.url}`);
        discoveredDomains = [parsedUrl.hostname];
      } catch (e) {
        console.warn("Invalid URL provided to BusinessIdentityAgent:", input.url);
      }
    }
    
    return {
      name: input.name,
      normalizedName,
      industry: input.industry,
      location: input.location,
      website: input.url,
      discoveredDomains,
      discoveredSocialProfiles: [],
      discoveredBusinessProfiles: [],
      // If we don't have a URL, we cannot mathematically confirm it yet without a search API
      entityConfidence: input.url ? "CONFIRMED" : "POSSIBLE",
    };
  }
}
