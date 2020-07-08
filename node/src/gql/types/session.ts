import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLID,
} from 'graphql';
import DateType from './date';

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
  },
});

export default SessionType;
