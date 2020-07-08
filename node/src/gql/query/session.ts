import { GraphQLString } from 'graphql';
import SessionType from 'gql/types/session';
import { Session } from 'models';
import findOne from './find-one';

export const session = findOne({
  model: Session,
  type: SessionType,
  typeName: 'session',
  argsConfig: {
    sessionId: {
      description: 'id of the session',
      type: GraphQLString,
    },
  },
});

export default session;
