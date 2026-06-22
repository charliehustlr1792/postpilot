import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";

interface RequestSchemas {
    body?: ZodType;
    query?: ZodType;
    params?: ZodType;
}

// Validates the parts of a request against the given zod schemas and returns a
// 400 with a clear, field-level message on failure. The parsed body is written
// back to req.body so handlers see coerced/defaulted values; req.query is
// read-only in Express 5, so it is validated but not reassigned.
export const validate =
    (schemas: RequestSchemas) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.params) {
                schemas.params.parse(req.params);
            }
            if (schemas.query) {
                schemas.query.parse(req.query);
            }
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: error.issues.map((issue) => ({
                        field: issue.path.join(".") || "(root)",
                        message: issue.message,
                    })),
                });
            }
            next(error);
        }
    };
