/**
 * Gets a random number within the range specified.
 * @param min The minimum value
 * @param max The maximum value
 */
export const randomRange = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
