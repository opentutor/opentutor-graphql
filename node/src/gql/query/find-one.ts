import { GraphQLObjectType, GraphQLID, GraphQLScalarType } from 'graphql';
import { Types } from 'mongoose';
import { HasFindOne } from 'gql/types/mongoose-type-helpers';

export interface ArgsConfig {
  [name: string]: {
    description: string;
    type: GraphQLScalarType | GraphQLObjectType;
  };
}

function toObjectIdOrThrow(id: string, argName: string) {
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
}) {
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
    resolve: async (parent: any, args: any) => {
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
      const item = await model.findOne(mArgs).exec();
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
