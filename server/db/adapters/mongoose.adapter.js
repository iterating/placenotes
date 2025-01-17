import mongoose from 'mongoose';

class MongooseAdapter {
  constructor(connectionString, options) {
    this.connectionString = connectionString;
    this.options = options;
    this.isConnected = false;
  }

  async connect() {
    try {
      await mongoose.connect(this.connectionString, this.options);
      this.isConnected = true;
      return mongoose.connection;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      this.isConnected = false;
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
      throw error;
    }
  }

  isConnectedToDb() {
    return this.isConnected;
  }

  getClient() {
    return mongoose;
  }
}

export default MongooseAdapter;
