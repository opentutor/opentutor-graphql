import { GraphQLString, GraphQLObjectType } from 'graphql';

export const AnswerType = new GraphQLObjectType({
  name: 'Answer',
  fields: {
    answer: { type: GraphQLString },
  },
});

export default AnswerType;
