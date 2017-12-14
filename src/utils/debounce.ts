export const debounce = (func: Function, delay: number): any => {
    let inDebounce: any = undefined;

    return function(this: any) {
        const context = this;
        const args = arguments;

        clearTimeout(inDebounce);
        return (inDebounce = setTimeout(
            () => func.apply(context, args),
            delay
        ));
    };
};
