export declare const config: {
    NODE_ENV: string;
    PORT: number;
    CLIENT_URL: string;
    DATABASE_URL: string | undefined;
    JWT_SECRET: string;
    JWT_EXPIRE: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRE: string;
    MAX_FILE_SIZE: number;
    UPLOAD_DIR: string;
    BCRYPT_ROUNDS: number;
    EMAIL_SERVICE: string;
    EMAIL_USER: string | undefined;
    EMAIL_PASSWORD: string | undefined;
    EMAIL_FROM: string;
    VERIFICATION_EXPIRY: string;
    GOOGLE_CLIENT_ID: string | undefined;
    GOOGLE_CLIENT_SECRET: string | undefined;
};
export declare const validateEnv: () => void;
//# sourceMappingURL=env.config.d.ts.map