import { createClient, RedisClientType } from "redis";

export function redisConnectionInfo() {
  return {
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_AUTH,
    user: process.env.REDIS_USER,
    port: parseInt(process.env.REDIS_PORT),
    db: parseInt(process.env.REDIS_DB),
  };
}

export async function createRedisClient(legacyMode = false) {
  return createClient({
    legacyMode,
    url: process.env.REDIS_URL
  });
}
