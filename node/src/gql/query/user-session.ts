import { GraphQLString } from 'graphql';
import UserSessionType from 'gql/types/user-session';
import { UserSession } from 'models';
import findOne from './find-one';

export const userSession = findOne({
  model: UserSession,
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
