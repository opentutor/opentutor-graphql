import { GraphQLObjectType } from 'graphql';
import {
  makeConnection,
  cursorToId,
  PaginatedResolveArgs,
} from 'gql/types/connection';
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
      return await model.paginate(
        {},
        {
          sort: { _id: 1 },
          limit: Number(args.limit) || 100,
          startingAfter: args.cursor ? cursorToId(args.cursor) : undefined,
        }
      );
    },
  });
}

export default findAll;
