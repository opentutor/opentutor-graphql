import { GraphQLString } from 'graphql';
import { UserSession, Lesson } from 'models';
import { UserSession as UserSessionType } from 'models/UserSession';
import { Response } from 'models/Response';
import { ExpectationScore } from 'models/ExpectationScore';
import TrainingDataType from 'gql/types/training-data';

export const trainingData = {
  type: TrainingDataType,
  args: {
    lessonId: { type: GraphQLString },
  },
  resolve: async (root: any, args: any) => {
    const userSessions = await UserSession.find({
      lessonId: args.lessonId,
    });
    let training = 'exp_num,text,label';
    userSessions.forEach((userSession: UserSessionType) => {
      userSession.userResponses.forEach((response: Response) => {
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
