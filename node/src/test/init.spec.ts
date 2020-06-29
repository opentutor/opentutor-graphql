import { appStop } from '../app';
import { logger } from '../utils/logging';
import mongoUnit from 'mongo-unit';
import { fixturePath } from './helpers';

before(() => {
  process.env.DOTENV_PATH = fixturePath('.env');
});

after(async () => {
  try {
    await appStop();
  } catch (mongooseDisconnectErr) {
    logger.error(mongooseDisconnectErr);
  }
  try {
    await mongoUnit.stop();
  } catch (mongoUnitErr) {
    logger.error(mongoUnitErr);
  }
});

mongoUnit.start().then(url => {
  process.env.MONGO_URI = url; // this const process.env.DATABASE_URL = will keep link to fake mongo
  run(); // this line start mocha tests
});
