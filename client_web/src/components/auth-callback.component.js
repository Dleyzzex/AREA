import React from 'react';

import { Alert } from 'reactstrap';
import axios from 'axios';

export const parseQueryString = (string) => {
    return string.slice(1).split("&")
    .map((queryParam) => {
      let kvp = queryParam.split("=")
      return { key: kvp[0], value: kvp[1] }
    })
    .reduce((query, kvp) => {
      query[kvp.key] = kvp.value
      return query
    }, {})
  }
  

class AuthCallback extends React.Component {
    constructor(props) {
        super(props);
    
        this.state = {
          loading: true,
          success: true
        };
      }
    
      componentDidMount() {
        const { history } = this.props;
        this.setState({
            loading :false,
        })
        if (this.props.location.search) {
          const { token, provider } = parseQueryString(this.props.location.search) 
          const config = {
            headers: { Authorization: `Bearer ${token}` }
          };
    
          axios.get("http://" + process.env.REACT_APP_BASE_URL + ":8080/users/me", config)
            .then((response) => {
              var user = {...response.data, access_token: token};
              this.setState({
                loading: false,
                success: true
              })
              localStorage.setItem("user", JSON.stringify(user));
              history.push("/dashboard");
              window.location.reload();
            });

        } else {
            this.setState({
                loading: false,
                success: false
            })
        }
      }
      render() {
        const { loading, success } = this.props;

        return (
            <div>
                {!loading && (!success && (<Alert color="danger">auth fail</Alert>))}
            </div>
        )
      }
  }

export default AuthCallback;