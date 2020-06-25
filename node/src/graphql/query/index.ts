import { GraphQLObjectType } from 'graphql';
import sessionLog from './session-log';

export default new GraphQLObjectType({
  name: 'Query',
  fields: {
    sessionLog,
  },
});
