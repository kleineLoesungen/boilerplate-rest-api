import Redis from 'ioredis'

//FIXME: More Configuration
export const redisRepository = new Redis({
	port: 6379,
	host: process.env.REDIS_HOST!,
	password: process.env.REDIS_PASSWORD!,
});