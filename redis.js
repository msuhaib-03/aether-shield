const redis = require('redis');

// Centralized configuration for Redis connection
// Best practice: use environment variables for sensitive or deployment-specific data
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// This promise will resolve to the connected Redis client
// or reject if the connection fails, ensuring proper async initialization.
const redisClientPromise = (async () => {
    let clientInstance; // Declare clientInstance here to ensure it's in scope for the try/catch

    try {
        // Initialize the Redis client. This step ensures 'clientInstance' is defined.
        clientInstance = redis.createClient({
            url: REDIS_URL
        });

        // Set up an error listener for the client. This will catch connection issues
        // after the initial successful connection, or during re-connection attempts.
        clientInstance.on('error', (err) => {
            console.error('Aether-Shield (Redis Client): Error event caught:', err);
            // In a self-healing system, more sophisticated error handling like
            // automatic re-connection attempts or circuit breakers would be implemented here.
            // For now, logging provides visibility.
        });

        // Attempt to connect to the Redis server.
        // The 'await' keyword ensures this operation completes before proceeding.
        // This line directly addresses the "Cannot read connect of undefined" by
        // guaranteeing `clientInstance` is an object returned by `createClient()`
        // before attempting to call its `connect()` method.
        await clientInstance.connect();

        console.log('Aether-Shield (Redis Client): Successfully connected to Redis.');
        return clientInstance; // Return the successfully connected client
    } catch (error) {
        // Catch any errors during client creation or the initial connection attempt.
        console.error('Aether-Shield (Redis Client): CRITICAL failure during Redis initialization or connection:', error);
        // Re-throw the error so that consuming modules are aware of the failure
        // and can handle it appropriately (e.g., exit, retry, fallback).
        throw error;
    }
})();

// Export the promise so that other modules can 'await' it to get the connected client.
// Example: `const redisClient = await require('./redis.js');`
module.exports = redisClientPromise;
