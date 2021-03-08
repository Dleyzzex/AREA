import 'dart:convert';
import 'HomePage.dart';
import 'Models/User.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'config.dart';
import 'tools.dart';
import 'Models/Error.dart';

class SignUpPage extends StatefulWidget {
  @override
  final Map<String, String> cookies;
  SignUpPage({Key key, @required this.cookies}) : super(key: key);
  _SignUpPageState createState() => _SignUpPageState(cookies: cookies);
}

class _SignUpPageState extends State<SignUpPage> {
  final Map<String, String> cookies;
  TextEditingController _pseudoController = new TextEditingController();
  TextEditingController _emailController = new TextEditingController();
  TextEditingController _passwordController = new TextEditingController();
  _SignUpPageState({@required this.cookies});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          elevation: 0,
          backgroundColor: Colors.transparent,
          iconTheme: IconThemeData(color: Colors.black),
        ),
        body: Container(
          child: SingleChildScrollView(
            child: Container (
              margin: EdgeInsets.only(top: 32, bottom: 16, left: 16, right: 16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                   Container(
                     margin: EdgeInsets.all(32),
                     child: Text('Sign Up.',
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
                           child: Text('Username',
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
                             controller: _pseudoController,
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
                               prefixIcon: Icon(Icons.account_circle_rounded),
                             ),
                           ),
                         ),
                         Container(
                           margin: EdgeInsets.only(top: 16),
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
                             controller: _emailController,
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
                             controller: _passwordController,
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
                             child: Text('Register',
                               style: TextStyle(
                                 fontSize: 16,
                               ),
                             ),
                             onPressed: () {
                               this.signUp(_pseudoController.text,_emailController.text, _passwordController.text);
                               },
                           ),
                         ),
                       ],
                     ),
                   ), // Email, Pwd, SignupBtn
                ],
              )
            )
          )
        )
    );
  }

  void signUp(String username, String email, String password) async {
    final response = await http.post(
      Uri.http(server, '/auth/signup'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        'username': username,
        'email': email,
        'password': password,
      }),
    );
    if (response.statusCode == 200) {
      this._pseudoController.clear();
      this._emailController.clear();
      this._passwordController.clear();
      UserData user = UserData.fromJson(jsonDecode(response.body));
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => HomePage(user: user, cookies: cookies)));
    }
    else {
      Error err = Error.fromJson(jsonDecode(response.body));
      createToast(err.message);
    }
  }
}