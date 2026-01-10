


//async error handling middleware
const asyncHandler = (requestHandler) => {
    // Return a new function that Express can call
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err)); // Pass error to Express error middleware
    };
};

export { asyncHandler };
