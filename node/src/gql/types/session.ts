import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLID,
} from 'graphql';
import DateType from './date';
import LessonType from './lesson';
import { Lesson } from 'models';

export const SessionType = new GraphQLObjectType({
  name: 'Session',
  fields: {
    id: { type: GraphQLID },
    sessionId: { type: GraphQLString },
    username: { type: GraphQLString },
    classifierGrade: { type: GraphQLFloat },
    grade: { type: GraphQLFloat },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
    lesson: {
      type: LessonType,
      resolve: async function (session) {
        return Lesson.findOne({ lessonId: session.lessonId });
      },
    },
  },
});

export default SessionType;
