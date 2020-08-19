/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GraphQLString, GraphQLObjectType } from 'graphql';
import SessionType from 'gql/types/session';
import { Session as SessionSchema } from 'models';
import { Session } from 'models/Session';
import calculateScore from 'models/utils/calculate-score';

export const updateSession = {
  type: SessionType,
  args: {
    sessionId: { type: GraphQLString },
    session: { type: GraphQLString },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { sessionId: string; session: string }
  ): Promise<Session> => {
    if (!args.sessionId) {
      throw new Error('missing required param sessionId');
    }
    if (!args.session) {
      throw new Error('missing required param session');
    }
    const session = JSON.parse(decodeURI(args.session));
    if (!session.sessionId) {
      throw new Error('session is missing a sessionId');
    }
    if (!session.lessonId) {
      throw new Error('session is missing a lessonId');
    }

    const grade = calculateScore(session, 'graderGrade');
    const classifierGrade = calculateScore(session, 'classifierGrade');

    return await SessionSchema.findOneAndUpdate(
      {
        sessionId: args.sessionId,
      },
      {
        $set: {
          ...session,
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
