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

    lessons.forEach(lesson => {
      if(lesson.image) {
        lesson.mediaType = "image"
      } else {
        lesson.mediaType = "none"
      }
      // item.expectations.forEach(expectation=>{
      //   if(!expectation.expectationId){
      //     expectation.expectationId = expectation._id.toString();
      //   }
      // })
    })

    lessons.forEach(lesson => {
      db.collection("lessons").updateOne({lessonId: lesson.lessonId}, {$set:lesson});
    })
   
  },

  async down(db, client) {
    console.log(`migrate down`);
  },
};
