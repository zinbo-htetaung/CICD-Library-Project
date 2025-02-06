const express = require('express');
const createError = require('http-errors');

const taskRouter = require('./routers/Task.router');
const statusRouter = require('./routers/Status.router');
const personRouter = require('./routers/Person.router');
const userRoute = require('./routers/userRoute');
const bookRoute = require('./routers/bookRoute');
const reviewRoute = require('./routers/reviewRoute');
const bookRequestRoute = require('./routers/bookRequestRoute');
const rentHistoryRoute = require('./routers/rentHistoryRoute');
const sendEmailRoute = require('./routers/sendEmailRoute');
const adminInsightsRoute = require('./routers/adminInsightsRoute')
const bookRentalQueueRoute=require('./routers/bookRentalQueueRoute');
const messageRoutes = require('./routers/messageRoute');
const bookProgressRoute = require('./routers/bookProgressRoute')

const path = require('path');

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/tasks', taskRouter);
app.use('/statuses', statusRouter);
app.use('/persons', personRouter);
app.use('/api/users',userRoute);
app.use('/api/books',bookRoute);
app.use('/api/requests',bookRequestRoute);
app.use('/api/reviews',reviewRoute);
app.use('/api/rentHistory', rentHistoryRoute);
app.use('/api/sendEmail', sendEmailRoute);
app.use('/api/insights', adminInsightsRoute);
app.use('/api/queue', bookRentalQueueRoute);

app.use('/api/messages', messageRoutes);
app.use('/api/bookProgress', bookProgressRoute);

app.use((req, res, next) => {
  next(createError(404, `Unknown resource ${req.method} ${req.originalUrl}`));
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error(error);
  res
    .status(error.status || 500)
    .json({ error: error.message || 'Unknown Server Error!' });
});

module.exports = app;
