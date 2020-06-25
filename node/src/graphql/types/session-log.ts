import { GraphQLString, GraphQLObjectType, GraphQLList } from 'graphql';
import AnswerType from './answer';

export const SessionLogType = new GraphQLObjectType({
  name: 'SessionLog',
  fields: {
    username: { type: GraphQLString },
    answers: { type: GraphQLList(AnswerType) },
  },
});

export default SessionLogType;
