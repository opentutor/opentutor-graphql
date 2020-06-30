import { GraphQLString, GraphQLObjectType } from 'graphql';

export const ExpectationScoreType = new GraphQLObjectType({
  name: 'ExpectationScore',
  fields: {
    classifierGrade: { type: GraphQLString },
    graderGrade: { type: GraphQLString },
  },
});

export default ExpectationScoreType;
