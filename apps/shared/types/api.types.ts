export type ApiErrorResponse = {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
};

    export type ApiSuccessResponse<T> = {
    message: string;
    data: T;
};