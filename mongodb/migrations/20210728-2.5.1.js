var ObjectID = require("mongodb").ObjectID
module.exports = {
  async up(db, client) {
    console.log(`migrate up`);

    // async function getCollection(collectionName) {
    //   const result = []
    //   await db.collection(collectionName).find({}).forEach(item => {
    //     result.push(item)
    //   })
    //   return result
    // }

    // const lessons =  await getCollection("lessons");

    // lessons.forEach(lesson => {
    //   // if(lesson.image) {
    //   //   lesson.media = {
    //   //     url: lesson.image,
    //   //     type: "image",
    //   //     props: []
    //   //   } 
    //   // }
    //     // lesson.media = null;
    // })

    // lessons.forEach(lesson => {
    //   db.collection("lessons").updateOne({lessonId: lesson.lessonId}, {$set:lesson});
    // })

    db.collection("lessons").updateMany(
      {image: {$exists:true, $ne:"" }}, { $set: { media: { url: $image, type: "image" } } }
    )
   
  },

  async down(db, client) {
    console.log(`migrate down`);
  },
};
