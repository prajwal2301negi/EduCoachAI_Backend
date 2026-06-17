const { Redis } = require("@upstash/redis");

/**
 * Redis client using Upstash's REST API (HTTP-based, not a persistent TCP
 * connection) — built for serverless/edge environments but works fine here too.
 * Needs UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from your Upstash
 * console (the "REST API" tab, not the ioredis/CLI tab).
 *
 * Caching is an optimization, not a hard dependency — if these env vars are
 * missing, getRedisClient() returns null and callers should skip caching.
 */
let redisClient = null;

const connectRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("⚠️ Upstash Redis REST credentials not set, caching disabled");
    return null;
  }

  redisClient = new Redis({ url, token });
  console.log("✅ Redis (Upstash REST) client initialized");
  return redisClient;
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };