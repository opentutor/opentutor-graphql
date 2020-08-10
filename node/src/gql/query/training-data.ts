/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GraphQLString } from 'graphql';
import { Session, Lesson } from 'models';
import { Session as SessionType } from 'models/Session';
import { Response } from 'models/Response';
import { ExpectationScore } from 'models/ExpectationScore';
import TrainingDataType from 'gql/types/training-data';

export const trainingData = {
  type: TrainingDataType,
  args: {
    lessonId: { type: GraphQLString },
  },
  resolve: async (root: any, args: any) => {
    const sessions = await Session.find({
      lessonId: args.lessonId,
    });
    let training = 'exp_num,text,label';
    sessions.forEach((session: SessionType) => {
      session.userResponses.forEach((response: Response) => {
        for (let i = 0; i < response.expectationScores.length; i++) {
          const score: ExpectationScore = response.expectationScores[i];
          if (score.graderGrade) {
            training += `\n${i},${response.text},${score.graderGrade}`;
          }
        }
      });
    });
    const lesson = await Lesson.findOne({ lessonId: args.lessonId });
    const config = `question: "${lesson.question}"`;
    return { config: config, training: training };
  },
};

export default trainingData;
