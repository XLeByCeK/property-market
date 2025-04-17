declare const config: {
    port: string | number;
    databaseUrl: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    environment: string;
    corsOrigins: string[];
};
export default config;
