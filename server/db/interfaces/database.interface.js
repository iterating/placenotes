/**
 * Interface for database adapters
 * All database adapters should implement these methods
 */
class DatabaseInterface {
  async connect() {
    throw new Error('connect() must be implemented');
  }

  async disconnect() {
    throw new Error('disconnect() must be implemented');
  }

  isConnectedToDb() {
    throw new Error('isConnectedToDb() must be implemented');
  }

  getClient() {
    throw new Error('getClient() must be implemented');
  }
}

export default DatabaseInterface;
