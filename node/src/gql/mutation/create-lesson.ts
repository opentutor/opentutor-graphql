import { v4 as uuidv4 } from 'uuid';
import LessonType from 'gql/types/lesson';
import { Lesson } from 'models';

export const createLesson = {
  type: LessonType,
  resolve: async (root: any, args: any) => {
    const lessonId = uuidv4();

    return await Lesson.findOneAndUpdate(
      {
        lessonId: lessonId,
      },
      {
        $set: {
          lessonId: lessonId,
        },
      },
      {
        new: true, // return the updated doc rather than pre update
        upsert: true, // insert if no user lesson found
      }
    );
  },
};

export default createLesson;
