import { GraphQLObjectType } from 'graphql';
import setGrade from './set-grade';
import setSessionGrade from './set-session-grade';

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    setGrade,
    setSessionGrade,
  },
});
