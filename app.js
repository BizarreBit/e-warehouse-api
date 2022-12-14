require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const notFoundMiddleware = require('./middlewares/notfound');
const errorMiddleware = require('./middlewares/error');

const app = express();

app.use(cors());
process.env.NODE_ENV === 'development' && app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT || 8000;
app.listen(port, () =>
  console.log(`e-Warehouse server started on port ${port}`)
);