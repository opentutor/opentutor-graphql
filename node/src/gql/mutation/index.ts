import { GraphQLObjectType } from 'graphql';
import setGrade from './set-grade';
import updateLesson from './update-lesson';
import updateSession from './update-session';

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    setGrade,
    updateLesson,
    updateSession,
  },
});
