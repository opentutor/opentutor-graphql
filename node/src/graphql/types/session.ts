import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLID,
} from 'graphql';

export const SessionType = new GraphQLObjectType({
  name: 'Session',
  fields: {
    id: { type: GraphQLID },
    sessionId: { type: GraphQLString },
    classifierGrade: { type: GraphQLFloat },
    grade: { type: GraphQLFloat },
  },
});

export default SessionType;
