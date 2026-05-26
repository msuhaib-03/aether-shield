const redis = require('redis');

let redisClient = null; // Initialize to null to clearly indicate no client is set yet

async function initializeRedis() {
  // If the client is already connected and ready, return it immediately.
  if (redisClient && redisClient.isReady) {
    console.log('Redis client is already connected and ready.');
    return redisClient;
  }

  // If no client exists or it's not ready, attempt to create/reconnect.
  if (!redisClient || !redisClient.isReady) {
    try {
      // Create a new client if it's null or a previous connection failed irrevocably
      if (!redisClient) {
        redisClient = redis.createClient({
          url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        // Set up event listeners for the client lifecycle
        redisClient.on('error', (err) => {
          console.error('Redis Client Error:', err);
          // Implement robust error handling (e.g., exponential backoff for reconnection)
        });

        redisClient.on('connect', () => {
          console.log('Redis client connection established.');
        });

        redisClient.on('end', () => {
          console.warn('Redis client connection ended. Will attempt to re-establish on next request.');
          // Set client to null to force re-creation on the next call to initializeRedis
          redisClient = null;
        });

        redisClient.on('ready', () => {
          console.log('Redis client is ready to use!');
        });
      }
      
      // Attempt to connect the client (this is where the original error occurred)
      await redisClient.connect(); 
      console.log('Redis client initialized and connected successfully.');
      return redisClient;

    } catch (error) {
      console.error('Failed to initialize and connect to Redis:', error);
      // Ensure redisClient is reset to null if connection fails to allow re-attempt
      redisClient = null;
      throw error; // Re-throw to signal initialization failure to the calling context
    }
  }
}

// Function to safely get the client instance, ensuring it's initialized and connected
async function getRedisClient() {
  if (!redisClient || !redisClient.isReady) {
    await initializeRedis();
  }
  return redisClient;
}

module.exports = {
  initializeRedis,   // For application startup to ensure initial connection
  getRedisClient,    // For other modules to retrieve the connected client
  get clientInstance() { // Getter for direct access if client is already known to be connected
    return redisClient;
  }
};