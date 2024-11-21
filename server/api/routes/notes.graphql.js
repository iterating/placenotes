
import { graphqlHTTP } from 'graphql-http';

const schema = new (require('graphql')).GraphQLSchema({
  query: new (require('graphql')).ObjectType({
    name: 'Query',
