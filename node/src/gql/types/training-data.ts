import { GraphQLString, GraphQLObjectType } from 'graphql';

export const TrainingDataType = new GraphQLObjectType({
  name: 'TrainingData',
  fields: {
    config: { type: GraphQLString },
    training: { type: GraphQLString },
  },
});

export default TrainingDataType;
