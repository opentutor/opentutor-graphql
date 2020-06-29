import { GraphQLString, GraphQLObjectType } from 'graphql';
import QuestionType from './question';

export const UserSessionType = new GraphQLObjectType({
  name: 'UserSession',
  fields: {
    username: { type: GraphQLString },
    question: { type: QuestionType },
  },
});

export default UserSessionType;
