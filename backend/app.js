require('dotenv').config()
const morgan = require('morgan');
const logger = require('./logger');
const cors = require('cors');
const { corsOptions } = require('./middleware');

const express = require('express');
const app = express();
const { authenticateUser } = require('./middleware');

app.use(cors(corsOptions));
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json());

const apiRouter = express.Router();
apiRouter.use(authenticateUser);

const users = require('./routes/users');
const transactions = require('./routes/transactions');
const categories = require('./routes/categories');
const loans = require('./routes/loans');
const counterparties = require('./routes/counterparties');

apiRouter.use("/users", users);
apiRouter.use("/transactions", transactions);
apiRouter.use("/categories", categories);
apiRouter.use("/loans", loans);
apiRouter.use("/counterparties", counterparties);

app.use('/api', apiRouter);
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res) => {
  if (err.message === 'Not allowed by CORS') {
    logger.warn('CORS error', {
      origin: req.headers.origin,
      path: req.path
    });
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(process.env.PORT, () => logger.info(`Server running on port ${process.env.PORT}`));