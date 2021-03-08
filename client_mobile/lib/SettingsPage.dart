import 'dart:ui';
import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_app/HomePage.dart';
import 'package:flutter_web_auth/flutter_web_auth.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'Models/ServicesStatus.dart';
import 'Models/User.dart';
import 'tools.dart';
import 'Models/UI/PrefabWidgets.dart';
import 'config.dart';
import 'Models/Error.dart';
import 'HttpService.dart';
import "package:flutter_brand_icons/flutter_brand_icons.dart";
import 'package:async_loader/async_loader.dart';

class SettingsPage extends StatefulWidget {
  final UserData user;
  final Map<String, String> cookies;
  final GlobalKey<AsyncLoaderState> asyncLoaderState = GlobalKey<AsyncLoaderState>();
  ServicesStatus servicesStatus = ServicesStatus();
  SettingsPage({Key key, @required this.user, @required this.cookies}) : super(key: key);
  _SettingsPageState createState() => _SettingsPageState(user: user,  cookies: cookies);
}

class _SettingsPageState extends State<SettingsPage> {
  HttpService _http;
  UserData user;
  Map<String, String> cookies;
  PrefabWidget prefabWidget = PrefabWidget();
  ServicesStatus servicesStatus = ServicesStatus();
  bool isLoadingServicesStatus = true;
  final RefreshController _refreshController = RefreshController();
  _SettingsPageState({@required this.user, @required this.cookies});


  Future getServicesStatus() async {
    Response response;
    try {
      isLoadingServicesStatus = true;
      response = await _http.getRequest('/services/status');
      isLoadingServicesStatus = false;
      if (response.statusCode == 200) {
        setState(() {
          servicesStatus = ServicesStatus.fromJson(response.data);
        });
      }
      else {
        Error err = Error.fromJson(response.data);
        createToast(err.message);
      }
    } on Exception catch (e){
      isLoadingServicesStatus = false;
      print(e);
    }
  }

  Future postAuthServicesLink(String uri, String code, String provider) async {
    Response response;
    try {
      response = await _http.postRequest('/auth/$provider/link', data: {
        "authorization_code": code,
        "redirect_uri": uri,
        "origin": "mobile",});
      if (response.statusCode == 200) {
        getServicesStatus();
      }
      else {
        Error err = Error.fromJson(response.data);
        createToast(err.message);
      }
    } on Exception catch (e){
      print(e);
    }
  }
  Future postAuthServicesUnLink(String provider) async {
    Response response;
    try {
      response = await _http.postRequest('/auth/$provider/unlink');
      if (response.statusCode == 200) {
        getServicesStatus();
      }
      else {
        Error err = Error.fromJson(response.data);
        createToast(err.message);
      }
    } on Exception catch (e){
      print(e);
    }
  }

  void googleLink() async {
    const String redirectUri = 'com.googleusercontent.apps.$googleClientId';
    final url = Uri.https('accounts.google.com', '/o/oauth2/v2/auth', {
      'response_type': 'code',
      'client_id':'$googleClientId.apps.googleusercontent.com',
      'redirect_uri': '$redirectUri:/',
      'access_type' : 'offline',
      'scope': 'email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/youtube',
    });
    final result = await FlutterWebAuth.authenticate(url: url.toString(), callbackUrlScheme: redirectUri);
    final code = Uri.parse(result).queryParameters['code'];
    postAuthServicesLink('$redirectUri:/', code, 'google');
  }

  void githubLink() async {
    const String redirectUri = 'area://callback';
    final url = Uri.https('github.com', '/login/oauth/authorize', {
      'response_type': 'code',
      'client_id': githubClientId,
      'redirect_uri': redirectUri,
      'scope': 'user:read user:email',
    });
    final result = await FlutterWebAuth.authenticate(url: url.toString(), callbackUrlScheme: 'area');
    final code = Uri.parse(result).queryParameters['code'];
    postAuthServicesLink(redirectUri, code, 'github');
  }

  void microsoftLink() async {
    const String redirectUri = 'area://callback';
    final url = Uri.https('login.microsoftonline.com', '/common/oauth2/v2.0/authorize', {
      'response_type': 'code',
      'client_id': microsoftClientId,
      'redirect_uri': redirectUri,
      'scope': 'openid user.read offline_access Mail.ReadBasic Mail.Read Mail.ReadWrite Mail.Send Calendars.Read Calendars.ReadWrite Tasks.ReadWrite',
    });
    final result = await FlutterWebAuth.authenticate(url: url.toString(), callbackUrlScheme: 'area');
    final code = Uri.parse(result).queryParameters['code'];
    postAuthServicesLink(redirectUri, code, 'microsoft');
  }

