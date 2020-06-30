import { GraphQLString, GraphQLInt } from 'graphql';
import UserSessionType from 'graphql/types/user-session';
import UserSessionSchema from 'models/UserSession';

export const setGrade = {
  type: UserSessionType,
  args: {
    sessionId: { type: GraphQLString },
    userAnswerIndex: { type: GraphQLInt },
    grade: { type: GraphQLString },
  },
  resolve: async (
    root: any,
    args: { sessionId: string; userAnswerIndex: number; grade: string }
  ) => {
    if (args.sessionId === undefined) {
      throw new Error('missing required param sessionId');
    }
    if (args.userAnswerIndex === undefined) {
      throw new Error('missing required param userAnswerIndex');
    }
    if (args.grade === undefined) {
      throw new Error('missing required param grade');
    }
    return await UserSessionSchema.setGrade(
      args.sessionId,
      args.userAnswerIndex,
      args.grade
    );
  },
};

export default setGrade;
