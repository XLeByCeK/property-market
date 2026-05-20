import { S3Client } from '@aws-sdk/client-s3';
export declare const storageConfig: {
    endpoint: string;
    region: string;
    bucket: string;
    publicBaseUrl: string;
    uploadPrefix: string;
    hasCredentials: boolean;
};
export declare const s3Client: S3Client;
