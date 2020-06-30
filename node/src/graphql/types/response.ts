import { GraphQLString, GraphQLObjectType } from 'graphql';
import ExpectationScoreType from './expectation-score';

export const ResponseType = new GraphQLObjectType({
  name: 'Response',
  fields: {
    text: { type: GraphQLString },
    expectationScore: { type: ExpectationScoreType },
  },
});

export default ResponseType;
