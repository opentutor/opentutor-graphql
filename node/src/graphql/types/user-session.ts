import {
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
} from 'graphql';
import QuestionType from './question';
import ResponseType from './response';

export const UserSessionType = new GraphQLObjectType({
  name: 'UserSession',
  fields: {
    id: { type: GraphQLID },
    sessionId: { type: GraphQLString },
    username: { type: GraphQLString },
    question: { type: QuestionType },
    userResponses: { type: GraphQLList(ResponseType) },
  },
});

export default UserSessionType;
