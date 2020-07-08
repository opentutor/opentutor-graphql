import { GraphQLObjectType } from 'graphql';
import userSession from './user-session';
import session from './session';
import sessions from './sessions';

export default new GraphQLObjectType({
  name: 'Query',
  fields: {
    userSession,
    session,
    sessions,
  },
});
