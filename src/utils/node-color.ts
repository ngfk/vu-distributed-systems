/**
 * Used in the interface to decide which color to give a certain node based on
 * the job count and whether the node is down or not.
 * @param jobCount The amount of jobs this node has
 * @param isDown Whether this node is down
 * @param isParentDown If the resource manager of a worker node is down it
 * gets a different color
 */
export const getNodeColor = (
    jobCount: number,
    isDown: boolean,
    isParentDown = false
): string => {
    if (isParentDown) return 'gray';
    if (isDown) return 'red';
    if (jobCount === 0) return 'green';
    if (jobCount > 0) return 'orange';

    return 'purple';
};
