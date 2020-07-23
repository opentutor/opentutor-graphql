import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

module.exports = {
  lessons: [
    {
      _id: ObjectId('5f0cfea3395d762ca65405c3'),
      lessonId: 'lesson1',
      name: 'lesson name',
      intro: 'intro text',
      question: 'question?',
      expectations: [
        {
          expectation: 'expected text 1',
          hints: [
            {
              text: 'expectation 1 hint 1',
            },
            {
              text: 'expectation 1 hint 2',
            },
          ],
        },
        {
          expectation: 'expected text 2',
          hints: [
            {
              text: 'expectation 2 hint 1',
            },
            {
              text: 'expectation 2 hint 2',
            },
          ],
        },
      ],
      conclusion: ['conclusion text'],
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405c4'),
      lessonId: 'lesson2',
      name: 'name',
      intro: 'intro',
      question: 'question',
      expectations: [
        {
          expectation: 'answer1',
          hints: [
            {
              text: 'expectation 1 hint 1',
            },
          ],
        },
      ],
      conclusion: ['conclusion'],
    },
  ],

  sessions: [
    {
      _id: ObjectId('5efb89c4fe3314f9a0c11eed'),
      sessionId: 'session 1',
      lessonId: 'lesson1',
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
    {
      _id: ObjectId('5f18ee7b48f66567eacc8826'),
      sessionId: 'session 3',
      lessonId: 'lesson1',
    },
    {
      _id: ObjectId('5f18ee7b48f66567eacc8827'),
      sessionId: 'session 4',
      lessonId: 'lesson1',
    },
    {
      _id: ObjectId('5f18ee7b48f66567eacc8828'),
      sessionId: 'session 5',
      lessonId: 'lesson1',
    },
  ],

  usersessions: [
    {
      sessionId: 'session 1',
      lessonId: 'lesson1',
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
    {
      sessionId: 'session 2',
      username: 'username2',
      question: {
        text: 'question',
        expectations: [{ text: 'expectation text' }],
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
      ],
    },
    {
      lessonId: 'lesson1',
      sessionId: 'session 3',
      userResponses: [
        {
          text: 'a good answer',
          expectationScores: [
            {
              classifierGrade: 'Good',
              graderGrade: 'Good',
            },
          ],
        },
      ],
    },
    {
      lessonId: 'lesson1',
      sessionId: 'session 4',
      userResponses: [
        {
          text: 'a bad answer',
          expectationScores: [
            {
              classifierGrade: 'Bad',
              graderGrade: 'Bad',
            },
          ],
        },
      ],
    },
    {
      lessonId: 'lesson1',
      sessionId: 'session 5',
      userResponses: [
        {
          text: 'a neutral answer',
          expectationScores: [
            {
              classifierGrade: 'Neutral',
              graderGrade: 'Neutral',
            },
          ],
        },
      ],
    },
  ],
};
