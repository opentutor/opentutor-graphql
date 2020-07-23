import { GraphQLObjectType } from 'graphql';
import lesson from './lesson';
import lessons from './lessons';
import session from './session';
import sessions from './sessions';
import lessonTrainingData from './training-data';
import userSession from './user-session';

export default new GraphQLObjectType({
  name: 'Query',
  fields: {
    lesson,
    lessons,
    lessonTrainingData,
    session,
    sessions,
    userSession,
  },
});
