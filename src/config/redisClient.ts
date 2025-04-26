import { createClient, RedisClientType } from 'redis';

const client: RedisClientType = createClient({
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

client.on('error', (err) => {
  console.error('❌ Redis 連線錯誤', err);
});

let connected = false;

const getRedisClient = async (): Promise<RedisClientType> => {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client;
};

export default getRedisClient;
