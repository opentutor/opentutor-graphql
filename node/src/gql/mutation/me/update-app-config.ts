/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import SettingModel, { AppConfig } from '../../../models/Setting';
import { User, UserRole } from '../../../models/User';
import { AppConfigType } from '../../types/appConfig';

export interface AppConfigUpdateInput {
  logoIcon: string;
  logoLargeIcon: string;
  featuredLessons: string[];
}

export const AppConfigUpdateInputType = new GraphQLInputObjectType({
  name: 'AppConfigUpdateInputType',
  fields: () => ({
    logoIcon: { type: GraphQLString },
    logoLargeIcon: { type: GraphQLString },
    featuredLessons: { type: GraphQLList(GraphQLString) },
  }),
});

export const updateAppConfig = {
  type: AppConfigType,
  args: {
    appConfig: { type: GraphQLNonNull(AppConfigUpdateInputType) },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { appConfig: AppConfigUpdateInput },
    context: { user: User }
  ): Promise<AppConfig> => {
    if (!context.user || context.user.userRole !== UserRole.ADMIN) {
      throw new Error('you do not have permission to edit appConfig');
    }
    await SettingModel.saveConfig(args.appConfig);
    return await SettingModel.getConfig();
  },
};

export default updateAppConfig;
