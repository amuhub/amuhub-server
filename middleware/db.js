const mongoose = require('mongoose');

// Define a middleware function to wrap the route handler in a transaction
const withTransaction = (handler) => async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Execute the route handler inside the transaction
    await handler(req, res, session);

    // Commit the transaction if there were no errors
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    // Roll back the transaction if there was an error
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).send('Database Transaction failed.');
  }
};

module.exports = { withTransaction };