  void redditLink() async {
    const String clientId = 'eplqKlLSH7YPOw';
    const String redirectUri = 'area://callback';
    final url = Uri.https('www.reddit.com', '/api/v1/authorize', {
      'client_id': clientId,
      'response_type': 'code',
      'state': '<state>',
      'redirect_uri': redirectUri,
      'duration': 'permanent',
      'scope': "identity edit flair history modconfig modflair modlog modposts modwiki mysubreddits privatemessages read report save submit subscribe vote wikiedit wikiread&duration=permanent",
    });
    final result = await FlutterWebAuth.authenticate(url: url.toString(), callbackUrlScheme: 'area');
    final code = Uri.parse(result).queryParameters['code'];
    postAuthServicesLink(redirectUri, code, 'reddit');
  }

  void twitchLink() async {
    const String clientId = '7uk1mt8gc7jnjrmbnjcy1siofv9das';
    const String redirectUri = 'area://';
    final url = Uri.https('id.twitch.tv', '/oauth2/authorize', {
      'client_id': clientId,
      'response_type': 'code',
      'redirect_uri': redirectUri,
      'scope': 'user:edit',
    });
    final result = await FlutterWebAuth.authenticate(url: url.toString(), callbackUrlScheme: 'area');
    final code = Uri.parse(result).queryParameters['code'];
    postAuthServicesLink(redirectUri, code, 'twitch');
  }
    @override
  void initState() {
    _http = HttpService(user.access_token, cookies["refresh_token"]);
    print('LOL' + user.access_token);
    print('LOL2' + cookies["refresh_token"]);
    getServicesStatus();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: buildAppBarSettings(),
      body: isLoadingServicesStatus == true ? Center(child: CircularProgressIndicator()) :
      Container(
        alignment: Alignment.center,
        child: SmartRefresher(
          controller: _refreshController,
          enablePullDown: true,
          onRefresh: () async {
            await getServicesStatus();
            _refreshController.refreshCompleted();
          },
          child: buildProfilSettings(),
        ),
      ),
    );
  }

  buildSettings() {
    return Container(
      alignment: Alignment.center,
      child: SmartRefresher(
        controller: _refreshController,
        enablePullDown: true,
        onRefresh: () async {
          await getServicesStatus();
          _refreshController.refreshCompleted();
        },
        child: buildProfilSettings(),
      ),
    );
  }

  buildAppBarSettings() {
    return AppBar(
        leading: Builder(
          builder: (BuildContext context) {
            return IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () {
                Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => HomePage(user: user, cookies: cookies)));
              },
            );
          },
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
        iconTheme: IconThemeData(color: Colors.black),
        actions: <Widget> [
          IconButton(
            onPressed: (){
              Navigator.pop(context);
            },
            color: Colors.red,
            icon: Icon(Icons.logout),
          ),
        ]
    );
  }

  buildIconButtonLinkSettings(IconData icon, bool linked, Function linkFunc, Function unlinkFunc, String service) {
    return IconButton(
      icon: Icon(icon),
      color: linked == true ? Colors.green : Colors.red,
      onPressed: () {
        if (linked == false) {
          linkFunc();
          return;
        }
        unlinkFunc(service);
      },
    );
  }

  buildIconButtonsLinkSettings() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        buildIconButtonLinkSettings(BrandIcons.google, servicesStatus.google, googleLink, postAuthServicesUnLink, 'google'),
        buildIconButtonLinkSettings(BrandIcons.microsoft, servicesStatus.microsoft, microsoftLink, postAuthServicesUnLink, 'microsoft'),
        buildIconButtonLinkSettings(BrandIcons.github, servicesStatus.github, githubLink, postAuthServicesUnLink, 'github'),
        buildIconButtonLinkSettings(BrandIcons.reddit, servicesStatus.reddit, redditLink, postAuthServicesUnLink, 'reddit'),
        buildIconButtonLinkSettings(BrandIcons.twitch, servicesStatus.twitch, twitchLink, postAuthServicesUnLink, 'twitch'),
      ],
    );
  }

  buildInfoAccountSettings(String header, String description) {
    return Container(
      padding: EdgeInsets.only(left: 16),
      alignment: Alignment.topLeft,
      child: Column(
        children: [
          Container(
            margin: EdgeInsets.only(bottom: 4),
            alignment: Alignment.topLeft,
            child: prefabWidget.buildPrefabText(header, color: Colors.grey, fontSize: 14),
          ),
          Container(
              alignment: Alignment.topLeft,
              child:  prefabWidget.buildPrefabText(description, fontSize: 14)
          ),
        ],
      ),
    );
  }
  buildProfilSettings() {
    return Column(
        children: [
          Container(
            margin: EdgeInsets.all(8),
            child: Icon(Icons.account_circle_rounded,
              color: Colors.grey,
              size: 130,
            ),
          ),
          Container(
              margin: EdgeInsets.only(bottom: 8),
              child: prefabWidget.buildPrefabText(user.user.username, color: Colors.black, fontSize: 26, fontWeight: FontWeight.w400)
          ),
          buildIconButtonsLinkSettings(),
          Divider(),
          buildInfoAccountSettings('E-mail Address', user.user.email),
          Divider(),
          buildInfoAccountSettings('Role', user.user.role),
          Divider(),
        ]
    );
  }
}