export interface IResponseError {
    statusCode: number;
    message: string;
    code: string;
    timestamp: string;
    path: string;
    method: string;
}