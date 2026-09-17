import { CrawlResult, AuditReportDataPayload } from "./types";
import { BusinessInput } from "./rule-engine";
import { runModularIntelligencePipeline } from "./agents/pipeline";

export async function runMultiAgentAudit(
  input: BusinessInput,
  crawl: CrawlResult
): Promise<AuditReportDataPayload> {
  // Delegate entirely to the new modular architecture
  return runModularIntelligencePipeline(input, crawl);
}
