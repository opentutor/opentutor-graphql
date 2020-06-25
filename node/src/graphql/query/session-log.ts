import SessionLogType from '../types/session-log';

export const sessionLog = {
  type: SessionLogType,
  resolve: async (root: any) => {
    return {
      username: 'username1',
      answers: [
        {
          answer: 'answer1',
        },
        {
          answer: 'answer2',
        },
      ],
    };
  },
};

export default sessionLog;
