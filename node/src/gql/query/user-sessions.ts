import { UserSession } from 'models';
import UserSessionType from 'gql/types/user-session';
import findAll from './find-all';

export const userSessions = findAll({
  nodeType: UserSessionType,
  model: UserSession,
});

export default userSessions;
