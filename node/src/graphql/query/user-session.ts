import { GraphQLString } from 'graphql';
import UserSessionType from '../types/user-session';
import UserSessionSchema from '../../models/UserSession';

export const userSession = {
  type: UserSessionType,
  args: {
    username: { type: GraphQLString },
  },
  resolve: async (root: any, args: { username: string }) => {
    return await UserSessionSchema.findOne({ username: args.username });
  },
};

export default userSession;
