export declare function generateJWT(userId: number): string;
export declare function verifyJWT(token: string): {
    id: number;
} | null;
