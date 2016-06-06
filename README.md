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
    hueEL.initialize("sugimulabo", 3, EL);  // developer name, number of lightings

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
    // 全て立ち上がったのでINFで照明ONの宣言，本当はゲートウェイから点灯状態を持ってくるべき
    EL.sendOPC1( '224.0.23.0', [0x02,0x90,0x01], [0x0e,0xf0,0x01], 0x73, 0x80, [0x30]);
    EL.sendOPC1( '224.0.23.0', [0x02,0x90,0x02], [0x0e,0xf0,0x01], 0x73, 0x80, [0x30]);
    EL.sendOPC1( '224.0.23.0', [0x02,0x90,0x03], [0x0e,0xf0,0x01], 0x73, 0x80, [0x30]);





## Data stracture



## API



## 攻略情報



## Author

神奈川工科大学  創造工学部  ホームエレクトロニクス開発学科．

Dept. of Home Electronics, Faculty of Creative Engineering, Kanagawa Institute of Technology.


杉村　博

SUGIMURA, Hiroshi



## Log


0.0.1 とりあえず作る．

