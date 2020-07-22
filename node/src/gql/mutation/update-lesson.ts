import { GraphQLString } from 'graphql';
import LessonType from 'gql/types/lesson';
import { Lesson } from 'models';

export const updateLesson = {
  type: LessonType,
  args: {
    lessonId: { type: GraphQLString },
    lesson: { type: GraphQLString },
  },
  resolve: async (root: any, args: any) => {
    if (args.lessonId === undefined) {
      throw new Error('missing required param lessonId');
    }
    if (args.lesson === undefined) {
      throw new Error('missing required param lesson');
    }

    const lesson = JSON.parse(decodeURI(args.lesson));
    return await Lesson.findOneAndUpdate(
      {
        lessonId: args.lessonId,
      },
      {
        $set: {
          ...lesson,
        },
      },
      {
        new: true, // return the updated doc rather than pre update
        upsert: true,
      }
    );
  },
};

export default updateLesson;
