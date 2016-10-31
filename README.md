# Overview

このモジュールは**Philips hueをECHONET Liteプロトコルに対応**させるプログラムを作るものです．
ECHONET Liteプロトコルはスマートハウス機器の通信プロトコルです．



内部ではnode-hue-apiとechonet-liteモジュールに依存しています．

The module 'hue-echonet-lite' depends on node-hue-api and echonet-lite.


## Install

下記コマンドでモジュールをインストールできます．

You can install the module as following command.

    > npm install node-hue-api
    > npm install echonet-lite
    > npm install hue-echonet-lite



## Demos

    // ECHONET Lite
    var EL = require('echonet-lite');
    objList = ['029001', '029002', '029003'];

    // Philips hue
    var hueEL = require('hue-echonet-lite');
    hueEL.initialize("hue-developper", 3, EL);  // developer name, number of lightings

    // ノードプロファイルに関しては内部処理するので，ユーザーはエアコンに関する受信処理だけを記述する．
    var elsocket = EL.initialize( objList, function( rinfo, els ) {

    	switch( els.DEOJ ) {
    	  case '029000':  /// 一般照明か確認しておく
    	  case '029001':
    	  case '029002':
    	  case '029003':
    		hueEL.ELprocess( rinfo, els );
    		break;

    	  case '0ef000':  // ノードプロファイル
    	  case '0ef001':
    		break;

    	  default:
    		console.log( "EOJ is not found: " + els.DEOJ );
    		break;
    	}

    	// console.dir( EL.facilities );
    });

    //////////////////////////////////////////////////////////////////////
    // 全て立ち上がったのでINFで照明ONの宣言，本当はゲートウェイから点灯状態を持ってくるべきかも
    EL.sendOPC1( '224.0.23.0', [0x02,0x90,0x01], [0x0e,0xf0,0x01], 0x73, 0x80, [0x30]);
    EL.sendOPC1( '224.0.23.0', [0x02,0x90,0x02], [0x0e,0xf0,0x01], 0x73, 0x80, [0x30]);
    EL.sendOPC1( '224.0.23.0', [0x02,0x90,0x03], [0x0e,0xf0,0x01], 0x73, 0x80, [0x30]);



## Data stracture

各hueのライトは下記のオブジェクトを基礎として生成されます。

    // 照明オブジェクトのクラス（のようなもの）
    var lightingsObj = {
    	// super
    	"80": [0x30],  // 動作状態
    	"81": [0xff],  // 設置場所
    	"82": [0x00, 0x00, 0x66, 0x00], // EL version, 1.1
    	"88": [0x42],  // 異常状態
    	"8a": [0x00, 0x00, 0x77], // maker code
    	"9d": [0x04, 0x80, 0xc0],        // inf map, 1 Byte目は個数
    	"9e": [0x04, 0x80, 0xc0],        // set map, 1 Byte目は個数
    	"9f": [0x0b, 0x80, 0x81, 0x82, 0x88, 0x8a, 0x9d, 0x9e, 0x9f, 0xb6, 0xc0], // get map, 1 Byte目は個数
    	// child
    	"b6": [0x45], // 点灯モード設定
    	"c0": [0x40, 0x40, 0x40] // カラー灯モード時RGB設定
    };


このオブジェクトが配列になったものが，

    HC.lightsArray: []

です。



## APIs

    //////////////////////////////////////////////////////////////////////
    // 基本的なAPI

    // initialize
    HC.initialize = function(developper, num, el)
    // 全情報のJSON取得
    HC.getHueJSON = function(callback)


    //////////////////////////////////////////////////////////////////////
    // 電源状態
    HC.setHueOn = function(channel)
    HC.setHueOff = function(channel)
    HC.getHueOnOff = function(channel, callback)


    //////////////////////////////////////////////////////////////////////
    // HSV形式
    HC.setHueHue = function(channel, hue)
    HC.setHueSaturation = function(channel, saturation)
    HC.setHueBrightness = function(channel, brightness)
    HC.setHueHSV = function(channel, hue, saturation, brightness)
    HC.getHueHSV = function(channel, callback)


    //////////////////////////////////////////////////////////////////////
    // RGB入力を受けつけて内部ではxyYに変換して利用する，ただしYはbri
    HC.setHueRGB = function(channel, red, green, blue)
    // xyYをとってRGBをゲットする，ただしYはbri
    HC.getHueRGB = function(channel, callback)


    //////////////////////////////////////////////////////////////////////
    // XY方式
    HC.setHueXY = function(channel, x, y)
    HC.getHueXY = function(channel, callback)



## 攻略情報

Demosを見てください。


## Author

神奈川工科大学  創造工学部  ホームエレクトロニクス開発学科．

Dept. of Home Electronics, Faculty of Creative Engineering, Kanagawa Institute of Technology.


杉村　博

SUGIMURA, Hiroshi



## Log

0.0.2 node-hue-api 2.3.0に対応，dependenciesの追加とnupnpSearch対応。

0.0.1 とりあえず作る．

