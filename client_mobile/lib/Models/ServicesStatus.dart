class ServicesStatus {
  bool google = false;
  bool github = false;
  bool microsoft = false;
  bool reddit = false;
  bool twitch = false;

  ServicesStatus({this.google, this.github, this.microsoft, this.reddit, this.twitch});

  factory ServicesStatus.fromJson(Map<String, dynamic> json) {
    return ServicesStatus(
        google: json['google'] as bool,
        github: json['github'] as bool,
        microsoft: json['microsoft'] as bool,
        reddit: json['reddit'] as bool,
        twitch: json['twitch'] as bool
    );
  }
}