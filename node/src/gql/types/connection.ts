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
import { Document } from 'mongoose';
import base64url from 'base64url';
import objectPath from 'object-path';

export const PageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    startCursor: { type: GraphQLString },
    endCursor: { type: GraphQLString },
    hasPreviousPage: { type: GraphQLBoolean },
    hasNextPage: { type: GraphQLBoolean },
  },
});

const TYPE_REGISTRY: { [type: string]: GraphQLObjectType } = {};
export function registerType(type: GraphQLObjectType): GraphQLObjectType {
  TYPE_REGISTRY[type.name] = type;
  return type;
}

export function makeEdgeType(nodeType: GraphQLObjectType): GraphQLObjectType {
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

export function makeConnectionType(
  nodeType: GraphQLObjectType
): GraphQLObjectType {
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

export function itemToCursor(
  item: Document,
  paginatedField: string
): string | null {
  if (!item) {
    return null;
  }
  if (paginatedField && paginatedField !== '_id') {
    const field = objectPath.get(item, paginatedField);
    return base64url.encode(JSON.stringify([field, item._id]));
  }
  return base64url.encode(`${item._id}`);
}

export function cursorToItem(cursor: string): string {
  return JSON.parse(base64url.decode(cursor));
}

export interface PaginatedResolveResult {
  results: any[];
  previous: string;
  next: string;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface HasPaginationArgs {
  filter?: string;
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortAscending?: boolean;
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

export function makeConnection(args: MakeConnectionArgs): any {
  const { additionalConnectionArgs, nodeType, resolve } = args;
  return {
    type: makeConnectionType(nodeType),
    args: {
      filter: {
        description: `filter query string`,
        type: GraphQLString,
      },
      cursor: {
        description: `value to start querying the page`,
        type: GraphQLString,
      },
      limit: {
        description: `max items to return (default: 100)`,
        type: GraphQLInt,
      },
      sortBy: {
        description: `field to paginate and sort by (default: id)`,
        type: GraphQLString,
      },
      sortAscending: {
        description: `sort in ascending order (default: false)`,
        type: GraphQLBoolean,
      },
      ...(additionalConnectionArgs || {}),
    },
    resolve: async (
      parent: any,
      args: {
        filter?: string;
        cursor?: string;
        limit?: number;
        sortBy?: string;
        sortAscending?: boolean;
      }
    ) => {
      const paginateResult = await resolve({ parent, args });
      return {
        edges: paginateResult.results.map((m: any) => {
          return {
            node: m,
            cursor: itemToCursor(m, args.sortBy),
          };
        }),
        pageInfo: {
          hasNextPage: paginateResult.hasNext,
          hasPreviousPage: paginateResult.hasPrevious,
          startCursor: paginateResult.hasPrevious
            ? paginateResult.previous
            : null,
          endCursor: paginateResult.hasNext ? paginateResult.next : null,
        },
      };
    },
  };
}

export default makeConnection;
