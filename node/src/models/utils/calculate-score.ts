import { UserSession } from 'models/UserSession';

const calculateScore = (
  userSession: UserSession,
  gradeField = 'graderGrade'
) => {
  let score = 0;
  let expGrades = [];

  for (let i = 0; i < userSession.userResponses.length; i++) {
    const userResponse = userSession.userResponses[i];
    let isGraded = false;
    for (let j = 0; j < userResponse.expectationScores.length; j++) {
      const expectationScore = userResponse.expectationScores[j] as any;
      if (expectationScore[gradeField]) {
        isGraded = true;
        if (!expGrades[j]) {
          expGrades[j] = [];
        }
        expGrades[j].push(expectationScore[gradeField]);
      }
    }
    // each response needs at least one grade
    if (!isGraded) {
      return null;
    }
  }

  expGrades.forEach((expectation: [string]) => {
    let expectationScore = 0;
    expectation.forEach((grade: string) => {
      if (grade === 'Good') {
        expectationScore += 1;
      } else if (grade === 'Neutral') {
        expectationScore += 0.5;
      }
    });
    score += expectationScore / expectation.length;
  });

  return score / expGrades.length;
};

export default calculateScore;
