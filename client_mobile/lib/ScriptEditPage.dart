import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_app/Models/ServicesList.dart';
import 'HttpService.dart';
import 'Models/ActionsServiceList.dart';
import 'Models/ServicesList.dart';
import 'Models/User.dart';
import 'Models/UI/PrefabWidgets.dart';
import 'tools.dart';
import 'Models/Error.dart';

class ScriptEditPage extends StatefulWidget {
  @override
  final UserData user;
  final Map<String, String> cookies;
  ScriptEditPage({Key key, @required this.user, @required this.cookies}) : super(key: key);
  _ScriptEditPageState createState() => _ScriptEditPageState(user: user, cookies: cookies);
}


class _ScriptEditPageState extends State<ScriptEditPage> {
  HttpService _http;
  UserData user;
  String nameScript;
  Map<String, String> cookies;
  Map<String, Object> data;
  List<dynamic> reactionParameters;
  List<dynamic> actionParameters;
  double trigger = 1;
  ServicesList servicesList;
  ServicesListData currentServiceAction;
  ServicesListData currentServiceReaction;
  ActionParametersListData currentAction;
  ActionParametersListData currentReaction;
  ActionsServiceList actionsServiceList;
  ActionsServiceList reactionsServiceList;
  Map<String, dynamic> ListWidgetPrefabScripitEdit =  Map<String, dynamic>();
  bool isLoadingServicesList = true;
  bool isLoadingActionsServiceList = true;
  bool isLoadingReactionsServiceList = true;
  PrefabWidget prefabWidget = PrefabWidget();
  _ScriptEditPageState({@required this.user, @required this.cookies});

  Future postScriptEdit(Map<String, Object> data) async {
    Response response;
    try {
      response = await _http.postRequest('/scripts/create', data: data);
      if (response.statusCode == 200) {
        Navigator.pop(context);
      }
      else {
        Error err = Error.fromJson(response.data);
        createToast(err.message);
      }
    } on Exception catch (e) {
      print(e);
    }
  }
  Future getServicesList() async {
    Response response;
    try {
      isLoadingServicesList = true;
      response = await _http.getRequest('/services');
      isLoadingServicesList = false;
      if (response.statusCode == 200) {
        setState(() {
          servicesList = ServicesList.fromJson(response.data);
        });
      }
      else {
        Error err = Error.fromJson(response.data);
        createToast(err.message);
      }
    } on Exception catch (e){
      isLoadingServicesList = false;
      print(e);
    }
  }

  Future getActionsServiceList(String id) async {
    Response response;
    try {
      isLoadingActionsServiceList = true;
      response = await _http.getRequest('/services/$id/action');
      isLoadingActionsServiceList = false;
      if (response.statusCode == 200) {
        setState(() {
          actionsServiceList = ActionsServiceList.fromJson(response.data);
        });
      }
      else {
        Error err = Error.fromJson(response.data);
        createToast(err.message);
      }
    } on Exception catch (e){
      isLoadingActionsServiceList = false;
      print(e);
    }
  }

