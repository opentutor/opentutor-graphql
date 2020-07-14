import { GraphQLString, GraphQLObjectType } from 'graphql';

export const HintType = new GraphQLObjectType({
  name: 'Hint',
  fields: {
    text: { type: GraphQLString },
  },
});

export default HintType;
