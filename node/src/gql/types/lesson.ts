import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
} from 'graphql';
import DateType from './date';
import LessonExpectationType from './lesson-expectation';

export const LessonType = new GraphQLObjectType({
  name: 'Lesson',
  fields: {
    id: { type: GraphQLID },
    lessonId: { type: GraphQLString },
    name: { type: GraphQLString },
    intro: { type: GraphQLString },
    question: { type: GraphQLString },
    expectations: { type: GraphQLList(LessonExpectationType) },
    conclusion: { type: GraphQLString },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
  },
});

export default LessonType;