  Future getReactionsServiceList(String id) async {
    Response response;
    try {
      isLoadingReactionsServiceList = true;
      response = await _http.getRequest('/services/$id/reaction');
      isLoadingReactionsServiceList = false;
      if (response.statusCode == 200) {
        setState(() {
          reactionsServiceList = ActionsServiceList.fromJson(response.data);
        });
      }
      else {
        Error err = Error.fromJson(response.data);
        createToast(err.message);
      }
    } on Exception catch (e) {
      isLoadingReactionsServiceList = false;
      print(e);
    }
  }
  buildTime(int i, String type, String name) {
    final timeController = TextEditingController();
    return Container(
      margin: EdgeInsets.symmetric(vertical: 8),
      child: TextField(
        keyboardType: TextInputType.multiline,
        controller: timeController,
        cursorColor: Colors.black,
        readOnly: true,
        cursorWidth: 1,
        onTap: () async {
          var time =  await showTimePicker(
            context: context,
            initialTime: TimeOfDay.now(),
          );
          if (type == "action")
            actionParameters[i] = time.format(context);
          if (type == "reaction")
            reactionParameters[i] = time.format(context);
          timeController.text = time.format(context);
        },
        decoration: InputDecoration(
          labelText: name,
          contentPadding: EdgeInsets.all(15),
          border: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.blue, width: 1),
              borderRadius: BorderRadius.all(Radius.circular(4))
          ),
          focusedBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.blue, width: 1),
              borderRadius: BorderRadius.all(Radius.circular(4))
          ),
          prefixIcon: Icon(Icons.access_time_rounded),
        ),
      ),
    );
  }

  buildDate(int i, String type, String name) {
    final dateController = TextEditingController();
    return Container(
      margin: EdgeInsets.symmetric(vertical: 8),
      child: TextField(
        keyboardType: TextInputType.multiline,
        controller: dateController,
        cursorColor: Colors.black,
        readOnly: true,
        cursorWidth: 1,
        onTap: () async {
          var date =  await showDatePicker(
              context: context,
              initialDate:DateTime.now(),
              firstDate:DateTime(1900),
              lastDate: DateTime(2100));
          if (type == "action")
            actionParameters[i] = date.toString().substring(0,10);
          if (type == "reaction")
            reactionParameters[i] = date.toString().substring(0,10);
          dateController.text = date.toString().substring(0,10);
        },
        decoration: InputDecoration(
          labelText: name,
          contentPadding: EdgeInsets.all(15),
          border: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.blue, width: 1),
              borderRadius: BorderRadius.all(Radius.circular(4))
          ),
          focusedBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.blue, width: 1),
              borderRadius: BorderRadius.all(Radius.circular(4))
          ),
          prefixIcon: Icon(Icons.calendar_today),
        ),
      ),
    );
  }

  buildText(int i, String type, String name) {
    return Container(
      margin: EdgeInsets.symmetric(vertical: 8),
      child: TextField(
        keyboardType: TextInputType.multiline,
        cursorColor: Colors.black,
        cursorWidth: 1,
        onChanged: (text) {
          if (type == "action")
            actionParameters[i] = text;
          if (type == "reaction")
            reactionParameters[i] = text;
        },
        decoration: InputDecoration(
          labelText: name,
          contentPadding: EdgeInsets.all(15),
          border: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.blue, width: 1),
              borderRadius: BorderRadius.all(Radius.circular(4))
          ),
          focusedBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.blue, width: 1),
              borderRadius: BorderRadius.all(Radius.circular(4))
          ),
        ),
      ),
    );
    }

    buildEmail(int i, String type, String name) {
    return Container(
      margin: EdgeInsets.symmetric(vertical: 8),
      child: TextField(
        cursorColor: Colors.black,
        cursorWidth: 1,
        onChanged: (text) {
          if (type == "action")
            actionParameters[i] = text;
          if (type == "reaction")
            reactionParameters[i] = text;
        },
        decoration: InputDecoration(
          labelText: name,
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
    );
  }

  buildTextField(int i, String type, String name) {
    return Container(
      margin: EdgeInsets.symmetric(vertical: 8),
      child: TextField(
        maxLength: 200,
        keyboardType: TextInputType.multiline,
        maxLines: 10,
        cursorColor: Colors.black,
        cursorWidth: 1,
        onChanged: (text) {
          if (type == "action")
            actionParameters[i] = text;
          if (type == "reaction")
            reactionParameters[i] = text;
        },
        decoration: InputDecoration(
          labelText: name,
          contentPadding: EdgeInsets.all(15),
          border: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.blue, width: 1),
              borderRadius: BorderRadius.all(Radius.circular(4))
          ),
          focusedBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.blue, width: 1),
              borderRadius: BorderRadius.all(Radius.circular(4))
          ),
        ),
      ),
    );
  }

  buildListParametersForReaction(ActionData reactionData, int i) {
    return Column(
        children: [
          ListWidgetPrefabScripitEdit[reactionData.type](i, "reaction", reactionData.description),
        ]
    );
  }

  buildColumnParametersForReactions() {
    List<Widget> listAction = [];
    reactionParameters.length = currentReaction.parameters.length;
    for(int j = 0; j < currentReaction.parameters.length; j++) {
      listAction.add(buildListParametersForReaction(currentReaction.parameters[j], j));
    }
    return Column(
      children: listAction,
    );
  }

  buildButtonReactions(ActionParametersListData reactionParametersListData) {
    return ListTile(
      title: Text(reactionParametersListData.name,
        style: TextStyle(
          fontSize: 16,
        ),
      ),
      leading: Radio(
          value: reactionParametersListData,
          groupValue: currentReaction,
          onChanged: (ActionParametersListData value) {
            setState(() {
              currentReaction = value;
              data['reaction_id'] = currentReaction.id;
            });
          }
      ),
    );
  }

  buildColumnReactions() {
    List<Widget> listButtonsReaction = [];
    for(int i = 0; i < reactionsServiceList.actionParametersListData.length; i++) {
      listButtonsReaction.add(buildButtonReactions(reactionsServiceList.actionParametersListData[i]));
    }
    return Column(
      children: listButtonsReaction,
    );
  }

  buildListParametersForAction(ActionData actionData, int i) {
    return Column(
      children: [
        ListWidgetPrefabScripitEdit[actionData.type](i, "action", actionData.description),
      ]
    );
  }

  buildColumnParametersForAction() {
    List<Widget> listAction = [];
    actionParameters.length = currentAction.parameters.length;
    for(int j = 0; j < currentAction.parameters.length; j++)
        listAction.add(buildListParametersForAction(currentAction.parameters[j], j));
    return Column(
      children: listAction,
    );
  }

  buildButtonActions(ActionParametersListData actionParametersListData) {
    return ListTile(
      title: Text(actionParametersListData.name,
        style: TextStyle(
          fontSize: 16,
        ),
      ),
      leading: Radio(
          value: actionParametersListData,
          groupValue: currentAction,
          onChanged: (ActionParametersListData value) {
            setState(() {
              currentAction = value;
              data['action_id'] = currentAction.id;
            });
          }
      ),
    );
  }

  buildColumnActions() {
    List<Widget> listButtonsAction = [];
    for(int i = 0; i < actionsServiceList.actionParametersListData.length; i++)
      listButtonsAction.add(buildButtonActions(actionsServiceList.actionParametersListData[i]));
    return Column(
      children: listButtonsAction,
    );
  }

  buildButtonServiceForActions(ServicesListData servicesListData) {
    return ListTile(
      title: Text(servicesListData.name,
        style: TextStyle(
          fontSize: 16,
        ),
      ),
      leading: Radio(
        value: servicesListData,
        groupValue: currentServiceAction,
        onChanged: (ServicesListData value) {
          setState(() {
            currentServiceAction = value;
            currentAction = null;
          });
          getActionsServiceList(servicesListData.id);
        }
      ),
    );
  }

  buildButtonServiceForReactions(ServicesListData servicesListData) {
    return ListTile(
      title: Text(servicesListData.name,
        style: TextStyle(
          fontSize: 16,
        ),
      ),
      leading: Radio(
          value: servicesListData,
          groupValue: currentServiceReaction,
          onChanged: (ServicesListData value) {
            setState(() {
              currentServiceReaction = value;
              currentReaction = null;
            });
            getReactionsServiceList(servicesListData.id);
          }
      ),
    );
  }

  buildColumnServicesForReactions() {
    List<Widget> listButtonsService = [];
    for(int i = 0; i < servicesList.servicesListData.length; i++)
      listButtonsService.add(buildButtonServiceForReactions(servicesList.servicesListData[i]));
    return Column(
      children: listButtonsService,
    );
  }
  buildColumnServicesForActions() {
    List<Widget> listButtonsService = [];
    for(int i = 0; i < servicesList.servicesListData.length; i++)
      listButtonsService.add(buildButtonServiceForActions(servicesList.servicesListData[i]));
    return Column(
      children: listButtonsService,
    );
  }

  void initState() {
    _http = HttpService(user.access_token, cookies["refresh_token"]);
    ListWidgetPrefabScripitEdit = {
      'text': buildTextField,
      'email': buildEmail,
      'string': buildText,
      'date':   buildDate,
      'time':   buildTime,
    };
    data = {
      'action_id': null,
      'reaction_id': null,
      'name': null,
      'action_parameters': [],
      'reaction_parameters': [],
      'trigger': 0
    };
    reactionParameters = [];
    actionParameters = [];
    getServicesList();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          elevation: 0,
          backgroundColor: Colors.transparent,
          iconTheme: IconThemeData(color: Colors.black),
        ),
        body: SingleChildScrollView(
            child: Column(
              children: [
              Container(
              alignment: Alignment.center,
              margin: EdgeInsets.all(16),
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
              child: TextField(
                keyboardType: TextInputType.multiline,
                cursorColor: Colors.black,
                cursorWidth: 1,
                onChanged: (text) {
                  nameScript = text;
                },
                decoration: InputDecoration(
                  labelText: 'name script',
                  contentPadding: EdgeInsets.all(15),
                  border: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.blue, width: 1),
                      borderRadius: BorderRadius.all(Radius.circular(4))
                  ),
                  focusedBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Colors.blue, width: 1),
                      borderRadius: BorderRadius.all(Radius.circular(4))
                  ),
                ),
              ),
              ),
                Container(
                    alignment: Alignment.center,
                    margin: EdgeInsets.all(16),
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
                    child: Column(
                        children: [
                          Container(
                            margin: EdgeInsets.all(16),
                            child: prefabWidget.buildPrefabText('Select a service (Action)', fontSize: 24, fontWeight: FontWeight.w400),
                          ),
                          isLoadingServicesList == true ? Center(child: CircularProgressIndicator()) : buildColumnServicesForActions(),
                        ]
                    )
                ),
                Container(
                    alignment: Alignment.center,
                    margin: EdgeInsets.all(16),
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
                    child: Column(
                        children: [
                          Container(
                            margin: EdgeInsets.all(16),
                            child: prefabWidget.buildPrefabText('Select an action', fontSize: 24, fontWeight: FontWeight.w400),
                          ),
                          currentServiceAction == null ? Center(child: Text('None')) : isLoadingActionsServiceList == true ? Center(child: CircularProgressIndicator()) : buildColumnActions(),
                          Divider(),
                          currentAction == null ? Center(child: Text('None')) : isLoadingActionsServiceList == true ? Center(child: CircularProgressIndicator()) : buildColumnParametersForAction(),
                        ]
                    )
                ),
                Container(
                    alignment: Alignment.center,
                    margin: EdgeInsets.all(16),
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
                    child: Column(
                        children: [
                          Container(
                            margin: EdgeInsets.all(16),
                            child: prefabWidget.buildPrefabText('Select a service (Reaction)', fontSize: 24, fontWeight: FontWeight.w400),
                          ),
                          isLoadingServicesList == true ? Center(child: CircularProgressIndicator()) : buildColumnServicesForReactions(),
                        ]
                    )
                ),
                Container(
                    alignment: Alignment.center,
                    margin: EdgeInsets.all(16),
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
                    child: Column(
                        children: [
                          Container(
                            margin: EdgeInsets.all(16),
                            child: prefabWidget.buildPrefabText('Select a reaction', fontSize: 24, fontWeight: FontWeight.w400),
                          ),
                          currentServiceReaction == null ? Center(child: Text('None')) : isLoadingReactionsServiceList == true ? Center(child: CircularProgressIndicator()) : buildColumnReactions(),
                          Divider(),
                          currentReaction == null ? Center(child: Text('None')) : isLoadingReactionsServiceList == true ? Center(child: CircularProgressIndicator()) : buildColumnParametersForReactions(),
                        ]
                    )
                ),
                Container(
                    alignment: Alignment.center,
                    margin: EdgeInsets.only(top: 16, left: 16, right: 16, bottom: 96),
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
                    child: Column(
                        children: [
                          Container(
                            margin: EdgeInsets.all(16),
                            child: prefabWidget.buildPrefabText('Trigger', fontSize: 24, fontWeight: FontWeight.w400),
                          ),
                          Slider(
                            value: trigger,
                            divisions: 59,
                            min: 1,
                            max: 60,
                            label: trigger.round().toString(),
                            onChanged: (value) {
                              setState(() {
                                trigger = value;

                              });
                            },
                          ),
                        ]
                    )
                ),
              ],
            )
          ),
          floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
          floatingActionButton: FloatingActionButton(
            child: Icon(Icons.upload_rounded),
            onPressed: () {
              if(currentServiceAction == null || currentAction == null || currentServiceReaction == null || currentReaction == null || nameScript == null)
                return createToast('Please fill the Form');
              data['name'] = nameScript;
              data['reaction_parameters'] = reactionParameters;
              data['action_parameters'] = actionParameters;
              data['trigger'] = trigger.round();
              postScriptEdit(data);
            },
          ),
    );
  }
}