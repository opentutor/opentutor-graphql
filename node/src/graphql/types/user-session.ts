import { GraphQLList, GraphQLString, GraphQLObjectType } from 'graphql';
import QuestionType from './question';
import ResponseType from './response';

export const UserSessionType = new GraphQLObjectType({
  name: 'UserSession',
  fields: {
    sessionId: { type: GraphQLString },
    username: { type: GraphQLString },
    question: { type: QuestionType },
    userResponses: { type: GraphQLList(ResponseType) },
  },
});

export default UserSessionType;
