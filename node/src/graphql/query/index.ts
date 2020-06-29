import { GraphQLObjectType } from 'graphql';
import userSession from './user-session';

export default new GraphQLObjectType({
  name: 'Query',
  fields: {
    userSession,
  },
});
