import React from 'react'

import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { Redirect } from 'react-router-dom';
import { connect } from "react-redux";
import { register } from "../actions/auth";
import { isEmail } from "validator";
import { Nav, NavLink, Col, Row } from 'reactstrap';
import { login, loginOAuth } from "../actions/auth";
import OAuth2Login from 'react-simple-oauth2-login';

const rowStyle = {
  display: 'flex'
}

const colStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '1',
  height: '100%'
}

const required = (value) => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        This field is required!
      </div>
    );
  }
};

const email = (value) => {
  if (!isEmail(value)) {
    return (
      <div className="alert alert-danger" role="alert">
        This is not a valid email.
      </div>
    );
  }
};

const vusername = (value) => {
  if (value.length < 3 || value.length > 20) {
    return (
      <div className="alert alert-danger" role="alert">
        The username must be between 3 and 20 characters.
      </div>
    );
  }
};

const vpassword = (value) => {
  if (value.length < 6 || value.length > 40) {
    return (
      <div className="alert alert-danger" role="alert">
        The password must be between 6 and 40 characters.
      </div>
    );
  }
};

class Register extends React.Component {
    constructor(props) {
      super(props);
      this.state = { email: '', password:'', username:'', loading: false };
    }
    onChangeEmail = (e) => {
        this.setState({email: e.target.value});
    }
    onChangePassword = (e) => {
        this.setState({password: e.target.value});
    }
    onChangeUsername = (e) => {
      this.setState({username: e.target.value});
    }
    onRegisterFail = () => {
      this.setState({loading: false});
    }
    handleRegister = (e) => {
        e.preventDefault();
        this.setState({
          loading: true,
        });
        this.form.validateAll()
        const { dispatch, history } = this.props;

        if (this.checkBtn.context._errors.length === 0) {
          dispatch(register(this.state.username, this.state.email, this.state.password))
            .then(() => {
              if (this.props.history) {
                history.push("/dashboard");
                window.location.reload();
              }
            })
            .catch(() => {
              this.onRegisterFail();
            });
        } else {
          this.setState({
            loading: false,
          });
        }
    }
    handleOAuthLogin = (provider, e) => {
      if (e instanceof Error) {
        this.setState({
          loading: false
        });
        return;
      } else {
        this.setState({
          loading: true
        });
      }
      const { dispatch } = this.props;

      dispatch(loginOAuth(provider, e))
      .then(() => {
        if (this.props.history) {
          this.props.history.push("/dashboard");
          window.location.reload();
        }
      })
      .catch(() => {
        this.onLoginFail();
      });
    }

    render() {
      const { isLoggedIn, message } = this.props;
      if (isLoggedIn) {
        return <Redirect to="/dashboard" />;
      }
      return (
        <div className="col-md-12">
          <div className="card card-container p-5">
            <img
              src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
              alt="profile-img"
              className="profile-img-card"
            />
            <Form
              onSubmit={this.handleRegister}
              ref={(c) => {
                this.form = c;
              }}
            >
              {!this.state.successful && (
                <div>
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <Input
                      type="text"
                      className="form-control"
                      name="username"
                      value={this.state.username}
                      onChange={this.onChangeUsername}
                      validations={[required, vusername]}
                    />
                  </div>
  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <Input
                      type="text"
                      className="form-control"
                      name="email"
                      value={this.state.email}
                      onChange={this.onChangeEmail}
                      validations={[required, email]}
                    />
                  </div>
  
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <Input
                      type="password"
                      className="form-control"
                      name="password"
                      value={this.state.password}
                      onChange={this.onChangePassword}
                      validations={[required, vpassword]}
                    />
                  </div>
                  <div className="form-group">
                    <button className="btn btn-primary btn-block" disabled={this.state.loading}>
                      {this.state.loading && (<span className="spinner-border spinner-border-sm"></span>)}
                      <span>Sign Up</span>
                      </button>
                  </div>
                </div>
              )}
  
              {message && (
                <div className="form-group">
                  <div className={ this.state.successful ? "alert alert-success" : "alert alert-danger" } role="alert">
                    {message}
                  </div>
                </div>
              )}
              <CheckButton
                style={{ display: "none" }}
                ref={(c) => {
                  this.checkBtn = c;
                }}
              />
            </Form>
          </div>
          <Row style={rowStyle}>
            <Col style={colStyle}>
              <Nav ><NavLink>Already have an account ?</NavLink><NavLink href="/login">Sign in</NavLink></Nav>
            </Col>
          </Row>

          <div className="card card-container mt-3">
            <OAuth2Login
              authorizationUrl="https://accounts.google.com/o/oauth2/v2/auth"
              responseType="code"
              scope="https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email&access_type=offline"
              clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
              redirectUri={"http://" + process.env.REACT_APP_BASE_URL + ":8081/login"}
              onSuccess={(e) => {this.handleOAuthLogin("google", e)}}
              onFailure={(e) => {}}
              className="btn btn-primary btn-block btn-google">
                <span className="btn-google-icon">
                  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 18 18"><path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"></path><path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" fill="#34A853"></path><path d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" fill="#FBBC05"></path><path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z" fill="#EA4335"></path></svg>
                </span>
                <span className="button-label">Sign up with Google</span>
            </OAuth2Login>
            <OAuth2Login
              authorizationUrl="https://github.com/login/oauth/authorize"
              responseType="code"
              scope="read:user user:email"
              clientId={process.env.REACT_APP_GITHUB_CLIENT_ID}
              redirectUri={"http://" + process.env.REACT_APP_BASE_URL + ":8081/login"}
              onSuccess={(e) => {this.handleOAuthLogin("github", e)}}
              onFailure={(e) => {}}
              className="btn btn-primary btn-block btn-github">
                <span className="btn-github-icon">
                <svg aria-hidden="true" width="24" height="24" viewBox="0 0 18 18"><path d="M9 1a8 8 0 00-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 014 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8.01 8.01 0 009 1z"></path></svg>
                </span>
                <span className="button-label">Sign up with Github</span>
            </OAuth2Login>
            <OAuth2Login
              authorizationUrl="https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
              responseType="code"
              scope="user.read offline_access"
              clientId={process.env.REACT_APP_MICROSOFT_CLIENT_ID}
              redirectUri={"http://" + process.env.REACT_APP_BASE_URL + ":8081/login"}
              onSuccess={(e) => {this.handleOAuthLogin("microsoft", e)}}
              onFailure={(e) => {}}
              className="btn btn-primary btn-block btn-microsoft">
                <span className="btn-microsoft-icon">
                <svg aria-hidden="true" width="24" height="24" viewBox="0 0 23 23"><path fill="#f3f3f3" d="M0 0h23v23H0z"></path><path fill="#f35325" d="M1 1h10v10H1z"></path><path fill="#81bc06" d="M12 1h10v10H12z"></path><path fill="#05a6f0" d="M1 12h10v10H1z"></path><path fill="#ffba08" d="M12 12h10v10H12z"></path></svg>
                </span>
                <span className="button-label">Sign up with Microsoft</span>
            </OAuth2Login>
          </div>
        </div>
      );
    }
  }

// export default LoginForm;
function mapStateToProps(state) {
    const { isLoggedIn } = state.auth;
    const { message } = state.message;
    return {
      isLoggedIn,
      message
    };
  }

export default connect(mapStateToProps)(Register);