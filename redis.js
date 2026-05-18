const redis = require('redis');

let client = null;
let clientPromise = null; // To store the promise of the client connection

/**
 * Initializes and returns a connected Redis client instance.
 * Ensures a singleton client and handles connection retries/errors gracefully.
 * @returns {Promise<import('redis').RedisClientType>}
 */
async function getRedisClient() {
    // If client is already connected and ready, return it immediately.
    if (client && client.isReady) {
        return client;
    }

    // If a connection attempt is already in progress, return that promise.
    if (clientPromise) {
        return clientPromise;
    }

    // Otherwise, initiate a new connection attempt.
    clientPromise = (async () => {
        try {
            console.log('Attempting to connect to Redis...');
            const newClient = redis.createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379' // Use environment variables for production
            });

            newClient.on('error', (err) => {
                console.error('Redis Client Error:', err);
                // On error, reset client and promise to allow re-initialization on next request
                client = null;
                clientPromise = null;
                // Optionally, implement more sophisticated error handling like exponential backoff reconnects
            });

            await newClient.connect();
            console.log('Redis client connected successfully.');
            client = newClient; // Store the successfully connected client
            clientPromise = null; // Clear the promise as connection is established
            return client;
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            // On failure, reset client and promise
            client = null;
            clientPromise = null;
            throw error; // Propagate the connection error
        }
    })();

    return clientPromise;
}

module.exports = getRedisClient;