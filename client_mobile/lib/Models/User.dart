class User {
  final String id;
  final String email;
  final String username;
  final String role;
  final String provider;


  User({this.id, this.email, this.username, this.role, this.provider});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      username: json['username'],
      role: json['role'],
      provider: json['provider']
    );
  }
}

class UserData {
  final User user;
  final String access_token;

  UserData({this.user, this.access_token});
  factory UserData.fromJson(Map<String, dynamic> json) {
    return UserData(
      user: User.fromJson(json['user']),
      access_token: json['access_token'],
    );
  }
}