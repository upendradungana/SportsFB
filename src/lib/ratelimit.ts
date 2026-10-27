import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
const cache = new Map<string, Ratelimit>();
export async function limited(name: string, key: string, n: number, window: `${number} ${"s" | "m"}`) {
  let rl = cache.get(name);
  if (!rl) cache.set(name, (rl = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(n, window), prefix: `rl:${name}` })));
  return !(await rl.limit(key)).success;
}
