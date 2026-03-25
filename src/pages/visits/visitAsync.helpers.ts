export interface AsyncFailure {
    data: null
    error: string
}

export interface AsyncSuccess<T> {
    data: T
    error: null
}

export type AsyncResult<T> = AsyncFailure | AsyncSuccess<T>

export function getAsyncErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof Error && error.message.trim()) {
        return error.message
    }

    return fallbackMessage
}

export async function resolveAsync<T>(
    task: Promise<T>,
    fallbackMessage: string
): Promise<AsyncResult<T>> {
    return task
        .then((data) => ({ data, error: null }))
        .catch((error: unknown) => ({
            data: null,
            error: getAsyncErrorMessage(error, fallbackMessage)
        }))
}
