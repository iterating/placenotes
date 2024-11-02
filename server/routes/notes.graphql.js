
// // GraphQL
// import { graphqlHTTP } from 'graphql-http';

// const schema = new (require('graphql')).GraphQLSchema({
//   query: new (require('graphql')).ObjectType({
//     name: 'Query',
//     fields: {
//       notes: {
//         type: new (require('graphql')).List(
//           new (require('graphql')).ObjectType({
//             name: 'Note',
//             fields: {
//               _id: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//               userId: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//               body: { type: new (require('graphql')).String },
//               time: { type: new (require('graphql')).String },
//               location: { type: new (require('graphql')).String },
//             },
//           })
//         ),
//         resolve: async (parent, args, context, info) => {
//           return await Note.find({ userId: context.req.user._id });
//         },
//       },
//       note: {
//         type: new (require('graphql')).ObjectType({
//           name: 'Note',
//           fields: {
//             _id: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//             userId: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//             body: { type: new (require('graphql')).String },
//             time: { type: new (require('graphql')).String },
//             location: { type: new (require('graphql')).String },
//           },
//         }),
//         args: {
//           id: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//         },
//         resolve: async (parent, args, context, info) => {
//           return await Note.findOne({ userId: context.req.user._id, _id: args.id });
//         },
//       },
//       notesAtLocation: {
//         type: new (require('graphql')).List(
//           new (require('graphql')).ObjectType({
//             name: 'Note',
//             fields: {
//               _id: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//               userId: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//               body: { type: new (require('graphql')).String },
//               time: { type: new (require('graphql')).String },
//               location: { type: new (require('graphql')).String },
//             },
//           })
//         ),
//         args: {
//           location: { type: new (require('graphql')).NonNull(new (require('graphql')).String) },
//         },
//         resolve: async (parent, args, context, info) => {
//           return await Note.find({ userId: context.req.user._id, location: args.location });
//         },
//       },
//     },
//   }),
//   mutation: new (require('graphql')).ObjectType({
//     name: 'Mutation',
//     fields: {
//       addNote: {
//         type: new (require('graphql')).ObjectType({
//           name: 'Note',
//           fields: {
//             _id: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//             userId: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//             body: { type: new (require('graphql')).String },
//             time: { type: new (require('graphql')).String },
//             location: { type: new (require('graphql')).String },
//           },
//         }),
//         args: {
//           body: { type: new (require('graphql')).NonNull(new (require('graphql')).String) },
//           location: { type: new (require('graphql')).NonNull(new (require('graphql')).String) },
//           time: { type: new (require('graphql')).NonNull(new (require('graphql')).String) },
//         },
//         resolve: async (parent, args, context, info) => {
//           const note = new Note({
//             userId: context.req.user._id,
//             body: args.body,
//             location: args.location,
//             time: args.time,
//           });
//           return await note.save();
//         },
//       },
//       editNote: {
//         type: new (require('graphql')).ObjectType({
//           name: 'Note',
//           fields: {
//             _id: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//             userId: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//             body: { type: new (require('graphql')).String },
//             time: { type: new (require('graphql')).String },
//             location: { type: new (require('graphql')).String },
//           },
//         }),
//         args: {
//           id: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//           body: { type: new (require('graphql')).String },
//           location: { type: new (require('graphql')).String },
//           time: { type: new (require('graphql')).String },
//         },
//         resolve: async (parent, args, context, info) => {
//           return await Note.findOneAndUpdate(
//             { userId: context.req.user._id, _id: args.id },
//             { $set: args },
//             { new: true }
//           );
//         },
//       },
//       deleteNote: {
//         type: new (require('graphql')).ObjectType({
//           name: 'Note',
//           fields: {
//             _id: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//             userId: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//             body: { type: new (require('graphql')).String },
//             time: { type: new (require('graphql')).String },
//             location: { type: new (require('graphql')).String },
//           },
//         }),
//         args: {
//           id: { type: new (require('graphql')).NonNull(new (require('graphql')).ID) },
//         },
//         resolve: async (parent, args, context, info) => {
//           return await Note.findOneAndDelete({ userId: context.req.user._id, _id: args.id });
//         },
//       },
//     },
//   }),
// });

// router.use('/graphql', graphqlHTTP({
//   schema: schema,
//   graphiql: true,
// }));