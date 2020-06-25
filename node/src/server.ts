import cors from 'cors';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import schema from './graphql/schema';

const app: express.Application = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(port, function() {
  console.log(`App is listening on port ${port}!`);
});
export default app;
