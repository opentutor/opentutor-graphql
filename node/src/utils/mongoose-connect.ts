import mongoose from 'mongoose';
import requireEnv from './require-env';
mongoose.set('useCreateIndex', true);

/**
 * Connect mongoose using env variables:
 * MONGO_USER
 * MONGO_PASSWORD
 * MONGO_HOST (includes port, may also be a comma-sep list of host1:port1,host2:port2 for replicate set)
 * MONGO_DB - database name
 * MONGO_QUERY_STRING - query string
 */
export default async function mongooseConnect(uri: string) {
  const mongoUri =
    uri ||
    process.env.MONGO_URI ||
    `mongodb://${requireEnv('MONGO_USER')}:${requireEnv(
      'MONGO_PASSWORD'
    )}@${requireEnv('MONGO_HOST')}/${requireEnv('MONGO_DB')}${
      process.env.MONGO_QUERY_STRING || ''
    }`;
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.set('useCreateIndex', true);
  if (process.env['NODE_ENV'] !== 'test') {
    console.log(
      'mongoose: connection successful ' + mongoUri.replace(/^.*@/g, '')
    );
  }
}
