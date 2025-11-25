import { RegisterDTO, LoginDTO } from "../dto/auth.dto";
export declare class AuthService {
    register(data: RegisterDTO): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                name: string | null;
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                createdAt: Date;
            };
            verificationToken: string;
        };
    }>;
    login(data: LoginDTO): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                name: string | null;
                email: string;
                createdAt: Date;
            };
            accessToken: string;
        };
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
    refreshTokens(refreshToken: string): Promise<{
        success: boolean;
        tokens: import("../utils/jwt.util").AuthTokens;
    }>;
    logout(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map