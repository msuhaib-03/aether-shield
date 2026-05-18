const redis = require('redis');

let redisClient = null;
let connectionPromise = null;

/**
 * Initializes and connects the Redis client, ensuring it's only done once.
 * @returns {Promise<import('redis').RedisClientType>} A promise that resolves with the connected Redis client.
 */
async function initializeAndConnectRedis() {
    if (redisClient && redisClient.isReady) {
        return redisClient; // Client is already connected and ready
    }

    if (connectionPromise) {
        return connectionPromise; // Return the existing connection promise
    }

    connectionPromise = (async () => {
        try {
            // Retrieve Redis URL from environment or default to localhost
            const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

            // Create the Redis client instance
            redisClient = redis.createClient({ url: REDIS_URL });

            // Set up error handling for the client
            redisClient.on('error', (err) => {
                console.error('Aether-Shield Redis Client Error:', err);
                // Depending on policy, you might want to trigger a re-initialization or graceful shutdown
            });

            // Connect to Redis
            await redisClient.connect();
            console.log('Aether-Shield: Redis client connected successfully!');

            return redisClient;
        } catch (error) {
            console.error('Aether-Shield: Failed to connect to Redis:', error.message);
            // In case of connection failure, nullify the client and reset promise to allow retries
            redisClient = null;
            connectionPromise = null;
            throw error; // Propagate the error to the caller
        }
    })();

    return connectionPromise;
}

// Execute the connection logic immediately when the module is loaded
// This makes sure the connection attempt starts as soon as possible.
initializeAndConnectRedis();

// Export a getter function for the connected client.
// Other modules should call `await require('./redis').getConnectedClient()` to obtain the client.
module.exports = {
    getConnectedClient: initializeAndConnectRedis,
};