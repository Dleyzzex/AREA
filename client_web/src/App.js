import {Router, Route, Switch, Redirect} from 'react-router-dom';

import Home from './pages/home';
import Error404 from './pages/404'
import Login from './pages/login';
import Register from './pages/register';
import DashboardUser from './pages/dashboard-user';
import DashboardAdmin from './pages/dashboard-admin';

import Settings from './pages/settings';
import Profile from './pages/profile';
import Scripts from './pages/scripts';
import AddScript from './pages/addScript';

import Auth from './components/auth-callback.component';

import ProtectedRoute from './helpers/ProtectedRoute'

import "bootstrap/dist/css/bootstrap.css";
import './App.css';

import { history } from './helpers/history'
import { Component } from 'react';
import { connect } from "react-redux";
import { React } from 'react'
import { clearMessage } from "./actions/message";
import axios from "axios"

import { logout } from './actions/auth';


const API_URL = "http://" + process.env.REACT_APP_BASE_URL + ":8080/auth/";




class App extends Component {

  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this)

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
    };

    axios.defaults.withCredentials = true

    axios.interceptors.response.use(undefined, function axiosRetryInterceptor(error) {
      const originalRequest = error.config;
      if (error.code != "ECONNABORTED" && error.response && error.response.status === 401 && !error.config.url.includes("/auth/google") && !error.config.url.includes("/auth/github") && !error.config.url.includes("/auth/microsoft") && !error.config.url.includes("/auth/signin") && !error.config.url.includes("/auth/signup")) {
        // console.log(error.config.url)
        if (!originalRequest._retry && !error.config.url.includes("/auth/refresh-token")) {
          originalRequest._retry = true;
          return axios
            .post(API_URL + "refresh-token", {withCredentials: true})
            .then(response => {
              var user = JSON.parse(localStorage.getItem('user'));
              user.access_token = response.data.access_token;
              localStorage.setItem("user", JSON.stringify(user));
    
              originalRequest.headers.Authorization = `Bearer ${user.access_token}`;
              return axios(originalRequest);
            })
        } else {
          props.dispatch(logout());
          localStorage.removeItem("user")
          history.push("/login");
          window.location.reload();
        }
        return Promise.reject(error);
      }
      return Promise.reject(error);
    });
    history.listen((location) => {
      props.dispatch(clearMessage()); // clear message when changing location
    });
  }

  logOut()
  {
    this.props.dispatch(logout());
  }
  shouldComponentUpdate()
  {
    this.state.currentUser = JSON.parse(localStorage.getItem("user"));
    return true;
  }
  
  render () {
  return (
    <Router history={history} locations={this.props.locations}>
      
      <Switch>
        <Route exact path="/home" component={Home}/>
        <Route exact path="/login" component={Login}/>
        {/* <Route exact path="/logout" component={LogoutComponent}/> */}

        <Route exact path="/register" component={Register}/>
        <Route exact path="/auth" component={Auth}/>
        <ProtectedRoute exact path="/dashboard" component={DashboardUser} />

        <ProtectedRoute exact path="/settings" component={Settings}/>
        <ProtectedRoute exact path="/profile" component={Profile}/>
        <ProtectedRoute exact path="/scripts" component={Scripts}/>
        <ProtectedRoute exact path="/add-script" component={AddScript}/>
        
        <Route exact path="/">
          {this.state.currentUser ? (<Redirect to="/dashboard"/>) : (<Redirect to="/home"/>)}
        </Route>
        <Route exact path="*" component={Error404}/>
      </Switch>
    </Router>
  );
  }
}

function mapStateToProps(state) {
  const { user } = state.auth;
  return {
    user,
  };
}

export default connect(mapStateToProps)(App);