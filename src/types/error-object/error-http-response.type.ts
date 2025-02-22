export interface IErrorHttpResponse {
    success: false;
    statusCode: number;
    data: unknown;
    request?: {
        ip?: string;
        method?: string;
        url?: string;
    };
    message?: string;
    trace?: object;
}
