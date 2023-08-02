var ObjectID = require("mongodb").ObjectID
const ARCH_LR2_CLASSIFIER = "opentutor_classifier.lr2";
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
      if(!lesson.arch) {
        lesson.arch = ARCH_LR2_CLASSIFIER;
      }
    })

    lessons.forEach(lesson => {
      db.collection("lessons").updateOne({lessonId: lesson.lessonId}, {$set:lesson});
    })
   
  },

  async down(db, client) {
    console.log(`migrate down`);
  },
};