module.exports = {
  usersessions: [
    {
      sessionId: 'session1',
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
          expectationScore: {
            classifierGrade: 'Good',
            graderGrade: '',
          },
        },
        {
          text: 'answer2',
          expectationScore: {
            classifierGrade: 'Bad',
            graderGrade: '',
          },
        },
      ],
    },
  ],
};
