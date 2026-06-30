// Error thrown by the platform publish services. `isAuthError` flags failures
// caused by an invalid/expired token, so the job processor can refresh the
// token and retry once before giving up.
export class PlatformPublishError extends Error {
    constructor(
        message: string,
        public readonly isAuthError: boolean = false
    ) {
        super(message);
        this.name = "PlatformPublishError";
    }
}
