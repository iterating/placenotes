import dbAdapter from '../db/connection.js';

class BaseModel {
  constructor(modelName, schema) {
    this.modelName = modelName;
    this.schema = schema;
    this.db = dbAdapter;
    this.model = this.initializeModel();
  }

  initializeModel() {
    const client = this.db.getClient();
    return client.model(this.modelName, this.schema);
  }

  async create(data) {
    return await this.model.create(data);
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findOne(query) {
    return await this.model.findOne(query);
  }

  async find(query, options = {}) {
    return await this.model.find(query, null, options);
  }

  async updateOne(query, update, options = {}) {
    return await this.model.updateOne(query, update, options);
  }

  async updateMany(query, update, options = {}) {
    return await this.model.updateMany(query, update, options);
  }

  async deleteOne(query) {
    return await this.model.deleteOne(query);
  }

  async deleteMany(query) {
    return await this.model.deleteMany(query);
  }

  async aggregate(pipeline) {
    return await this.model.aggregate(pipeline);
  }

  // Utility method for creating indexes
  async createIndexes(indexes) {
    return await this.model.createIndexes(indexes);
  }

  // Get the underlying database model
  getModel() {
    return this.model;
  }

  // Get the schema
  getSchema() {
    return this.schema;
  }
}

export default BaseModel;
