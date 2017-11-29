import * as React from 'react';

export interface UserProps {}

export interface UserState {}

export class User extends React.Component<UserProps, UserState> {
    public render(): JSX.Element {
        return (
            <div className="User">
                <div className="User-label">User</div>
            </div>
        );
    }
}
