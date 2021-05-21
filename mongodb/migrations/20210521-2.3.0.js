var ObjectID = require("mongodb").ObjectID
module.exports = {
  async up(db, client) {
    console.log(`migrate up`);
  },

  async down(db, client) {
    console.log(`migrate down`);
  },
};
