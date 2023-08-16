/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import { Session as SessionModel } from 'models';
import { Session } from 'models/Session';
import SessionType from 'gql/types/session';

interface InvalidateResponse {
  sessionId: string;
  responseIds: string[];
}

const InvalidateResponseInputType = new GraphQLInputObjectType({
  name: 'InvalidateResponseInputType',
  fields: () => ({
    sessionId: { type: GraphQLNonNull(GraphQLString) },
    responseIds: { type: GraphQLNonNull(GraphQLList(GraphQLID)) },
  }),
});

export const userResponsesBatchInvalidate = {
  type: GraphQLList(SessionType),
  args: {
    expectation: { type: GraphQLNonNull(GraphQLString) },
    invalid: { type: GraphQLNonNull(GraphQLBoolean) },
    invalidateResponses: {
      type: GraphQLList(GraphQLNonNull(InvalidateResponseInputType)),
    },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: {
      expectation: string;
      invalid: boolean;
      invalidateResponses: InvalidateResponse[];
    }
  ): Promise<Session[]> => {
    const updatedSessions: Session[] = [];
    for (const invalidateResponses of args.invalidateResponses) {
      const session = await SessionModel.invalidateResponses(
        invalidateResponses.sessionId,
        invalidateResponses.responseIds,
        args.expectation,
        args.invalid
      );
      updatedSessions.push(session);
    }
    return updatedSessions;
  },
};

export default userResponsesBatchInvalidate;
