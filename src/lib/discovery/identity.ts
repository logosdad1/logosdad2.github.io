import { BusinessIdentity } from "../agents/types";
import { BusinessInput } from "../rule-engine";

export class IdentityResolutionEngine {
  static resolve(input: BusinessInput): BusinessIdentity {
    const normalizedName = input.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    let discoveredDomains: string[] = [];
    if (input.url) {
      try {
        const parsedUrl = new URL(input.url.startsWith('http') ? input.url : `https://${input.url}`);
        discoveredDomains = [parsedUrl.hostname];
      } catch (e) {
        console.warn("Invalid URL provided to IdentityResolutionEngine:", input.url);
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
      entityConfidence: input.url ? "CONFIRMED" : "POSSIBLE",
    };
  }
}
