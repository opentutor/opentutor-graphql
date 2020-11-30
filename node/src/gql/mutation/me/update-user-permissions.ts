/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GraphQLString, GraphQLObjectType } from 'graphql';
import UserType from 'gql/types/user';
import { User as UserSchema } from 'models';
import { User } from 'models/User';

export const updateUserPermissions = {
  type: UserType,
  args: {
    userId: { type: GraphQLString },
    permissionLevel: { type: GraphQLString },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { userId: string; permissionLevel: string },
    context: { user: User }
  ): Promise<User> => {
    if (!args.userId) {
      throw new Error('missing required param userId');
    }
    if (!args.permissionLevel) {
      throw new Error('missing required param permissionLevel');
    }
    if (
      args.permissionLevel !== 'admin' &&
      args.permissionLevel !== 'contentManager' &&
      args.permissionLevel !== 'author'
    ) {
      throw new Error(
        'permissionLevel must be "admin", "contentManager", or "author"'
      );
    }
    if (!context.user.isAdmin && !context.user.isContentManager) {
      throw new Error(
        'must be an admin or content manager to edit user permissions'
      );
    }
    if (args.permissionLevel === 'admin' && !context.user.isAdmin) {
      throw new Error('only admins can give admin permissions');
    }

    const user = await UserSchema.findOne({ _id: args.userId });
    if (!user) {
      throw new Error(`could not find user for id ${args.userId}`);
    }
    if (user.isAdmin && !context.user.isAdmin) {
      throw new Error('only admins can edit an admins permissions');
    }

    return await UserSchema.findOneAndUpdate(
      {
        _id: args.userId,
      },
      {
        $set: {
          isAdmin: args.permissionLevel === 'admin',
          isContentManager: args.permissionLevel === 'contentManager',
        },
      },
      {
        new: true,
      }
    );
  },
};

export default updateUserPermissions;
