import {
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLFloat,
} from 'graphql';
import DateType from './date';
import QuestionType from './question';
import ResponseType from './response';
import LessonType from './lesson';
import { Lesson } from 'models';

export const UserSessionType = new GraphQLObjectType({
  name: 'UserSession',
  fields: {
    id: { type: GraphQLID },
    sessionId: { type: GraphQLString },
    username: { type: GraphQLString },
    score: { type: GraphQLFloat },
    question: { type: QuestionType },
    userResponses: { type: GraphQLList(ResponseType) },
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

export default UserSessionType;
