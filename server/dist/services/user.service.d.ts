import { UpdateProfileDTO } from "../dto/user.dto";
export declare const getUserProfile: (userId: string) => Promise<{
    name: string | null;
    id: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    role: import(".prisma/client").$Enums.UserRole;
    status: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getUserById: (userId: string) => Promise<{
    name: string | null;
    id: string;
    avatar: string | null;
    bio: string | null;
    status: string;
    createdAt: Date;
}>;
export declare const updateUserProfile: (userId: string, data: UpdateProfileDTO) => Promise<{
    name: string | null;
    id: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    role: import(".prisma/client").$Enums.UserRole;
    status: string;
    updatedAt: Date;
}>;
export declare const uploadUserAvatar: (userId: string, file: Express.Multer.File) => Promise<{
    name: string | null;
    id: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    status: string;
    updatedAt: Date;
}>;
export declare const searchUsers: (query: string, limit?: number, currentUserId?: string) => Promise<{
    name: string | null;
    id: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    status: string;
}[]>;
export declare const deleteUserAccount: (userId: string) => Promise<{
    message: string;
}>;
export declare const updateUserStatus: (userId: string, status: string) => Promise<{
    id: string;
    status: string;
    updatedAt: Date;
}>;
export declare const getAllUsers: (limit?: number, skip?: number) => Promise<{
    name: string | null;
    id: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    role: import(".prisma/client").$Enums.UserRole;
    status: string;
    createdAt: Date;
}[]>;
export declare const getTotalUsersCount: () => Promise<number>;
//# sourceMappingURL=user.service.d.ts.map