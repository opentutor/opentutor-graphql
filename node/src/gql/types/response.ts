import { GraphQLString, GraphQLObjectType, GraphQLList } from 'graphql';
import ExpectationScoreType from './expectation-score';

export const ResponseType = new GraphQLObjectType({
  name: 'Response',
  fields: {
    text: { type: GraphQLString },
    expectationScores: { type: GraphQLList(ExpectationScoreType) },
  },
});

export default ResponseType;
