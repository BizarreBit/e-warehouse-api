require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRouter = require('./routes/authRoute');
const authenticate = require('./middlewares/authenticate');
const userRouter = require('./routes/userRoute');
const groupRouter = require('./routes/groupRoute');
const familyRouter = require('./routes/familyRoute');
const itemRouter = require('./routes/itemRoute');

const notFoundMiddleware = require('./middlewares/notfound');
const errorMiddleware = require('./middlewares/error');

const app = express();

app.use(cors());
process.env.NODE_ENV === 'development' && app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth', authRouter);
app.use('/users', authenticate, userRouter);
app.use('/groups', authenticate, groupRouter);
app.use('/families', authenticate, familyRouter);
app.use('/items', authenticate, itemRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT || 8000;
app.listen(port, () =>
  console.log(`e-Warehouse server started on port ${port}`)
);
