import * as React from 'react';

export interface UserProps {}

export interface UserState {}

export class User extends React.Component<UserProps, UserState> {
    public render(): JSX.Element {
        return (
            <div>
                <div> User is here </div>
            </div>
        );
    }
}
