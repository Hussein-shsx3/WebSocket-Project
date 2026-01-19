import { RegisterDTO, LoginDTO } from "../dto/auth.dto";
export declare class AuthService {
    register(data: RegisterDTO): Promise<{
        user: {
            name: string | null;
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
        };
        verificationToken: string;
    }>;
    login(data: LoginDTO): Promise<{
        user: {
            name: string | null;
            id: string;
            email: string;
            password: string | null;
            avatar: string | null;
            bio: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            status: string;
            emailVerified: boolean;
            refreshToken: string | null;
            googleId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    verifyEmail(token: string): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                name: string | null;
                id: string;
                email: string;
                createdAt: Date;
            };
        };
    }>;
    resendVerification(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                name: string | null;
                id: string;
                email: string;
                createdAt: Date;
            };
        };
    }>;
    refreshToken(oldRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getCurrentUser(userId: string): Promise<{
        user: {
            name: string | null;
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
        };
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map