import React from 'react'

import axios from 'axios'

import { Card, CardBody, Container, Badge, Col, Row, Button} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIdBadge, faAt, faUser} from '@fortawesome/free-solid-svg-icons'
import { faGoogle, faGithub, faMicrosoft, faRedditAlien, faTwitch } from '@fortawesome/free-brands-svg-icons'
import OAuth2Login from 'react-simple-oauth2-login';
import { login, linkOAuth, unlinkOAuth } from "../actions/auth";
import { connect } from "react-redux";

import "bootstrap/dist/css/bootstrap.css";
class Settings extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        google: false,
        github: false,
        microsoft: false,
        reddit: false,
        twitch: false,
        loading: false
      }
    }
    handleOAuthUnlink = (provider) => {
      const { dispatch } = this.props;
      dispatch(unlinkOAuth(provider))
      .then(() => {
        this.setState({
          [provider] : false
        })
      })
      .catch(() => {

      });
    }
    handleOAuthLink = (provider, e) => {
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
      dispatch(linkOAuth(provider, e))
      .then(() => {
        this.setState({
          [provider] : true
        })
      })
      .catch(() => {

      });
    }
    componentDidMount() {
      const currentUser = JSON.parse(localStorage.getItem("user"));

        const config = {
          headers: { Authorization: `Bearer ${currentUser.access_token}` }
        };
      axios.get("http://" + process.env.REACT_APP_BASE_URL + ":8080/services/status", config)
      .then((response) => {
        if (response.data) {
          this.setState({
            ...response.data
          })
        }
      });
    }
    render() {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        const { isLoggedIn, message } = this.props;
      return (
        <div>
          {message && (
                <div className="form-group">
                  <div className="alert alert-danger" role="alert">
                    {message}
                  </div>
                </div>
              )}
          <Container>
            <Card>
              <CardBody>
                <img src="//ssl.gstatic.com/accounts/ui/avatar_2x.png" alt="profile-img" className="profile-img-card"/>
              </CardBody>
              <CardBody>
                <table className="btn-services">
                  <tbody>
                    <tr>
                      <td>
                        {!this.state.google ? (
                          <OAuth2Login
                          authorizationUrl="https://accounts.google.com/o/oauth2/v2/auth"
                          responseType="code"
                          scope="https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/youtube&access_type=offline&prompt=consent"
                          clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                          redirectUri={"http://" + process.env.REACT_APP_BASE_URL + ":8081/settings"}
                          onSuccess={(code) => {this.handleOAuthLink("google", code)}}
                          onFailure={(error) => {console.log(error)}}
                          className={"btn-oauth-red"}>
                        <FontAwesomeIcon icon={faGoogle} size="2x"/>
                        </OAuth2Login>) : <button disabled={(currentUser.provider == "google")} className="btn-oauth-green"  onClick={() => {this.handleOAuthUnlink("google")}}><FontAwesomeIcon icon={faGoogle} size="2x"/></button>}
                      </td>
                      <td>
                      {!this.state.github ? (
                          <OAuth2Login
                          authorizationUrl="https://github.com/login/oauth/authorize"
                          responseType="code"
                          scope="read:user user:email"
                          clientId={process.env.REACT_APP_GITHUB_CLIENT_ID}
                          redirectUri={"http://" + process.env.REACT_APP_BASE_URL + ":8081/settings"}
                          onSuccess={(code) => {this.handleOAuthLink("github", code)}}
                          onFailure={(error) => {}}
                          className={"btn-oauth-red"}>
                        <FontAwesomeIcon icon={faGithub} size="2x"/>
                        </OAuth2Login>) : <button disabled={(currentUser.provider == "github")} className="btn-oauth-green"  onClick={() => {this.handleOAuthUnlink("github")}}><FontAwesomeIcon icon={faGithub} size="2x"/></button>}
                      </td>
                      <td>
                      {!this.state.microsoft ? (
                          <OAuth2Login
                          authorizationUrl="https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
                          responseType="code"
                          scope="user.read offline_access Mail.ReadBasic Mail.Read Mail.ReadWrite Mail.Send Calendars.Read Calendars.ReadWrite Tasks.ReadWrite"
                          clientId={process.env.REACT_APP_MICROSOFT_CLIENT_ID}
                          redirectUri={"http://" + process.env.REACT_APP_BASE_URL + ":8081/settings"}
                          onSuccess={(response) => {this.handleOAuthLink("microsoft", response)}}
                          onFailure={(error) => {}}
                          className={"btn-oauth-red"}>
                        <FontAwesomeIcon icon={faMicrosoft} size="2x"/>
                        </OAuth2Login>) : <button disabled={(currentUser.provider == "microsoft")} className="btn-oauth-green"  onClick={() => {this.handleOAuthUnlink("microsoft")}}><FontAwesomeIcon icon={faMicrosoft} size="2x"/></button>}
                      </td>
                      <td>
                      {!this.state.reddit ? (
                          <OAuth2Login
                          authorizationUrl="https://www.reddit.com/api/v1/authorize"
                          clientId={process.env.REACT_APP_REDDIT_CLIENT_ID}
                          responseType="code"
                          state="<state>"
                          redirectUri={"http://" + process.env.REACT_APP_BASE_URL + ":8081/settings"}
                          scope="identity edit flair history modconfig modflair modlog modposts modwiki mysubreddits privatemessages read report save submit subscribe vote wikiedit wikiread&duration=permanent"
                          onSuccess={(code) =>  {this.handleOAuthLink("reddit", code)}}
                          onFailure={(error) => {}}
                          className={"btn-oauth-red"}>
                        <FontAwesomeIcon icon={faRedditAlien} size="2x"/>
                        </OAuth2Login>) : <button disabled={(currentUser.provider == "reddit")} className="btn-oauth-green"  onClick={() => {this.handleOAuthUnlink("reddit")}}><FontAwesomeIcon icon={faRedditAlien} size="2x"/></button>}
                      </td>
                      <td>
                      {!this.state.twitch ? (
                          <OAuth2Login
                          authorizationUrl="https://id.twitch.tv/oauth2/authorize"
                          clientId={process.env.REACT_APP_TWITCH_CLIENT_ID}
                          responseType="code"
                          redirectUri={"http://" + process.env.REACT_APP_BASE_URL + ":8081/settings"}
                          scope="user:edit%20user:read:email"
                          onSuccess={(code) =>  {this.handleOAuthLink("twitch", code)}}
                          onFailure={(error) => {}}
                          className={"btn-oauth-red"}>
                        <FontAwesomeIcon icon={faTwitch} size="2x"/>
                        </OAuth2Login>) : <button disabled={(currentUser.provider == "twitch")} className="btn-oauth-green"  onClick={() => {this.handleOAuthUnlink("twitch")}}><FontAwesomeIcon icon={faTwitch} size="2x"/></button>}
                      </td>
                    </tr>
                  </tbody>
                </table>      
                <table className="ProfileInfo">
                  <tbody>
                    <tr>
                      <td><FontAwesomeIcon icon={faUser}/></td>
                      <td>{currentUser && (currentUser.username)}</td>
                    </tr>
                    <tr>
                      <td><FontAwesomeIcon icon={faAt}/></td>
                      <td>{currentUser && (currentUser.email)}</td>
                    </tr>
                    <tr>
                      <td><FontAwesomeIcon icon={faIdBadge}/></td>
                      <td>{currentUser && (currentUser.role)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Container>
        </div>
      );
    }
  }

function mapStateToProps(state) {
    const { isLoggedIn } = state.auth;
    const { message } = state.message;
    return {
      isLoggedIn,
      message
    };
  }

export default connect(mapStateToProps)(Settings);

// export default Settings;

// export default LoginForm;
// function mapStateToProps(state) {
//     const { isLoggedIn } = state.auth;
//     const { message } = state.message;
//     return {
//       isLoggedIn,
//       message
//     };
//   }

// export default connect(mapStateToProps)(Settings);

