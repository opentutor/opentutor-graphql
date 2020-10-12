/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GraphQLString, GraphQLObjectType } from 'graphql';
import { Lesson, Session } from 'models';
import TrainingDataType from 'gql/types/training-data';
import * as YAML from 'yaml';

export interface TrainingData {
  config: string;
  training: string;
  isTrainable: boolean;
}

export const trainingData = {
  type: TrainingDataType,
  args: {
    lessonId: { type: GraphQLString },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { lessonId: string }
  ): Promise<TrainingData> => {
    if (!args.lessonId) {
      throw new Error('missing required param lessonId');
    }
    const trainingData = await Session.getTrainingData(args.lessonId);
    const lesson = await Lesson.findOne({ lessonId: args.lessonId });
    const config = {
      ...lesson.additionalFeatures,
      expectations: lesson.expectations.map((exp) => {
        return { ideal: exp.expectation, ...exp.additionalFeatures };
      }),
      question: lesson.question,
    };

    return {
      config: YAML.stringify(config),
      training: trainingData.csv,
      isTrainable: trainingData.isTrainable,
    };
  },
};

export default trainingData;
