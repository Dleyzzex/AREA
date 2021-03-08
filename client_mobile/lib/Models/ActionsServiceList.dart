class ActionData {
  final String id;
  final String name;
  final String description;
  final String type;
  final bool required;

  ActionData({this.id, this.name, this.description, this.type, this.required});

  factory ActionData.fromJson(Map<String, dynamic> json) {
    return ActionData(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      type: json['type'] as String,
      required: json['required'] as bool,
    );
  }
}

class ActionParametersListData {
  final String id;
  final String name;
  final String description;
  final List<ActionData> parameters;

  ActionParametersListData({this.id, this.name, this.description, this.parameters});

  factory ActionParametersListData.fromJson(Map<String, dynamic> json) {
    var listData = json['parameters'] as List;
    List<ActionData> data = listData.map((i) => ActionData.fromJson(i)).toList();

    return ActionParametersListData(
        id: json['id'] as String,
        name: json['name'] as String,
        description: json['description'] as String,
        parameters: data,
    );
  }
}

class ActionsServiceList {
  final List<ActionParametersListData> actionParametersListData;

  ActionsServiceList({this.actionParametersListData});

  factory ActionsServiceList.fromJson(List<dynamic> json) {
    List<ActionParametersListData> data = json.map((i) => ActionParametersListData.fromJson(i)).toList();
    return ActionsServiceList(
      actionParametersListData: data,
    );
  }
}