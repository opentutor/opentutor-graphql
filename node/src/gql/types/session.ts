/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLFloat,
} from 'graphql';
import DateType from './date';
import LessonType from './lesson';
import { Lesson } from 'models';

const ExpectationType = new GraphQLObjectType({
  name: 'Expectation',
  fields: {
    text: { type: GraphQLString },
  },
});

const QuestionType = new GraphQLObjectType({
  name: 'Question',
  fields: {
    text: { type: GraphQLString },
    expectations: { type: GraphQLList(ExpectationType) },
  },
});

const ExpectationScoreType = new GraphQLObjectType({
  name: 'ExpectationScore',
  fields: {
    classifierGrade: { type: GraphQLString },
    graderGrade: { type: GraphQLString },
  },
});

const ResponseType = new GraphQLObjectType({
  name: 'Response',
  fields: {
    text: { type: GraphQLString },
    expectationScores: { type: GraphQLList(ExpectationScoreType) },
  },
});

export const SessionType = new GraphQLObjectType({
  name: 'Session',
  fields: {
    id: { type: GraphQLID },
    sessionId: { type: GraphQLString },
    username: { type: GraphQLString },
    graderGrade: { type: GraphQLFloat },
    classifierGrade: { type: GraphQLFloat },
    question: { type: QuestionType },
    userResponses: { type: GraphQLList(ResponseType) },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
    lessonId: { type: GraphQLString },
    lessonName: { type: GraphQLString },
    lessonCreatedBy: { type: GraphQLString },
    lesson: {
      type: LessonType,
      resolve: async function (session) {
        return Lesson.findOne({ lessonId: session.lessonId });
      },
    },
  },
});

export default SessionType;