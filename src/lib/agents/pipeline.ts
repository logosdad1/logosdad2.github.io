import { BusinessInput } from "../rule-engine";
import { CrawlResult, AuditReportDataPayload } from "../types";
import { 
  runWebsiteAnalysisAgent,
  runAIVisibilityAgent,
  runLocalPresenceAgent,
  runContentAuthorityAgent,
  runTrustReputationAgent,
  runConversionAgent
} from "./intelligence-agents";
import { runIntelligenceSynthesisAgent } from "./synthesis-agent";
import { IdentityResolutionEngine } from "../discovery/identity";
import { 
  WebsiteDiscoveryProvider, 
  MockSearchDiscoveryProvider, 
  MockLocalDiscoveryProvider, 
  MockSocialDiscoveryProvider 
} from "../discovery/providers";
import { Evidence } from "./types";

export async function runModularIntelligencePipeline(
  input: BusinessInput,
  crawl: CrawlResult
): Promise<AuditReportDataPayload> {
  const hasWebsite = !!crawl.url && crawl.statusCode > 0 && crawl.statusCode < 400;

  // PHASE 3C: Business Identity Layer
  const identity = IdentityResolutionEngine.resolve(input);

  // PHASE 3D-F: Digital Discovery Framework
  // Run all discovery modules in parallel
  const discoveryProviders = [
    new WebsiteDiscoveryProvider(),
    new MockSearchDiscoveryProvider(),
    new MockLocalDiscoveryProvider(),
    new MockSocialDiscoveryProvider(),
  ];

  const discoveryPromises = discoveryProviders.map(provider => 
    provider.discover(identity).catch(e => {
      console.warn(`Discovery provider ${provider.sourceType} failed:`, e.message);
      return []; // Graceful degradation for partial failures (Rule 26)
    })
  );

  const evidenceArrays = await Promise.all(discoveryPromises);
  const evidence: Evidence[] = evidenceArrays.flat();

  // Create standard Agent Context with Identity and Evidence
  const context = {
    input,
    crawl,
    hasWebsite,
    identity,
    evidence
  };

  // PHASE 3E-L: Intelligence Analysis Agents
  // Agents now have access to multi-source evidence
  const [
    websiteClarity,
    aiVisibility,
    searchLocal,
    contentAuthority,
    trustCredibility,
    conversionReadiness
  ] = await Promise.all([
    runWebsiteAnalysisAgent(context),
    runAIVisibilityAgent(context),
    runLocalPresenceAgent(context),
    runContentAuthorityAgent(context),
    runTrustReputationAgent(context),
    runConversionAgent(context)
  ]);

  const categories = {
    websiteClarity,
    aiVisibility,
    searchLocal,
    contentAuthority,
    trustCredibility,
    conversionReadiness
  };

  // PHASE 3I: Synthesize Intelligence
  const reportPayload = await runIntelligenceSynthesisAgent(context, categories);

  return reportPayload;
}
