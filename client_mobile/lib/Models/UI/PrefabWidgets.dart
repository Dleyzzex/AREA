import 'package:flutter/material.dart';

class PrefabWidget {
  buildPrefabText(String data, {Color color = Colors.black, double fontSize = 26, FontWeight fontWeight = FontWeight.normal}) {
    return Text(data,
      style: TextStyle(
        color: color,
        fontSize: fontSize,
        fontWeight: fontWeight,
      ),
    );
  }
}