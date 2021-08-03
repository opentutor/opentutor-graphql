var ObjectID = require("mongodb").ObjectID
module.exports = {
  async up(db, client) {
    console.log(`migrate up`);

    async function getCollection(collectionName) {
      const result = []
      await db.collection(collectionName).find({}).forEach(item => {
        result.push(item)
      })
      return result
    }

    const lessons =  await getCollection("lessons");

    function getLessonById(lessons, id) {
      return lessons.find(({lessonId})=>lessonId === id)
    }

    lessons.forEach(item=>{
      item.expectations.forEach(expectation=>{
        if(!expectation.expectationId){
          expectation.expectationId = expectation._id.toString();
        }
      })
    })

    const sessions = await getCollection("sessions");

    sessions.forEach(session=>{
      const lesson = getLessonById(lessons, session.lessonId);

      session.question.expectations.forEach((expectation, index)=>{
        if (index >= lesson.expectations.length || !expectation.expectationId){
          return;
        }
        expectation.expectationId = lesson.expectations[index].expectationId;
      })

      session.userResponses.forEach(response=>{
        response.expectationScores.forEach((expectationScore, index) =>{
          if(index >= lesson.expectations.length || !expectationScore.expectationId){
            return;
          }
          expectationScore.expectationId = lesson.expectations[index].expectationId; 
        })
      })
    })

    lessons.forEach(lesson => {
      db.collection("lessons").updateOne({lessonId: lesson.lessonId}, {$set:lesson});
    })

    sessions.forEach(session => {
      db.collection("sessions").updateOne({sessionId: session.sessionId}, {$set: session})
    })
   
  },

  async down(db, client) {
    console.log(`migrate down`);
  },
};
