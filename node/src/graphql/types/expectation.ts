import { GraphQLString, GraphQLObjectType } from 'graphql';

export const ExpectationType = new GraphQLObjectType({
  name: 'Expectation',
  fields: {
    text: { type: GraphQLString },
  },
});

export default ExpectationType;
