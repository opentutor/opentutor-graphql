import { GraphQLString, GraphQLObjectType, GraphQLList } from 'graphql';
import HintType from './hint';

export const LessonExpectationType = new GraphQLObjectType({
  name: 'LessonExpectation',
  fields: {
    expectation: { type: GraphQLString },
    hints: { type: GraphQLList(HintType) },
  },
});

export default LessonExpectationType;
