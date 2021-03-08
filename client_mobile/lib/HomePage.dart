import 'dart:ui';
import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'Models/ScriptsList.dart';
import 'Models/User.dart';
import 'ScriptEditPage.dart';
import 'SettingsPage.dart';
import 'tools.dart';
import 'Models/Error.dart';
import 'HttpService.dart';

class HomePage extends StatefulWidget {
  final UserData user;
  final Map<String, String> cookies;
  HomePage({Key key, @required this.user, @required this.cookies}) : super(key: key);
  _HomePageState createState() => _HomePageState(user: user, cookies: cookies);
}

class _HomePageState extends State<HomePage> {
  HttpService _http;
  UserData user;
  Map<String, String> cookies;
  var page;
  ScriptsList scriptslist;
  bool isLoadingScriptsList = false;
  final RefreshController _refreshController = RefreshController();
  _HomePageState({@required this.user, @required this.cookies});

  Future deleteScript(String id) async {
    Response response;
    try {
      response = await _http.deleteRequest('/scripts/$id');
      if (response.statusCode != 200) {
        Error err = Error.fromJson(response.data);
        createToast(err.message);
      }
    } on Exception catch (e) {
      print(e);
    }
  }

  Future postScriptUpdate(String id, String status) async {
    Response response;
    try {
      response = await _http.postRequest('/scripts/$id/update', data: {
        'status': status
      });
      if (response.statusCode != 200) {
        Error err = Error.fromJson(response.data);
        createToast(err.message);
      }
    } on Exception catch (e) {
      print(e);
    }
  }

  Future getScriptsList() async {
    Response response;
    try {
      isLoadingScriptsList = true;
      response = await _http.getRequest('/scripts');
      isLoadingScriptsList = false;
      if (response.statusCode == 200) {
        setState(() {
          scriptslist = ScriptsList.fromJson(response.data);
        });
      }
      else {
        Error err = Error.fromJson(response.data);
        createToast(err.message);
      }
    } on Exception catch (e){
      isLoadingScriptsList = false;
      print(e);
    }
  }

  buildContainerScript() {
    List<Widget> list =  [];
    for (int i = 0; i < scriptslist.scriptData.length; i++)
      list.add(Container(
        alignment: Alignment.center,
        margin: EdgeInsets.only(top: 8, bottom: 8, left: 16, right: 16),
        padding: EdgeInsets.all(16),
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
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(scriptslist.scriptData[i].name),
              Container(
                child: Row(
                  children: [
                    Container(
                        width: 5,
                        height: 5,
                        decoration: BoxDecoration(
                          color: scriptslist.scriptData[i].status == "running" ? Colors.green : scriptslist.scriptData[i].status == "stopped" ? Colors.orange : Colors.red,
                          shape: BoxShape.circle,
                        )
                    ),
                    IconButton(
                        icon: scriptslist.scriptData[i].status == "running" ? Icon(Icons.pause) : scriptslist.scriptData[i].status == "stopped" ? Icon(Icons.play_arrow) : Icon(Icons.stop),
                        onPressed: () async {
                          if (scriptslist.scriptData[i].status == "running") {
                            await postScriptUpdate(scriptslist.scriptData[i].id, "stopped");
                          } else {
                            await postScriptUpdate(scriptslist.scriptData[i].id, "running");
                          }
                          await getScriptsList();
                        }
                    ),
                    Divider(),
                    IconButton(
                        icon: Icon(Icons.delete_forever),
                        color: Colors.red,
                        onPressed: () async {
                          await deleteScript(scriptslist.scriptData[i].id);
                          await getScriptsList();
                        }
                    )
                  ],
                )
              )
            ]
        ),
    ));
    return list;
  }

  @override
  void initState() {
    _http = HttpService(user.access_token, cookies["refresh_token"]);
    getScriptsList();
    super.initState();
  }

  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          elevation: 0,
          backgroundColor: Colors.transparent,
          iconTheme: IconThemeData(color: Colors.black),
          automaticallyImplyLeading: false,
          actions: <Widget>[
            PopupMenuButton(
                onSelected: (value) {
                  setState(() {
                    page = value;
                    if (page == 0)
                      Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => SettingsPage(user: user, cookies: cookies)));
                    else
                      Navigator.pop(context);
                  });
                },
                icon: Icon(Icons.menu),
                itemBuilder: (context) => [
                  PopupMenuItem(
                      value: 0,
                      child: Text('Settings')
                  ),
                  PopupMenuItem(
                      value: 1,
                      child: Text('Logout',
                        style: TextStyle(
                            color: Colors.red
                        ),
                      )
                  )
                ]
            ),
          ]
      ),
      body:
      Container(
        child : Column(
          children: [
            Expanded(
              child: SmartRefresher(
                controller: _refreshController,
                enablePullDown: true,
                onRefresh: () async {
                  await getScriptsList();
                  _refreshController.refreshCompleted();
                },
                child: scriptslist == null ? Center(child: Text('none')) : Column(children: buildContainerScript()),
              ),
            ),
          ],
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: FloatingActionButton(
        child: Icon(Icons.add),
        onPressed: () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => ScriptEditPage(user: user, cookies: cookies,))).then((value) => getScriptsList());
        },
      ),
    );
  }
}