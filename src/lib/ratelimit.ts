import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | undefined;

function getRedis() {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required");
  }

  try {
    if (new URL(url).protocol !== "https:") throw new Error("URL must use https");
  } catch {
    throw new Error("UPSTASH_REDIS_REST_URL must be a valid https URL");
  }

  redis = new Redis({ url, token });
  return redis;
}

const cache = new Map<string, Ratelimit>();
export async function limited(name: string, key: string, n: number, window: `${number} ${"s" | "m" | "h"}`) {
  let rl = cache.get(name);
  if (!rl) cache.set(name, (rl = new Ratelimit({ redis: getRedis(), limiter: Ratelimit.slidingWindow(n, window), prefix: `rl:${name}` })));
  return !(await rl.limit(key)).success;
}
