/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

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

export interface PaginatedResolveResult {
  items: any[];
  hasMore: boolean;
}

export interface HasPaginationArgs {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortDescending?: boolean;
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
      sortBy: {
        description: `field to sort by`,
        type: GraphQLString,
      },
      sortDescending: {
        description: `sort in descending order`,
        type: GraphQLBoolean,
      },
      ...(additionalConnectionArgs || {}),
    },
    resolve: async (
      parent: any,
      args: { cursor?: string; limit?: number; sort?: string }
    ) => {
      const paginateResult = await resolve({ parent, args });
      return {
        edges: paginateResult.items.map((m: any) => {
          return {
            node: m,
            cursor: m.id,
          };
        }),
        pageInfo: {
          hasNextPage: paginateResult.hasMore,
          endCursor:
            Array.isArray(paginateResult.items) &&
            paginateResult.items.length > 0
              ? paginateResult.items[paginateResult.items.length - 1].id
              : null,
        },
      };
    },
  };
}

export default makeConnection;
