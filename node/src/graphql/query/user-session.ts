import { GraphQLString } from 'graphql';
import UserSessionType from 'graphql/types/user-session';
import UserSessionSchema from 'models/UserSession';
import findOne from './find-one';

export const userSession = findOne({
  model: UserSessionSchema,
  type: UserSessionType,
  typeName: 'usersession',
  argsConfig: {
    sessionId: {
      description: 'id of the session',
      type: GraphQLString,
    },
  },
});

export default userSession;
