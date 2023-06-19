/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { LessonExpectationType } from 'gql/types/lesson';
import { Lesson as LessonModel } from 'models';
import { LessonExpectation } from 'models/Lesson';
import { User, UserRole } from 'models/User';

interface OfflineVideoData {
  uri: string;
  startTime: number;
  endTime: number;
}

interface OfflineLessonData {
  id: string;
  lessonId: string;
  name: string;
  intro: string;
  question: string;
  expectations: LessonExpectation[];
  conclusion: string[];
  dialogCategory: string;
  learningFormat?: string;
  image?: string;
  video?: OfflineVideoData;
}

const OfflineVideoDataType = new GraphQLObjectType({
  name: 'OfflineVideoData',
  fields: {
    uri: { type: GraphQLString },
    startTime: { type: GraphQLInt },
    endTime: { type: GraphQLInt },
  },
});

const OfflineLessonDataType = new GraphQLObjectType({
  name: 'OfflineLessonData',
  fields: {
    id: { type: GraphQLString },
    lessonId: { type: GraphQLString },
    name: { type: GraphQLString },
    intro: { type: GraphQLString },
    question: { type: GraphQLString },
    expectations: { type: GraphQLList(LessonExpectationType) },
    conclusion: { type: GraphQLList(GraphQLString) },
    dialogCategory: { type: GraphQLString },
    learningFormat: { type: GraphQLString },
    image: { type: GraphQLString },
    video: { type: OfflineVideoDataType },
  },
});

export const offlineLessonData = {
  type: OfflineLessonDataType,
  args: {
    lessonId: { type: GraphQLString },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { lessonId: string },
    context: { user: User }
  ): Promise<OfflineLessonData> => {
    if (!args.lessonId) {
      throw new Error('missing required param lessonId');
    }
    if (context.user?.userRole !== UserRole.ADMIN) {
      throw new Error(
        'user does not have permission to get offline data for this lesson'
      );
    }
    const lesson = await LessonModel.findOne({
      lessonId: args.lessonId,
    });
    if (!lesson) {
      throw new Error(`lesson not found for lessonId '${args.lessonId}'`);
    }
    const data: OfflineLessonData = {
      id: lesson.lessonId,
      lessonId: lesson.lessonId,
      name: lesson.name,
      intro: lesson.intro,
      question: lesson.question,
      expectations: lesson.expectations,
      conclusion: lesson.conclusion,
      dialogCategory: lesson.dialogCategory,
      learningFormat: lesson.learningFormat,
    };
    const media = lesson.media;
    if (media?.type === 'video') {
      data['video'] = {
        uri: media.url,
        startTime: Number(
          media.props.find((p) => p.name === 'start')?.value || 0
        ),
        endTime: Number(
          media.props.find((p) => p.name === 'end')?.value || 100000000
        ),
      };
    }
    if (media?.type === 'image') {
      data['image'] = media.url;
    }
    return data;
  },
};

export default offlineLessonData;
