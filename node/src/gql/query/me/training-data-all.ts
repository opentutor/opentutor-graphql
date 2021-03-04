/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GraphQLString, GraphQLObjectType } from 'graphql';
import { Lesson as LessonModel, Session } from 'models';
import { User } from 'models/User';
import {TrainingData, TrainingDataType} from 'gql/types/training-data';
import * as YAML from 'yaml';
import { Lesson } from 'models/Lesson';

export const allTrainingData = {
  type: TrainingDataType,
  args: {
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { },
    context: { user: User }
  ): Promise<TrainingData> => {
    
    const trainingData = await Session.getAllTrainingData();
    const config = {
      question: "",
    };

    return {
      config: YAML.stringify(config),
      training: trainingData.csv,
      isTrainable: trainingData.isTrainable,
    };
  },
};

export default allTrainingData;