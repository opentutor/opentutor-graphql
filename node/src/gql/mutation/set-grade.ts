/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GraphQLString, GraphQLInt, GraphQLObjectType } from 'graphql';
import SessionType from 'gql/types/session';
import { Session as SessionModel } from 'models';
import { Session } from 'models/Session';

export const setGrade = {
  type: SessionType,
  args: {
    sessionId: { type: GraphQLString },
    userAnswerIndex: { type: GraphQLInt },
    userExpectationIndex: { type: GraphQLInt },
    grade: { type: GraphQLString },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: {
      sessionId: string;
      userAnswerIndex: number;
      userExpectationIndex: number;
      grade: string;
    }
  ): Promise<Session> => {
    if (!args.sessionId) {
      throw new Error('missing required param sessionId');
    }
    if (args.userAnswerIndex === undefined) {
      throw new Error('missing required param userAnswerIndex');
    }
    if (args.userExpectationIndex === undefined) {
      throw new Error('missing required param userExpectationIndex');
    }
    if (!args.grade) {
      throw new Error('missing required param grade');
    }
    return await SessionModel.setGrade(
      args.sessionId,
      args.userAnswerIndex,
      args.userExpectationIndex,
      args.grade
    );
  },
};

export default setGrade;
