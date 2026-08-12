// Error thrown by the platform publish services. `isAuthError` flags failures
// caused by an invalid/expired token, so the job processor can refresh the
// token and retry once before giving up. `isPermanent` flags failures that a
// retry cannot fix (quota/credits exhausted, duplicate/invalid content,
// insufficient permissions) so the processor can fail fast instead of burning
// through BullMQ attempts.
export class PlatformPublishError extends Error {
    constructor(
        message: string,
        public readonly isAuthError: boolean = false,
        public readonly isPermanent: boolean = false
    ) {
        super(message);
        this.name = "PlatformPublishError";
    }
}
