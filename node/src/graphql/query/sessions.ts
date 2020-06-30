import Session from '../../models/Session';
import SessionType from '../types/session';
import findAll from './find-all';

export const sessions = findAll({
  nodeType: SessionType,
  model: Session,
});

export default sessions;
