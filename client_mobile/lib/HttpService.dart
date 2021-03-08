import 'package:dio/dio.dart';
import 'config.dart';

class HttpService {
  Dio _dio;
  final _baseUrl = 'http://$server/';
  String _bearer;
  String _refresh;
  int _protect = 0;

  HttpService(String bearer, String refresh){
    _bearer = bearer;
    _refresh = refresh;
    _dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
    ));
    _dio.options.headers["authorization"] = "Bearer " + _bearer;
    _dio.options.headers["cookie"] = "refresh_token=" + _refresh;
    initializeInterceptor();
  }

  Future<Response> getRequest(String endPoint, {Map<String, Object> queryParameters}) async{
    Response response;
    try{
      response = await _dio.get(endPoint, queryParameters: queryParameters);
    } on DioError catch(e){
      print(e.message);
      throw Exception(e.message);
    }
    return response;
  }

  Future<Response> postRequest(String endPoint, {Map<String, Object> data}) async{
    Response response;
    try{
      response = await _dio.post(endPoint, data: data);
    } on DioError catch(e){
      print(e.message);
      throw Exception(e.message);
    }
    return response;
  }

  Future<Response> deleteRequest(String endPoint, {Map<String, Object> queryParameters}) async{
    Response response;
    try{
      response = await _dio.delete(endPoint, queryParameters: queryParameters);
    } on DioError catch(e){
      print(e.message);
      throw Exception(e.message);
    }
    return response;
  }

  initializeInterceptor(){
    _dio.interceptors.add(InterceptorsWrapper(
      onError: (error) async {
        if (error.response.statusCode == 401 && _protect == 0) {
          _protect++;
          RequestOptions options = error.response.request;
          Response response = await _dio.post('/auth/refresh-token');
          if (response.statusCode == 200) {
            _protect = 0;
            _bearer = response.data['access_token'];
            _dio.options.headers["authorization"] = "Bearer " + _bearer;
            options.headers["authorization"] = "Bearer " + _bearer;
            return _dio.request(options.path,options: options);
          }
        } else {
          _protect = 0;
          return error;
        }
      },
      onRequest: (request) {
        print("${request.method} ${request.path}");
      },
      onResponse: (response){
        print(response.data);
      }
    ));
  }
}