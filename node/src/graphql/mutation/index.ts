import { GraphQLObjectType } from 'graphql';
import setGrade from './set-grade';

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    setGrade,
  },
});
