import { Redis } from 'ioredis';
import { env } from '../config/env.js';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.redisUrl, { maxRetriesPerRequest: null });
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await getRedis().get(key);
  return data ? (JSON.parse(data) as T) : null;
}

export async function cacheSet(key: string, value: unknown, ttl = env.cacheTtlSeconds): Promise<void> {
  await getRedis().setex(key, ttl, JSON.stringify(value));
}
