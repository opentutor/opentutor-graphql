/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios from 'axios';
import { GraphQLString, GraphQLObjectType } from 'graphql';
import UserType from 'gql/types/user';
import { User } from 'models/User';
import { User as UserSchema } from 'models';

export const loginGoogle = {
  type: UserType,
  args: {
    accessToken: { type: GraphQLString },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { accessToken: string }
  ): Promise<User> => {
    if (!args.accessToken) {
      throw new Error('missing required param accessToken');
    }
    try {
      const endpoint = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${args.accessToken}`;
      const response = await axios.get(endpoint);
      const user = await UserSchema.findOne({ googleId: response.data.id });
      if (!user) {
        return await UserSchema.findOneAndUpdate(
          {
            googleId: response.data.id,
          },
          {
            $set: {
              googleId: response.data.id,
              name: response.data.name,
              email: response.data.email,
            },
          },
          {
            new: true,
            upsert: true,
          }
        );
      }
      return user;
    } catch (error) {
      throw new Error(error);
    }
  },
};

export default loginGoogle;
