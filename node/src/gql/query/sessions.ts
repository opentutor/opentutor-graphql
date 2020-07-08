import { Session } from 'models';
import SessionType from 'gql/types/session';
import findAll from './find-all';

export const sessions = findAll({
  nodeType: SessionType,
  model: Session,
});

export default sessions;
