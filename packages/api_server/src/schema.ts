import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeResolvers } from '@graphql-tools/merge';

import BookResolvers from '@/resolvers/Book';
import LibraryResolvers from '@/resolvers/Library';

import BookSchema from './schema/BookService.graphql';
import LibrarySchema from '@/schema/LibraryService.graphql';
console.log(BookSchema);

import Foo from '@ping-pong/api_schema/src/BookService.graphql';
console.log(Foo);

export default makeExecutableSchema({
  typeDefs: [BookSchema, LibrarySchema],
  resolvers: mergeResolvers([LibraryResolvers, BookResolvers]),
});
