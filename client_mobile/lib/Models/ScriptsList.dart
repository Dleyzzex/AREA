

class ScriptData {
  final String id;
  final String name;
  final String status;

  ScriptData({this.id, this.name, this.status});

  factory ScriptData.fromJson(Map<String, dynamic> json) {
    return ScriptData(
        id: json['id'] as String,
        name: json['name'] as String,
        status: json['status'] as String,
    );
  }
}

class ScriptsList {
  final List<ScriptData> scriptData;

  ScriptsList({this.scriptData});

  factory ScriptsList.fromJson(List<dynamic> json) {
    List<ScriptData> data = json.map((i) => ScriptData.fromJson(i)).toList();
    return ScriptsList(
      scriptData: data,
    );
  }
}