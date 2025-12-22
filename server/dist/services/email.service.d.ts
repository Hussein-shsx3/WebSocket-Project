export declare const initializeEmailService: () => void;
export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare const sendEmail: (options: EmailOptions) => Promise<void>;
export declare const sendVerificationEmail: (email: string, verificationToken: string, verificationUrl: string) => Promise<void>;
export declare const sendPasswordResetEmail: (email: string, resetToken: string, resetUrl: string) => Promise<void>;
export declare const sendWelcomeEmail: (email: string, name: string) => Promise<void>;
export declare const verifyEmailService: () => Promise<boolean>;
//# sourceMappingURL=email.service.d.ts.map