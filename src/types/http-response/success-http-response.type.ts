export interface ISuccessHttpResponse {
    success: true;
    statusCode: number;
    data: unknown;
    request?: {
        ip?: string;
        method?: string;
        url?: string;
    };
    message?: string;
}
