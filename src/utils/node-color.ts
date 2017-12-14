export const getNodeColor = (jobCount: number, isDown: boolean): string => {
    if (isDown === true) {
        return 'red';
    }
    if (jobCount === 0) {
        return 'green';
    } else if (jobCount > 0) {
        return 'orange';
    }
    return 'purple';
};
