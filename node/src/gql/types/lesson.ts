/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLBoolean,
} from 'graphql';
import { Session } from 'models';
import DateType from './date';

const HintType = new GraphQLObjectType({
  name: 'Hint',
  fields: {
    text: { type: GraphQLString },
  },
});

const LessonExpectationType = new GraphQLObjectType({
  name: 'LessonExpectation',
  fields: {
    expectation: { type: GraphQLString },
    additionalFeatures: {
      type: GraphQLString,
      resolve: async function (exp) {
        return JSON.stringify(exp.additionalFeatures);
      },
    },
    hints: { type: GraphQLList(HintType) },
  },
});

export const LessonType = new GraphQLObjectType({
  name: 'Lesson',
  fields: {
    deleted: { type: GraphQLBoolean },
    id: { type: GraphQLID },
    lessonId: { type: GraphQLString },
    createdBy: { type: GraphQLString },
    name: { type: GraphQLString },
    intro: { type: GraphQLString },
    question: { type: GraphQLString },
    image: { type: GraphQLString },
    expectations: { type: GraphQLList(LessonExpectationType) },
    conclusion: { type: GraphQLList(GraphQLString) },
    lastTrainedAt: { type: DateType },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
    trainingConfig: { type: GraphQLString },
    additionalFeatures: {
      type: GraphQLString,
      resolve: async function (lesson) {
        return JSON.stringify(lesson.additionalFeatures);
      },
    },
    isTrainable: {
      type: GraphQLBoolean,
      resolve: async function (lesson) {
        const trainingData = await Session.getTrainingData(lesson.lessonId);
        return trainingData.isTrainable;
      },
    },
  },
});

export default LessonType;
