// Operational error with an HTTP status code. Throw these from controllers/
// services for expected failures (not found, unauthorized, bad input); the
// central error handler turns them into a uniform JSON response.
export class AppError extends Error {
    constructor(public readonly statusCode: number, message: string) {
        super(message);
        this.name = "AppError";
    }
}
