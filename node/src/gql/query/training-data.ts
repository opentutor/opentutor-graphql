import { GraphQLString } from 'graphql';
import { UserSession } from 'models';
import { UserSession as UserSessionType } from 'models/UserSession';
import { Response } from 'models/Response';
import { ExpectationScore } from 'models/ExpectationScore';

export const trainingData = {
  type: GraphQLString,
  args: {
    sessionId: { type: GraphQLString },
  },
  resolve: async (root: any, args: any) => {
    const userSessions = await UserSession.find({
      args,
    });
    let data = 'exp_num,text,label';

    userSessions.forEach((userSession: UserSessionType) => {
      userSession.userResponses.forEach((response: Response) => {
        for (let i = 0; i < response.expectationScores.length; i++) {
          const score: ExpectationScore = response.expectationScores[i];
          if (score.graderGrade !== null) {
            data += `\n${i}${userSession.question.expectations[i].text}${score.graderGrade}`;
          }
        }
      });
    });

    return data;
  },
};

export default trainingData;
