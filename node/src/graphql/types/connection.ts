import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { Document } from 'mongoose';

export const PageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    endCursor: { type: GraphQLString },
    hasNextPage: { type: GraphQLBoolean },
  },
});

const TYPE_REGISTRY: { [type: string]: GraphQLObjectType } = {};
export function registerType(type: GraphQLObjectType) {
  TYPE_REGISTRY[type.name] = type;
  return type;
}

export function makeEdgeType(nodeType: GraphQLObjectType) {
  const name = `${nodeType.name}Edge`;
  if (TYPE_REGISTRY[name]) {
    return TYPE_REGISTRY[name];
  }

  return registerType(
    new GraphQLObjectType({
      name,
      fields: {
        node: { type: nodeType },
        cursor: { type: GraphQLString },
      },
    })
  );
}

export function makeConnectionType(nodeType: GraphQLObjectType) {
  const name = `${nodeType.name}Connection`;
  if (TYPE_REGISTRY[name]) {
    return TYPE_REGISTRY[name];
  }

  return registerType(
    new GraphQLObjectType({
      name,
      fields: {
        edges: { type: new GraphQLList(makeEdgeType(nodeType)) },
        pageInfo: { type: PageInfoType },
      },
    })
  );
}

export function itemToCursor(item: Document): string | null {
  return item ? Buffer.from(`${item.id}`).toString('base64') : null;
}

export function cursorToId(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString('ascii');
}

export interface PaginatedResolveResult {
  items: any[];
  hasMore: boolean;
}

export interface HasPaginationArgs {
  cursor?: string;
  limit?: number;
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
  additionalConnectionArgs?: any;
}

export function makeConnection(args: MakeConnectionArgs) {
  const { additionalConnectionArgs, nodeType, resolve } = args;
  return {
    type: makeConnectionType(nodeType),
    args: {
      cursor: {
        description: `start after this item`,
        type: GraphQLString,
      },
      limit: {
        description: `max items to return`,
        type: GraphQLInt,
      },
      ...(additionalConnectionArgs || {}),
    },
    resolve: async (parent: any, args: { cursor?: string; limit?: number }) => {
      const paginateResult = await resolve({ parent, args });
      return {
        edges: paginateResult.items.map((m: any) => {
          return {
            node: m,
            cursor: itemToCursor(m),
          };
        }),
        pageInfo: {
          hasNextPage: paginateResult.hasMore,
          endCursor:
            Array.isArray(paginateResult.items) &&
            paginateResult.items.length > 0
              ? itemToCursor(
                  paginateResult.items[paginateResult.items.length - 1]
                )
              : null,
        },
      };
    },
  };
}

export default makeConnection;
