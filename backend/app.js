require('dotenv').config()

const express = require('express');
const app = express();
const { authenticateUser } = require('./middleware');

app.use(express.json());

const apiRouter = express.Router();
apiRouter.use(authenticateUser);

const users = require('./routes/users');
const transactions = require('./routes/transactions');
const categories = require('./routes/categories');

apiRouter.use("/users", users);
apiRouter.use("/transactions", transactions);
apiRouter.use("/categories", categories);

app.use('/api', apiRouter)

app.listen(process.env.PORT, () => console.log("Up and running"));