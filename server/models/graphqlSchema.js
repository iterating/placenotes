import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    email: { type: GraphQLString },
    name: { type: GraphQLString },
  },
});

const NoteType = new GraphQLObjectType({
  name: 'Note',
  fields: {
    id: { type: GraphQLString },
    userId: { type: GraphQLString },
    body: { type: GraphQLString },
    location: {
      type: new GraphQLObjectType({
        name: 'Location',
        fields: {
          type: { type: GraphQLString },
          coordinates: { type: new GraphQLList(GraphQLString) },
        },
      }),
    },
  },
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: UserType,
      args: {
        id: { type: GraphQLString },
      },
    },
    note: {
      type: NoteType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        // Your resolver function here
      },
    },
  },
});

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: UserType,
      args: {
        email: { type: GraphQLString },
        name: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        // Your resolver function here
      },
    },
    createNote: {
      type: NoteType,
      args: {
        userId: { type: GraphQLString },
        body: { type: GraphQLString },
        location: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        // Your resolver function here
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});
