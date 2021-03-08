import axios from "axios";

const API_URL = "http://" + process.env.REACT_APP_BASE_URL + ":8080/auth/";

class AuthService {
  loginOAuth(provider, token) {
    var data = new URLSearchParams();
    data.append('authorization_code', token.code);
    data.append('redirect_uri', 'http://' + process.env.REACT_APP_BASE_URL + ':8081/login');
    data.append('origin', 'web');
    return axios
      .post(API_URL + provider, data)
      .then((response) => {
        if (response.data.access_token) {
          localStorage.setItem("user", JSON.stringify({...response.data.user, access_token: response.data.access_token}));
        }

        return response;
      });
  }
  linkOAuth(provider, token) {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const config = {
      headers: { Authorization: `Bearer ${currentUser.access_token}` }
    };
    var data = new URLSearchParams();
    data.append('authorization_code', token.code)
    data.append('redirect_uri', 'http://' + process.env.REACT_APP_BASE_URL + ':8081/settings')
    data.append('origin', 'web');

    var url = API_URL + provider + "/link"
    return axios
      .post(url, data, config)
      .then((response) => {
        return response.data
      });
  }
  unlinkOAuth(provider) {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const config = {
      headers: { Authorization: `Bearer ${currentUser.access_token}` }
    };

    return axios
      .post("http://" + process.env.REACT_APP_BASE_URL + ":8080/auth/"+ provider + "/unlink", {}, config)
      .then((response) => {
        return response.data
      });
  }
  login(email, password) {
    return axios
      .post(API_URL + "signin", { email, password }, {withCredentials: true})
      .then((response) => {
        if (response.data.access_token) {
          localStorage.setItem("user", JSON.stringify({...response.data.user, access_token: response.data.access_token}));
        }

        return response.data;
      });
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(username, email, password) {
    return axios
      .post(API_URL + "signup", { username, email, password })
      .then((response) => {
        if (response.data.access_token) {
          localStorage.setItem("user", JSON.stringify({...response.data.user, access_token: response.data.access_token}));
        }

        return response.data
      });
  }
}

export default new AuthService();