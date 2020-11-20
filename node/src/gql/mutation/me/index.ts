import { GraphQLObjectType } from 'graphql';
import { User } from 'models/User';
import deleteLesson from './delete-lesson';
import setGrade from './set-grade';
import updateLastTrainedAt from './update-last-trained-at';
import updateLesson from './update-lesson';
import updateSession from './update-session';

export const Me: GraphQLObjectType = new GraphQLObjectType({
  name: 'Me',
  fields: {
    deleteLesson,
    setGrade,
    updateLastTrainedAt,
    updateLesson,
    updateSession,
  },
});

export const me = {
  type: Me,
  resolve: (_: any, args: any, context: { user: User }) => {
    if (!context.user) {
      throw new Error('Only authenticated users');
    }
    return {
      user: context.user,
    };
  },
};

export default me;
