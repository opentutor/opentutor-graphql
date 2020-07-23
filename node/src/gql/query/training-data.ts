import { GraphQLString } from 'graphql';
import { UserSession } from 'models';
import { UserSession as UserSessionType } from 'models/UserSession';
import { Response } from 'models/Response';
import { ExpectationScore } from 'models/ExpectationScore';

export const lessonTrainingData = {
  type: GraphQLString,
  args: {
    lessonId: { type: GraphQLString },
  },
  resolve: async (root: any, args: any) => {
    const userSessions = await UserSession.find({
      lessonId: args.lessonId,
    });
    let data = 'exp_num,text,label';

    userSessions.forEach((userSession: UserSessionType) => {
      userSession.userResponses.forEach((response: Response) => {
        for (let i = 0; i < response.expectationScores.length; i++) {
          const score: ExpectationScore = response.expectationScores[i];
          if (score.graderGrade) {
            data += `\n${i},${response.text},${score.graderGrade}`;
          }
        }
      });
    });

    return data;
  },
};

export default lessonTrainingData;
