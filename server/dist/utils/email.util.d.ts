export declare const initializeEmailService: () => void;
export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare const sendEmail: (options: EmailOptions) => Promise<void>;
export declare const sendVerificationEmail: (email: string, verificationToken: string, verificationLink: string, name?: string) => Promise<void>;
export declare const sendPasswordResetEmail: (email: string, resetToken: string, resetLink: string, name?: string) => Promise<void>;
export declare const sendWelcomeEmail: (email: string, name: string) => Promise<void>;
//# sourceMappingURL=email.util.d.ts.map