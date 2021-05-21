require("dotenv").config({ path: process.env.ENV_FILE || ".env" });
// In this file you can configure migrate-mongo
const mongoUri = process.env.MONGO_URI;
if(!mongoUri) {
  throw new Error("required env prop MONGO_URI is unset");
}
const config = {
  mongodb: {
    // TODO Change (or review) the url to your MongoDB:
    url: mongoUri,
      
    // TODO Change this to your database name:
    databaseName: process.env.MONGO_DB || "",

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    },
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog",

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: ".js",

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determin
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,
};

// Return the config as a promise
module.exports = config;
