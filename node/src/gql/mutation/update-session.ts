/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GraphQLString } from 'graphql';
import UserSessionType from 'gql/types/user-session';
import { UserSession } from 'models';
import calculateScore from 'models/utils/calculate-score';

export const updateSession = {
  type: UserSessionType,
  args: {
    sessionId: { type: GraphQLString },
    userSession: { type: GraphQLString },
  },
  resolve: async (root: any, args: any) => {
    if (args.sessionId === undefined) {
      throw new Error('missing required param sessionId');
    }
    if (args.userSession === undefined) {
      throw new Error('missing required param userSession');
    }
    const userSession = JSON.parse(decodeURI(args.userSession));
    if (!userSession.sessionId) {
      throw new Error('userSession is missing a sessionId');
    }
    if (!userSession.lessonId) {
      throw new Error('userSession is missing a lessonId');
    }

    const grade = calculateScore(userSession, 'graderGrade');
    const classifierGrade = calculateScore(userSession, 'classifierGrade');

    return await UserSession.findOneAndUpdate(
      {
        sessionId: args.sessionId,
      },
      {
        $set: {
          ...userSession,
          graderGrade: grade,
          classifierGrade: classifierGrade,
        },
      },
      {
        new: true, // return the updated doc rather than pre update
        upsert: true, // insert if no user session found
      }
    );
  },
};

export default updateSession;
