const { createClient } = require('redis');

let client = null;

/**
 * Initializes and connects to the Redis server.
 * Ensures only one client instance is created and connected.
 * @returns {Promise<import('redis').RedisClientType>}
 */
async function initializeAndConnectRedis() {
    if (client && client.isOpen) {
        console.log('Redis client already connected.');
        return client;
    }

    try {
        // Ensure the client is created and assigned here, before calling .connect()
        client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            // Add other Redis client options as needed (e.g., password, db)
        });

        client.on('error', (err) => {
            console.error('Redis Client Error:', err);
            // Optionally implement re-connection logic or application shutdown here
        });

        await client.connect();
        console.log('Successfully connected to Redis!');
        return client;
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        // Reset client on failure to allow re-initialization attempts
        client = null;
        throw error; // Re-throw to propagate the connection failure
    }
}

/**
 * Returns the connected Redis client instance.
 * Throws an error if the client is not yet initialized or connected.
 * @returns {import('redis').RedisClientType}
 */
function getRedisClient() {
    if (!client || !client.isOpen) {
        throw new Error('Redis client is not initialized or not connected. Call initializeAndConnectRedis() first.');
    }
    return client;
}

/**
 * Disconnects the Redis client.
 */
async function disconnectRedis() {
    if (client && client.isOpen) {
        await client.disconnect();
        console.log('Redis client disconnected.');
        client = null;
    }
}

module.exports = {
    initializeAndConnectRedis,
    getRedisClient,
    disconnectRedis
};
