/**
 * Defines unique symbols for dependency injection using tsyringe.
 * Each service, repository, and utility is associated with a unique symbol.
 */
export const TSYRINGE_TOKENS = {
    ILoggerService: Symbol.for("ILoggerService"),
    IFirebaseAdmin: Symbol.for("IFirebaseAdmin"),
    IAuthService: Symbol.for("IAuthService"),
    IAuthenticatorService: Symbol.for("IAuthenticatorService"),
    IUserService: Symbol.for("IUserService"),
    IUserProfileService: Symbol.for("IUserProfileService"),
    IUserHistoryService: Symbol.for("IUserHistoryService"),
    IUserBookmarkService: Symbol.for("IUserBookmarkService"),
    IProblemService: Symbol.for("IProblemService"),
    ISubscriptionService: Symbol.for("ISubscriptionService"),
    IActivityService: Symbol.for("IActivityService"),
    IAccountRepository: Symbol.for("IAccountRepository"),
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
};
