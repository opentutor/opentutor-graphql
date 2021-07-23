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

    function getLessonById(lessons, id) {
      return lessons.find(({lessonId})=>lessonId === id)
    }

    const lessons =  await getCollection("lessons");

    lessons.forEach(item=>{
      console.log(item.expectations);
      item.expectations.forEach(expectation=>{
        expectation.expectationId = expectation._id.toString();
      })
    })

    const sessions = await getCollection("sessions");

    sessions.forEach(session=>{
      lesson = getLessonById(lessons, session.lessonId);

      session.question.expectations.forEach((expectation, index)=>{
        if (index < lesson.expectations.length)
        {
          expectation.expectationId = lesson.expectations[index].expectationId;
        }

      })

      session.userResponses.forEach(response=>{
        response.expectationScores.forEach((expectationScore, index) =>{
          console.log(JSON.stringify(lesson.expectations.length))
          console.log(index);
          if(index < lesson.expectations.length)
          {
            expectationScore.expectationId = lesson.expectations[index].expectationId;
            console.log(expectationScore.expectationId);
          }  
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
