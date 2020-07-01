import { GraphQLString } from 'graphql';
import UserSessionType from '../types/user-session';
import UserSessionSchema from '../../models/UserSession';
import SessionSchema from '../../models/Session';

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

    await SessionSchema.findOneAndUpdate(
      {
        sessionId: args.sessionId,
      },
      {
        $set: {
          sessionId: args.sessionId,
          username: userSession.username,
        },
      },
      {
        new: true, // return the updated doc rather than pre update
        upsert: true, // insert if no session found
      }
    );

    return await UserSessionSchema.findOneAndUpdate(
      {
        sessionId: args.sessionId,
      },
      {
        $set: {
          ...userSession,
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
