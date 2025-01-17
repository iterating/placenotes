import MongooseAdapter from './adapters/mongoose.adapter.js';

class DatabaseFactory {
  static createAdapter(type, config) {
    switch (type.toLowerCase()) {
      case 'mongodb':
      case 'mongoose':
        return new MongooseAdapter(config.connectionString, config.options);
      // Add more database adapters here as needed
      // case 'postgres':
      //   return new PostgresAdapter(config);
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }
}

export default DatabaseFactory;
