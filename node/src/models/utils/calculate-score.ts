import { UserSession } from 'models/UserSession';

const calculateScore = (
  userSession: UserSession,
  gradeField = 'graderGrade'
) => {
  let score = 0;
  let numExpectations = 0;
  for (let i = 0; i < userSession.userResponses.length; i++) {
    const userResponse = userSession.userResponses[i];
    numExpectations += userResponse.expectationScores.length;
    for (let j = 0; j < userResponse.expectationScores.length; j++) {
      const expectationScore = userResponse.expectationScores[j] as any;
      if (!expectationScore[gradeField]) {
        return null;
      }
      const val =
        expectationScore[gradeField] === 'Good'
          ? 1
          : expectationScore[gradeField] === 'Neutral'
          ? 0.5
          : 0;
      score += val;
    }
  }
  return score / numExpectations;
};

export default calculateScore;
