import 'package:flutter/material.dart';
import 'HomePage.dart';
import 'SignUpPage.dart';
import 'package:http/http.dart' as http;
import 'Models/User.dart';
import 'dart:convert';
import 'package:flutter_web_auth/flutter_web_auth.dart';
import 'package:sign_button/sign_button.dart';
import 'config.dart';
import 'tools.dart';
import 'Models/Error.dart';

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  TextEditingController emailController = new TextEditingController();
  TextEditingController passwordController = new TextEditingController();
  Map<String, String> cookies = {};

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Container(
            child: SingleChildScrollView(
                child: Container (
                    margin: EdgeInsets.only(top: 128, bottom: 16, left: 16, right: 16),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          margin: EdgeInsets.all(32),
                          child: Text('Login.',
                            style: TextStyle(
                              color: Colors.black,
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ), // Title
                        Container(
                          margin: EdgeInsets.all(8),
                          padding: EdgeInsets.all(32),
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(4),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.grey.withOpacity(0.6), //color of shadow
                                  spreadRadius: 2, //spread radius
                                  blurRadius: 1, // blur radius
                                  offset: Offset(0, 2),
                                )
                              ]
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Container(
                                child: Text('Email',
                                  style: TextStyle(
                                    color: Colors.black,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w200,
                                  ),
                                ),
                              ),
                              Container(
                                margin: EdgeInsets.symmetric(vertical: 8),
                                child: TextField(
                                  controller: emailController,
                                  cursorColor: Colors.black,
                                  cursorWidth: 1,
                                  decoration: InputDecoration(
                                    contentPadding: EdgeInsets.symmetric(vertical: 15.0),
                                    border: OutlineInputBorder(
                                        borderSide: BorderSide(color: Colors.blue, width: 1),
                                        borderRadius: BorderRadius.all(Radius.circular(4))
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                        borderSide: BorderSide(color: Colors.blue, width: 1),
                                        borderRadius: BorderRadius.all(Radius.circular(4))
                                    ),
                                    prefixIcon: Icon(Icons.email),
                                  ),
                                ),
                              ),
                              Container(
                                margin: EdgeInsets.only(top: 16),
                                child: Text('Password',
                                  style: TextStyle(
                                    color: Colors.black,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w200,
                                  ),
                                ),
                              ),
                              Container(
                                margin: EdgeInsets.symmetric(vertical: 8),
                                child: TextField(
                                  controller: passwordController,
                                  cursorColor: Colors.black,
                                  cursorWidth: 1,
                                  obscureText: true,
                                  decoration: InputDecoration(
                                    contentPadding: EdgeInsets.symmetric(vertical: 15.0),
                                    border: OutlineInputBorder(
                                        borderSide: BorderSide(color: Colors.blue, width: 1),
                                        borderRadius: BorderRadius.all(Radius.circular(4))
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                        borderSide: BorderSide(color: Colors.blue, width: 1),
                                        borderRadius: BorderRadius.all(Radius.circular(4))
                                    ),
                                    prefixIcon: Icon(Icons.lock),
                                  ),
                                ),
                              ),
                              Container(
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                      shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(4)
                                      )
                                  ),
                                  child: Text('Login',
                                    style: TextStyle(
                                      fontSize: 16,
                                    ),
                                  ),
                                  onPressed: () {
                                    this.signIn(emailController.text, passwordController.text);
                                  },
                                ),
                              ),
                            ],
                          ),
                        ), // Email, Pwd, LoginBtn
                        Container(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text('Need an account ?'),
                                TextButton(
                                  child:Text('Sign Up'),
                                  onPressed: () {
                                    Navigator.push(context, MaterialPageRoute(builder: (context) => SignUpPage(cookies: cookies)));
                                  },
                                ),
                              ],
                            )
                        ), // Sign Up
                        Container(
                            margin: EdgeInsets.all(8),
                            padding: EdgeInsets.all(16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SignInButton.mini(
                                  buttonType: ButtonType.google,
                                  buttonSize: ButtonSize.large,
                                  onPressed: () {
                                    this.googleAuth();
                                  },
                                ),
                                SignInButton.mini(
                                  buttonType: ButtonType.microsoft,
                                  buttonSize: ButtonSize.large,
                                  onPressed: () {
                                    this.microsoftAuth();
                                  },
                                ),
                                SignInButton.mini(
                                  buttonType: ButtonType.github,
                                  buttonSize: ButtonSize.large,
                                  onPressed: () {
                                    this.githubAuth();
                                  },
                                ),
                              ],
                            )
                        ), // Link
                      ],
                    )
                )
            )
        )
    );
  }

  void _updateCookie(http.Response response) {
    String allSetCookie = response.headers['set-cookie'];
    if (allSetCookie != null) {
      var setCookies = allSetCookie.split(',');
      for (var setCookie in setCookies) {
        var cookies = setCookie.split(';');
        for (var cookie in cookies) {
          _setCookie(cookie);
        }
      }
    }
  }

  void _setCookie(String rawCookie) {
    if (rawCookie.length > 0) {
      var keyValue = rawCookie.split('=');
      if (keyValue.length == 2) {
        var key = keyValue[0].trim();
        var value = keyValue[1];
        // ignore keys that aren't cookies
        if (key == 'Path' || key == 'Expires')
          return;
        this.cookies[key] = value;
      }
    }
  }

  void signIn(String email, String password) async {
    final response = await http.post(
      Uri.http(server, '/auth/signin'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        'email': email,
        'password': password,
      }),
    );
    if (response.statusCode == 200) {
      this._updateCookie(response);
      this.emailController.clear();
      this.passwordController.clear();
      UserData user = UserData.fromJson(jsonDecode(response.body));
      Navigator.push(context, MaterialPageRoute(builder: (_) => HomePage(user: user, cookies: cookies,)));
    }
    else {
      Error err = Error.fromJson(jsonDecode(response.body));
      createToast(err.message);
    }
  }

  void getAccess(String uri, String code, String provider) async {
    final response = await http.post(
      Uri.http(server, '/auth/$provider'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        'authorization_code': code,
        'redirect_uri': uri,
        'origin': 'mobile',
      }),
    );
    if (response.statusCode == 200) {
      this._updateCookie(response);
      UserData user = UserData.fromJson(jsonDecode(response.body));
      Navigator.push(context, MaterialPageRoute(builder: (_) => HomePage(user: user, cookies: cookies,)));
    }
    else {
      Error err = Error.fromJson(jsonDecode(response.body));
      createToast(err.message);
    }
  }

  void googleAuth() async {
    const String callbackUrlScheme = 'com.googleusercontent.apps.$googleClientId';
    final url = Uri.https('accounts.google.com', '/o/oauth2/v2/auth', {
      'response_type': 'code',
      'client_id': '$googleClientId.apps.googleusercontent.com',
      'redirect_uri': '$callbackUrlScheme:/',
      'access_type' : 'offline',
      'scope': 'email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/youtube',
    });
    final result = await FlutterWebAuth.authenticate(url: url.toString(), callbackUrlScheme: callbackUrlScheme);
    final code = Uri.parse(result).queryParameters['code'];
    getAccess('$callbackUrlScheme:/', code, 'google');
  }

  void microsoftAuth() async {
    const String redirectUri = 'area://callback';
    final url = Uri.https('login.microsoftonline.com', '/common/oauth2/v2.0/authorize', {
      'response_type': 'code',
      'client_id': microsoftClientId,
      'redirect_uri': redirectUri,
      'scope': 'openid user.read offline_access Mail.ReadBasic Mail.Read Mail.ReadWrite Mail.Send Calendars.Read Calendars.ReadWrite Tasks.ReadWrite',
    });
    final result = await FlutterWebAuth.authenticate(url: url.toString(), callbackUrlScheme: 'area');
    final code = Uri.parse(result).queryParameters['code'];
    getAccess(redirectUri, code, 'microsoft');
  }

  void githubAuth() async {
    const String redirectUri = 'area://callback';
    final url = Uri.https('github.com', '/login/oauth/authorize', {
      'response_type': 'code',
      'client_id': githubClientId,
      'redirect_uri': redirectUri,
      'scope': 'user:read user:email',
    });
    final result = await FlutterWebAuth.authenticate(url: url.toString(), callbackUrlScheme: 'area');
    final code = Uri.parse(result).queryParameters['code'];
    getAccess(redirectUri, code, 'github');
  }
}