/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import bcrypt from 'bcrypt';
import { GraphQLString, GraphQLObjectType } from 'graphql';
import { User as UserSchema } from 'models';
import {
  UserAccessTokenType,
  UserAccessToken,
  generateAccessToken,
} from 'gql/types/user-access-token';

const BCRYPT_SALT_ROUNDS = 12;

export const signup = {
  type: UserAccessTokenType,
  args: {
    email: { type: GraphQLString },
    name: { type: GraphQLString },
    password: { type: GraphQLString },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { email: string; name: string; password: string }
  ): Promise<UserAccessToken> => {
    if (!args.email) {
      throw new Error('missing required param email');
    }
    if (!args.name) {
      throw new Error('missing required param name');
    }
    if (!args.password) {
      throw new Error('missing required param password');
    }
    const user = await UserSchema.findOne({ email: args.email });
    if (user) {
      throw new Error('user already exists');
    }
    return new Promise<UserAccessToken>((resolve, reject) => {
      bcrypt
        .hash(args.password, BCRYPT_SALT_ROUNDS)
        .then((hashedPassword: string) => {
          UserSchema.findOneAndUpdate(
            {
              email: args.email,
            },
            {
              $set: {
                email: args.email,
                name: args.name,
                password: hashedPassword,
                lastLoginAt: new Date(),
              },
            },
            {
              new: true,
              upsert: true,
            }
          )
            .then((user) => {
              const token = generateAccessToken(user);
              resolve(token);
            })
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  },
};

export default signup;
