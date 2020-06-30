import { GraphQLObjectType } from 'graphql';
import userSession from './user-session';
import sessions from './sessions';

export default new GraphQLObjectType({
  name: 'Query',
  fields: {
    userSession,
    sessions,
  },
});
