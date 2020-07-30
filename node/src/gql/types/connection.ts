import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const TYPE_REGISTRY: { [type: string]: GraphQLObjectType } = {};
export function registerType(type: GraphQLObjectType) {
  TYPE_REGISTRY[type.name] = type;
  return type;
}

export const PageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    hasPrevPage: { type: GraphQLBoolean },
    hasNextPage: { type: GraphQLBoolean },
    page: { type: GraphQLInt },
    limit: { type: GraphQLInt },
  },
});

export function makeConnectionType(nodeType: GraphQLObjectType) {
  const name = `${nodeType.name}Connection`;
  if (TYPE_REGISTRY[name]) {
    return TYPE_REGISTRY[name];
  }
  return registerType(
    new GraphQLObjectType({
      name,
      fields: {
        items: { type: new GraphQLList(nodeType) },
        pageInfo: { type: PageInfoType },
      },
    })
  );
}

export interface PaginatedResolveResult {
  docs: any[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  nextPage: number;
  hasPrevPage: boolean;
  prevPage: number;
  pagingCounter: number;
}

export interface HasPaginationArgs {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginatedResolveArgs {
  parent: any;
  args: HasPaginationArgs;
}

export interface PaginatedResolveFunction {
  (args: PaginatedResolveArgs): Promise<PaginatedResolveResult>;
}

export interface MakeConnectionArgs {
  nodeType: GraphQLObjectType;
  resolve: PaginatedResolveFunction;
}

export function makeConnection(args: MakeConnectionArgs) {
  const { nodeType, resolve } = args;
  return {
    type: makeConnectionType(nodeType),
    args: {
      page: {
        description: `page number`,
        type: GraphQLInt,
      },
      limit: {
        description: `max items to return`,
        type: GraphQLInt,
      },
      sort: {
        description: `field and order to sort by`,
        type: GraphQLString,
      },
    },
    resolve: async (
      parent: any,
      args: {
        page?: number;
        limit?: number;
        sort?: string;
      }
    ) => {
      const paginateResult = await resolve({ parent, args });
      return {
        items: paginateResult.docs,
        pageInfo: {
          hasPrevPage: paginateResult.hasPrevPage,
          hasNextPage: paginateResult.hasNextPage,
          page: paginateResult.page,
          limit: paginateResult.limit,
        },
      };
    },
  };
}

export default makeConnection;
