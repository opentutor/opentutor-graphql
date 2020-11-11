/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GraphQLObjectType, GraphQLID, GraphQLScalarType } from 'graphql';
import { Types } from 'mongoose';
import { HasFindOne } from 'gql/types/mongoose-type-helpers';

export interface ArgsConfig {
  [name: string]: {
    description: string;
    type: GraphQLScalarType | GraphQLObjectType;
  };
}

function toObjectIdOrThrow(id: string, argName: string): Types.ObjectId {
  try {
    return Types.ObjectId(`${id}`);
  } catch (err) {
    throw new Error(`failed to parse arg '${argName}': ${err.message}`);
  }
}

export function findOne<T>(config: {
  type: GraphQLObjectType;
  model: HasFindOne<T>;
  typeName: string;
  argsConfig?: ArgsConfig;
  disableAutoIdArg?: boolean;
  disableExceptionOnNotFound?: boolean;
}): any {
  const {
    argsConfig,
    disableAutoIdArg,
    disableExceptionOnNotFound,
    model,
    type,
    typeName,
  } = config;
  const argsConfEffective: any = {
    ...(disableAutoIdArg
      ? {}
      : {
          id: {
            description: `id of the ${typeName}`,
            type: GraphQLID,
          },
        }),
    ...(argsConfig || {}),
  };
  return {
    type,
    args: argsConfEffective,
    resolve: async (parent: any, args: any): Promise<T> => {
      const mArgs = Object.getOwnPropertyNames(args).reduce(
        (acc: any, cur: string) => {
          if (cur === 'id') {
            acc._id = toObjectIdOrThrow(args[cur], cur);
          } else {
            acc[cur] =
              argsConfEffective[cur] &&
              argsConfEffective[cur].type === GraphQLID
                ? toObjectIdOrThrow(args[cur], cur)
                : args[cur];
          }
          return acc;
        },
        {}
      );
      const filter = Object.assign({}, mArgs, {
        $or: [{ deleted: false }, { deleted: null }],
      });
      const item = await model.findOne(filter).exec();
      if (!item && !disableExceptionOnNotFound) {
        throw new Error(
          `${typeName} not found for args "${JSON.stringify(args)}"`
        );
      }
      return item;
    },
  };
}

export default findOne;
