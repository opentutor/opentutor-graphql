import { GraphQLString, GraphQLObjectType, GraphQLList } from 'graphql';
import ExpectationType from './expectation';

export const QuestionType = new GraphQLObjectType({
  name: 'Question',
  fields: {
    text: { type: GraphQLString },
    expectations: { type: GraphQLList(ExpectationType) },
  },
});

export default QuestionType;
