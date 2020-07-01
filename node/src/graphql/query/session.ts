import { GraphQLString } from 'graphql';
import SessionType from '../types/session';
import SessionSchema from '../../models/Session';
import findOne from './find-one';

export const session = findOne({
  model: SessionSchema,
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
