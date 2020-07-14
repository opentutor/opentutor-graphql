import { Lesson } from 'models';
import findAll from './find-all';
import LessonType from 'gql/types/lesson';

export const lessons = findAll({
  nodeType: LessonType,
  model: Lesson,
});

export default lessons;
