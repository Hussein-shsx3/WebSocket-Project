export interface TokenPayload {
    userId: string;
    email: string;
    role?: string;
    iat?: number;
    exp?: number;
}
export interface DecodedToken extends TokenPayload {
    iat: number;
    exp: number;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export declare const generateAccessToken: (payload: Omit<TokenPayload, "iat" | "exp">) => string;
export declare const generateRefreshToken: (payload: Omit<TokenPayload, "iat" | "exp">) => string;
export declare const generateAuthTokens: (payload: Omit<TokenPayload, "iat" | "exp">) => AuthTokens;
export declare const verifyAccessToken: (token: string) => DecodedToken;
export declare const verifyRefreshToken: (token: string) => DecodedToken;
export declare const refreshAccessToken: (refreshToken: string) => AuthTokens;
export declare const decodeToken: (token: string) => DecodedToken | null;
//# sourceMappingURL=jwt.util.d.ts.map