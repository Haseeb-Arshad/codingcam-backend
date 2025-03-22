const errorHandler = (
  err,
  req,
  res,
  next
) => {
  console.error(err.stack);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  
  // Default error response
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
};

module.exports = { errorHandler }; 