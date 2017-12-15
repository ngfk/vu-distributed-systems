/**
 * Returns a promise that can be awaited to delay execution until the specified
 * duration has exceeded.
 * @param duration The duration to wait
 */
export const sleep = (duration: number): Promise<void> => {
    return new Promise<void>(resolve => {
        setTimeout(() => resolve(), duration);
    });
};
