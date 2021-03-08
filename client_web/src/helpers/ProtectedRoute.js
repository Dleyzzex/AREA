import React from 'react'
import { Redirect } from 'react-router-dom'

class ProtectedRoute extends React.Component {
    render() {
        const Component = this.props.component;
        const isAuthenticated = localStorage.getItem("user");
       
        return isAuthenticated ? (
            <Component />
        ) : (
            <Redirect to={{ pathname: '/home' }} />
        );
    }
}

export default ProtectedRoute;