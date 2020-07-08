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
  },
});

export default UserSessionType;
