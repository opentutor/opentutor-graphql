import { GraphQLString } from 'graphql';
import UserSessionType from 'gql/types/user-session';
import { UserSession } from 'models';
import calculateScore from 'models/utils/calculate-score';

export const updateSession = {
  type: UserSessionType,
  args: {
    sessionId: { type: GraphQLString },
    userSession: { type: GraphQLString },
  },
  resolve: async (root: any, args: any) => {
    if (args.sessionId === undefined) {
      throw new Error('missing required param sessionId');
    }
    if (args.userSession === undefined) {
      throw new Error('missing required param userSession');
    }
    const userSession = JSON.parse(decodeURI(args.userSession));
    if (!userSession.sessionId) {
      throw new Error('userSession is missing a sessionId');
    }
    if (!userSession.lessonId) {
      throw new Error('userSession is missing a lessonId');
    }

    const grade = calculateScore(userSession, 'graderGrade');
    const classifierGrade = calculateScore(userSession, 'classifierGrade');

    return await UserSession.findOneAndUpdate(
      {
        sessionId: args.sessionId,
      },
      {
        $set: {
          ...userSession,
          graderGrade: grade,
          classifierGrade: classifierGrade,
        },
      },
      {
        new: true, // return the updated doc rather than pre update
        upsert: true, // insert if no user session found
      }
    );
  },
};

export default updateSession;
