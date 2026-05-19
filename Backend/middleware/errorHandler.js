const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Server Error";

    if (err.name === "CastError") {
        message = "Resource not found";
        statusCode = 404;
    }

    if (err.code === 11000) {
        const field = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
        message = `${field} already exists`;
        statusCode = 400;
    }

    if (err.name === "ValidationError") {
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
        statusCode = 400;
    }

    if (err.code === "LIMIT_FILE_SIZE") {
        const maxBytes = parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760;
        const maxMb = Math.round(maxBytes / (1024 * 1024));
        message = `File size exceeds the maximum limit of ${maxMb}MB`;
        statusCode = 400;
    }

    if (err.name === "JsonWebTokenError") {
        message = "Invalid token";
        statusCode = 401;
    }

    if (err.name === "TokenExpiredError") {
        message = "Token expired";
        statusCode = 401;
    }

    if (process.env.NODE_ENV === "development") {
        console.error("Error:", { message: err.message, stack: err.stack });
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode,
        ...(process.env.NODE_ENV === "development" &&
            statusCode === 500 && { stack: err.stack }),
    });
};

export default errorHandler;
