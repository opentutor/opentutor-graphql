import { GraphQLObjectType } from 'graphql';
import setGrade from './set-grade';
import updateSession from './update-session';

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    setGrade,
    updateSession,
  },
});
