const errorMiddleware = (err, req, res, next) => {
    console.error('Error middleware:', err.message, err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
        },
    });
};
    
module.exports = errorMiddleware;
