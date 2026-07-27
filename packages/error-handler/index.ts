export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: any;

    constructor(message: string, statusCode: number, isOperational = true, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this);
    }
}

// Not Found Error
export class NotFoundError extends AppError {
    constructor(message = "Resources Not Found") {
        super(message, 404);
    }
}

// Validation Error
export class ValidationError extends AppError {
    constructor(message = "Invalid request data", details?: any) {
        super(message, 404, true, details);
    }
}

// Authentication Error
export class AuthError extends AppError {
    constructor(message = "Unauthorised") {
        super(message, 401);
    }
}

// Forbidden Error
export class ForbiddenError extends AppError {
    constructor(message = "Forbidden Access") {
        super(message, 401);
    }
}

// Database Error
export class DatabaseError extends AppError {
    constructor(message = "Database Error", details?: any) {
        super(message, 500, true, details);
    }
}

// Rate Limiting Error
export class RateLimitError extends AppError {
    constructor(message = "Too Many Requests, Please Try Again Later!") {
        super(message, 429);
    }
}