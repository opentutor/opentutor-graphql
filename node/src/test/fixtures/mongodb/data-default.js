import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

module.exports = {
  usersessions: [
    {
      sessionId: 'session 1',
      username: 'username1',
      question: {
        text: 'question?',
        expectations: [
          { text: 'expected text 1' },
          { text: 'expected text 2' },
        ],
      },
      userResponses: [
        {
          text: 'answer1',
          expectationScores: [
            {
              classifierGrade: 'Good',
              graderGrade: '',
            },
          ],
        },
        {
          text: 'answer2',
          expectationScores: [
            {
              classifierGrade: 'Bad',
              graderGrade: '',
            },
          ],
        },
      ],
    },
  ],

  sessions: [
    {
      _id: ObjectId('5efb89c4fe3314f9a0c11eed'),
      sessionId: 'session 1',
      username: 'username1',
      classifierGrade: 1.0,
      grade: 1.0,
    },
    {
      _id: ObjectId('5efb89c4fe3314f9a0c11eee'),
      sessionId: 'session 2',
      classifierGrade: 0.5,
      grade: 0.5,
    },
  ],
};
