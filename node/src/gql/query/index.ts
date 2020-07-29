import { GraphQLObjectType } from 'graphql';
import lesson from './lesson';
import lessons from './lessons';
import trainingData from './training-data';
import userSession from './user-session';
import userSessions from './user-sessions';

export default new GraphQLObjectType({
  name: 'Query',
  fields: {
    lesson,
    lessons,
    trainingData,
    userSession,
    userSessions,
  },
});
