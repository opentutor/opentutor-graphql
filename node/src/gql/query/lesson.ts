import { GraphQLString } from 'graphql';
import { Lesson } from 'models';
import findOne from './find-one';
import LessonType from 'gql/types/lesson';

export const lesson = findOne({
  model: Lesson,
  type: LessonType,
  typeName: 'lesson',
  argsConfig: {
    lessonId: {
      description: 'id of the lesson',
      type: GraphQLString,
    },
  },
});

export default lesson;
