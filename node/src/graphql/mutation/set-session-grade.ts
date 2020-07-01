import { GraphQLString, GraphQLFloat } from 'graphql';
import SessionType from '../types/session';
import SessionSchema from '../../models/Session';

export const setSessionGrade = {
  type: SessionType,
  args: {
    sessionId: { type: GraphQLString },
    grade: { type: GraphQLFloat },
  },
  resolve: async (root: any, args: any) => {
    if (args.sessionId === undefined) {
      throw new Error('missing required param sessionId');
    }
    if (args.grade === undefined) {
      throw new Error('missing required param grade');
    }
    return await SessionSchema.setGrade(args.sessionId, args.grade);
  },
};

export default setSessionGrade;
