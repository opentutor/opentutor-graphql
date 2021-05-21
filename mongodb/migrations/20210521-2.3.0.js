var ObjectID = require("mongodb").ObjectID
module.exports = {
  async up(db, client) {
    console.log(`migrate up`);
    const lessons = await db.collection("lessons").find({}).toArray()
    const updateIds = []
    for(let i = 0; i < lessons.length; i++) {
      console.log(`lesson ${lessons[i].name} createdBy=${lessons[i].createdBy} typeof createdBy=${typeof lessons[i].createdBy}`)
      if(typeof lessons[i].createdBy === 'string') {
        
        await db.collection("lessons").update(
          {_id: lessons[i]._id}, 
          { 
            $set: { 
              createdBy: ObjectID("60a812b3c9853935214b45d2"), 
              createdByName: lessons[i].createdBy 
            } 
          }
        );
      }
    }
  },

  async down(db, client) {
    console.log(`migrate down`);
  },
};
