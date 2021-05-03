/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import LessonType from 'gql/types/lesson';
import { Lesson as LessonModel } from 'models';
import { Lesson } from 'models/Lesson';
import { User } from 'models/User';

export interface UpdateLessonFeatures {
  features: any;
}

export const UpdateLessonFeaturesInputType = new GraphQLInputObjectType({
  name: 'UpdateLessonFeaturesInputType',
  fields: () => ({
    features: { type: GraphQLJSON },
  }),
});

export const updateLessonFeatures = {
  type: LessonType,
  args: {
    lessonId: { type: GraphQLString },
    lesson: { type: GraphQLNonNull(UpdateLessonFeaturesInputType) },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { lessonId: string; lesson: UpdateLessonFeatures },
    context: { user: User }
  ): Promise<Lesson> => {
    if (!args.lessonId) {
      throw new Error('missing required param lessonId');
    }
    if (!args.lesson) {
      throw new Error('missing required param lesson');
    }
    const lessonUpdate = args.lesson;
    const lesson = await LessonModel.findOne({ lessonId: args.lessonId });
    if (!lesson) {
      throw new Error('invalid lesson id');
    }
    if (!LessonModel.userCanEdit(context.user, lesson)) {
      throw new Error('user does not have permission to edit this lesson');
    }
    return await LessonModel.findOneAndUpdate(
      {
        lessonId: args.lessonId,
      },
      {
        $set: lessonUpdate,
      },
      {
        new: true,
      }
    );
  },
};

export default updateLessonFeatures;
