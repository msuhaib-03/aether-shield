const redis = require('redis');
let client = null; // Initialize client to null to ensure it's not undefined

const initializeRedisClient = async () => {
    // Check if client exists and is already open (for redis v4+)
    // This prevents re-initializing an active client
    if (client && client.isOpen) {
        return client;
    }

    try {
        // Configure Redis client using environment variables for flexibility and security
        const redisConfig = {
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            // Optionally add password, TLS, and other configurations from environment variables
            // password: process.env.REDIS_PASSWORD,
            // tls: process.env.REDIS_TLS === 'true' ? {} : false,
        };

        client = redis.createClient(redisConfig);

        // Set up error handling for the Redis client
        client.on('error', (err) => {
            console.error('Aether-Shield: Redis Client Error:', err);
            // Implement specific error handling here, e.g., metrics, alerts, graceful shutdown
        });

        // Log successful connection
        client.on('connect', () => {
            console.log('Aether-Shield: Redis client connected successfully.');
        });

        // Log when the client is ready to process commands
        client.on('ready', () => {
            console.log('Aether-Shield: Redis client is ready.');
        });

        // Handle connection ending gracefully
        client.on('end', () => {
            console.log('Aether-Shield: Redis client connection ended.');
            // If the connection ends, clear the client instance to force re-initialization on next request
            client = null;
        });

        // Explicitly connect the client and wait for it to be ready
        // This ensures `client` is a valid object before `connect()` is called
        await client.connect();

        return client;
    } catch (error) {
        console.error('Aether-Shield: Failed to initialize Redis client:', error);
        // Clear the client instance if initialization fails to prevent using a faulty instance
        client = null;
        // Re-throw the error to allow calling services to handle the connection failure
        throw error;
    }
};

// Export the async function which will return a connected Redis client instance
module.exports = initializeRedisClient;
