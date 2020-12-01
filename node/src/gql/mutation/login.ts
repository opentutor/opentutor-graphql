/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GraphQLString, GraphQLObjectType } from 'graphql';
import { User as UserSchema } from 'models';
import {
  UserAccessTokenType,
  UserAccessToken,
  generateAccessToken,
  decodeAccessToken,
} from 'gql/types/user-access-token';

export const login = {
  type: UserAccessTokenType,
  args: {
    accessToken: { type: GraphQLString },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { accessToken: string }
  ): Promise<UserAccessToken> => {
    if (!args.accessToken) {
      throw new Error('missing required param accessToken');
    }
    try {
      const decoded = decodeAccessToken(args.accessToken);
      const userId = decoded.id;
      const user = await UserSchema.findOneAndUpdate(
        {
          _id: userId,
        },
        {
          $set: {
            lastLoginAt: new Date(),
          },
        },
        {
          new: true,
          upsert: false,
        }
      );
      if (!user) {
        throw new Error('invalid token');
      }
      return generateAccessToken(user);
    } catch (error) {
      throw new Error(error);
    }
  },
};

export default login;
