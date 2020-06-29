import { GraphQLString, GraphQLObjectType } from 'graphql';

export const QuestionType = new GraphQLObjectType({
  name: 'Question',
  fields: {
    text: { type: GraphQLString },
  },
});

export default QuestionType;
