export const uuid = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
        const random = (Math.random() * 16) | 0;
        const v = char === 'x' ? random : (random & 0x3) | 0x8;
        return v.toString(16);
    });
};
