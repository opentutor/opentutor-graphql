import { GraphQLObjectType } from 'graphql';
import { makeConnection, PaginatedResolveArgs } from 'gql/types/connection';
import { HasPaginate } from 'gql/types/mongoose-type-helpers';

export function findAll<T>(config: {
  nodeType: GraphQLObjectType;
  model: HasPaginate<T>;
}) {
  const { nodeType, model } = config;

  return makeConnection({
    nodeType,
    resolve: async (resolveArgs: PaginatedResolveArgs) => {
      const { parent, args } = resolveArgs;
      const sortBy: any = {};
      sortBy[args.sortBy ? `${args.sortBy}` : '_id'] = args.sortDescending
        ? -1
        : 1;
      return await model.paginate(
        {},
        {
          sort: sortBy,
          limit: Number(args.limit) || 100,
          startingAfter: args.cursor,
        }
      );
    },
  });
}

export default findAll;
