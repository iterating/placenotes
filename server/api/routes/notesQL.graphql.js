import { createHandler } from 'graphql-http/lib/use/http';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        hello: {
            type: GraphQLString,
            resolve: () => 'Hello World!'
        }           
    }
});

const MutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        hello: {
            type: GraphQLString,
            resolve: () => 'Hello World!'
        }               
    }
});

const schema = new GraphQLSchema({
    query: QueryType,
    mutation: MutationType
});

export const handler = createHandler({ schema });
