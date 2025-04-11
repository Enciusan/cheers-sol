import type NodeCache from "node-cache";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const NodeCache = (await import("node-cache")).default;
    const config: NodeCache.Options = {
      // Default TTL of 2 minutes
      stdTTL: 120,
    };

    global.memCache = new NodeCache(config);
  }
}
