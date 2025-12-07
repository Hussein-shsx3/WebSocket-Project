"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsersSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50).optional(),
    bio: zod_1.z.string().max(200).optional(),
    status: zod_1.z.enum(["online", "offline", "away"]).optional(),
});
exports.searchUsersSchema = zod_1.z.object({
    query: zod_1.z.string().min(1),
    limit: zod_1.z.string().optional(),
});
//# sourceMappingURL=user.dto.js.map