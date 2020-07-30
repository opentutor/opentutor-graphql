import { GraphQLObjectType } from 'graphql';
import { makeConnection, PaginatedResolveArgs } from 'gql/types/connection';
import { HasPaginate } from 'gql/types/mongoose-type-helpers';

export function findAll(config: {
  nodeType: GraphQLObjectType;
  model: HasPaginate;
}) {
  const { nodeType, model } = config;

  return makeConnection({
    nodeType,
    resolve: async (resolveArgs: PaginatedResolveArgs) => {
      const { parent, args } = resolveArgs;
      console.log(`paginate page=${args.page} l`);
      return await model.paginate(
        {},
        {
          page: args.page || 1,
          limit: Number(args.limit) || 100,
          sort: args.sort || '',
        }
      );
    },
  });
}

export default findAll;
