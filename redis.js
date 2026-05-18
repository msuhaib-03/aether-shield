const redis = require('redis');

let redisClient;

async function initializeRedisConnection() {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        if (!redisClient || !redisClient.isReady) {
            console.log('Attempting to initialize Redis client...');
            redisClient = redis.createClient({ url: redisUrl });

            redisClient.on('error', (err) => {
                console.error('Redis Client Error:', err);
                // Optionally add logic for reconnection attempts or circuit breaking
            });

            redisClient.on('connect', () => console.log('Redis client connected.'));
            redisClient.on('ready', () => console.log('Redis client is ready for use.'));
            redisClient.on('end', () => console.log('Redis client disconnected.'));
            redisClient.on('reconnecting', () => console.log('Redis client reconnecting...'));

            await redisClient.connect();
            console.log('Redis client successfully connected and initialized.');
        } else {
            console.log('Redis client already initialized and connected.');
        }
        return redisClient;
    } catch (error) {
        console.error('Failed to initialize or connect to Redis:', error);
        // Explicitly set client to null/undefined on failure to prevent stale state
        redisClient = null; 
        throw new Error(`Redis connection failed: ${error.message}`);
    }
}

// Export a function to get the connected client, ensuring connection on demand
module.exports = {
    getConnectedRedisClient: async () => {
        if (!redisClient || !redisClient.isReady) {
            await initializeRedisConnection();
        }
        return redisClient;
    },
    // Also export the connection function directly if needed for initial setup
    initializeRedisConnection 
};