import { GraphQLObjectType } from 'graphql';
import setGrade from './set-grade';
import setSessionGrade from './set-session-grade';
import updateSession from './update-session';

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    setGrade,
    setSessionGrade,
    updateSession,
  },
});
