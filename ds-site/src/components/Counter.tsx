import * as React from 'react';

export interface CounterProps {}

export interface CounterState {
    count: number;
}

export class Counter extends React.Component<CounterProps, CounterState> {
    constructor(props: CounterProps) {
        super(props);
        this.state = { count: 0 };

        setInterval(() => {
            this.setState(state => ({
                ...state,
                count: state.count + 1
            }));
        }, 1000);
    }

    public render(): JSX.Element {
        return (
            <div>
                <div>Counter: {this.state.count}</div>
            </div>
        );
    }
}
