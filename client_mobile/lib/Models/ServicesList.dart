class ServicesListData {
  final String id;
  final String name;
  final String description;

  ServicesListData({this.id, this.name, this.description});

  factory ServicesListData.fromJson(Map<String, dynamic> json) {
    return ServicesListData(
        id: json['id'] as String,
        name: json['name'] as String,
        description: json['description'] as String,
    );
  }
}

class ServicesList {
  final List<ServicesListData> servicesListData;

  ServicesList({this.servicesListData});

  factory ServicesList.fromJson(List<dynamic> json) {
    List<ServicesListData> data = json.map((i) => ServicesListData.fromJson(i)).toList();
    return ServicesList(
      servicesListData: data,
    );
  }
}