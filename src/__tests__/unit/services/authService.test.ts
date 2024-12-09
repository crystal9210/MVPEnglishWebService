// src/services/__tests__/authService.test.ts
import { container } from "@/containers/diContainer";
import { AuthService } from "@/domain/services/authService";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import { mock, MockProxy } from "jest-mock-extended";

describe("AuthService", () => {
    let authService: AuthService;
    let firebaseAdminMock: MockProxy<IFirebaseAdmin>;
    let loggerMock: MockProxy<ILoggerService>;

    beforeEach(() => {
        firebaseAdminMock = mock<IFirebaseAdmin>();
        loggerMock = mock<ILoggerService>();

        container.registerInstance<IFirebaseAdmin>("IFirebaseAdmin", firebaseAdminMock);
        container.registerInstance<ILoggerService>("ILoggerService", loggerMock);
        container.registerSingleton(AuthService);

        authService = container.resolve<AuthService>(AuthService);
    });

    afterEach(() => {
        container.reset();
    });

    it("should fetch user by email successfully", async () => {
        const mockUser = { uid: "user123", email: "test@gmail.com", emailVerified: true, displayName: "Test User", photoURL: "http://example.com/photo.jpg" } as any;
        firebaseAdminMock.getAuth.mockReturnValue({
            getUserByEmail: jest.fn().mockResolvedValue(mockUser),
            createUser: jest.fn(),
            deleteUser: jest.fn(),
        } as any);

        const user = await authService.getUserByEmail("test@gmail.com");
        expect(user).toEqual(mockUser);
    });

    it("should return undefined if user not found", async () => {
        firebaseAdminMock.getAuth.mockReturnValue({
            getUserByEmail: jest.fn().mockRejectedValue({ code: "auth/user-not-found" }),
            createUser: jest.fn(),
            deleteUser: jest.fn(),
        } as any);

        const user = await authService.getUserByEmail("nonexistent@gmail.com");
        expect(user).toBeUndefined();
    });

    // 他のテストケースを追加
});
