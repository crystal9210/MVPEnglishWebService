/**
 * Defines unique symbols for dependency injection using tsyringe.
 * Each service, repository, and utility is associated with a unique symbol.
 *
 * **Why Use Symbol Tokens in Dependency Injection?**
 *
 * - **Reliability:** Symbols ensure uniqueness, making dependency resolution reliable.
 * - **Scalability:** Easier token management in large projects.
 * - **Error Prevention:** Improved type safety reduces development errors.
 */
export const TSYRINGE_TOKENS = {
    ILoggerService: Symbol.for("ILoggerService"),
    IFirebaseAdmin: Symbol.for("IFirebaseAdmin"),
    IAuthService: Symbol.for("IAuthService"),
    IAuthUserService: Symbol.for("IAuthUserService"),
    IAuthAccountService: Symbol.for("IAuthAccountService"),
    IAuthenticatorService: Symbol.for("IAuthenticatorService"),
    IAuthSessionService: Symbol.for("IAuthSessionService"),
    IAuthVerificationTokenService: Symbol.for("IAuthVerificationTokenService"),
    IUserService: Symbol.for("IUserService"),
    IUserProfileService: Symbol.for("IUserProfileService"),
    IUserHistoryService: Symbol.for("IUserHistoryService"),
    IUserBookmarkService: Symbol.for("IUserBookmarkService"),
    IProblemService: Symbol.for("IProblemService"),
    ISubscriptionService: Symbol.for("ISubscriptionService"),
    IActivityService: Symbol.for("IActivityService"),
    IAuthAccountRepository: Symbol.for("IAuthAccountRepository"),
    IAuthenticatorRepository: Symbol.for("IAuthenticatorRepository"),
    IAuthSessionRepository: Symbol.for("IAuthSessionRepository"),
    IAuthVerificationTokenRepository: Symbol.for(
        "IAuthVerificationTokenRepository"
    ),
    IAuthUserRepository: Symbol.for("IAuthUserRepository"),
    IUserRepository: Symbol.for("IUserRepository"),
    IProblemRepository: Symbol.for("IProblemRepository"),
    IProfileRepository: Symbol.for("IProfileRepository"),
    IUserHistoryRepository: Symbol.for("IUserHistoryRepository"),
    ISubscriptionRepository: Symbol.for("ISubscriptionRepository"),
    IActivitySessionRepository: Symbol.for("IActivitySessionRepository"),
    IEmbeddingRepository: Symbol.for("IEmbeddingRepository"),
    ILLMService: Symbol.for("ILLMService"),
    IRAGService: Symbol.for("IRAGService"),
    IOpenAIClient: Symbol.for("IOpenAIClient"),
    LLMServiceOptions: Symbol.for("LLMServiceOptions"),
    CustomFirestoreAdapter: Symbol.for("CustomFirestoreAdapter"),
};
