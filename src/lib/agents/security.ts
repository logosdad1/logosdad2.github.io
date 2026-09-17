import dns from "dns";
import { promisify } from "util";

const lookupAsync = promisify(dns.lookup);

export async function validateUrlSecurity(targetUrl: string): Promise<{ safe: boolean; normalizedUrl: string; error?: string }> {
  if (!targetUrl || targetUrl.trim() === "") {
    return { safe: false, normalizedUrl: "", error: "Empty URL provided." };
  }

  let normalizedUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch (err) {
    return { safe: false, normalizedUrl: "", error: "Invalid URL format." };
  }

  // Block unsafe protocols
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return { safe: false, normalizedUrl: "", error: "Invalid protocol. Only HTTP and HTTPS are allowed." };
  }

  // Block unsafe ports (e.g., SSH, SMTP, internal services)
  const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : (parsedUrl.protocol === "https:" ? 443 : 80);
  const allowedPorts = [80, 443, 8080, 8443];
  if (!allowedPorts.includes(port)) {
    return { safe: false, normalizedUrl: "", error: "Target port is restricted for security reasons." };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Basic string-based blocks for metadata/loopback hosts
  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname.includes("169.254.169.254") ||
    hostname.includes("metadata.google.internal") ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1"
  ) {
    return { safe: false, normalizedUrl: "", error: "Target hostname is restricted for security reasons." };
  }

  // Resolve DNS to catch domains pointing to internal IPs
  try {
    const { address } = await lookupAsync(hostname);
    if (isPrivateIP(address)) {
      return { safe: false, normalizedUrl: "", error: "Target resolves to a restricted private IP address." };
    }
  } catch (err) {
    return { safe: false, normalizedUrl: "", error: "Failed to resolve hostname via DNS." };
  }

  return { safe: true, normalizedUrl: parsedUrl.href };
}

function isPrivateIP(ip: string): boolean {
  // IPv4 Private blocks
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("127.")) return true;
  if (ip.startsWith("169.254.")) return true;
  if (ip === "0.0.0.0") return true;

  // 172.16.x.x - 172.31.x.x
  if (ip.startsWith("172.")) {
    const parts = ip.split(".");
    if (parts.length > 1) {
      const secondOctet = parseInt(parts[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) return true;
    }
  }

  // IPv6 Loopback/Local
  if (ip === "::1") return true;
  if (ip.toLowerCase().startsWith("fc") || ip.toLowerCase().startsWith("fd")) return true;
  if (ip.toLowerCase().startsWith("fe80")) return true;

  return false;
}
