//////////////////////////////////////////////////////////////////////
//	$Date:: 2016-10-31 18:51:03 +0900#$
//	$Rev: 10276 $
//	Copyright (C) Hiroshi SUGIMURA 2013.09.27 - above.
//////////////////////////////////////////////////////////////////////
// "use strict";

//////////////////////////////////////////////////////////////////////
var hue = require("node-hue-api");  // 事前にnpmでnode-hue-apiをインストールしておく

// クラス変数
var HC = { hueip: null, api: null, state: null, devName: null, numOfLight: 0, lightsArray: [], EL: null };

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


//////////////////////////////////////////////////////////////////////
// local functions
// Bridgeの検索結果
HC.displayBridges = function(bridge)
{
	console.log("Hue Bridges Found: " + JSON.stringify(bridge));
	// fetch developer
	bridge.forEach( function(element) {
		var h = new hue.HueApi( element.ipaddress, HC.devName );

		h.config( function(err, config) {
			if (err) throw err;

			if( config.whitelist ) {
				// この中に入れたということはdevNameが正しい。ターゲットブリッジをこれに決める
				HC.hueip = element.ipaddress;
				HC.api = new hue.HueApi( HC.hueip, HC.devName );
				console.log("hue-BridgesIP: "+ HC.hueip);
				return;
			}else{
				console.log( "Not target or devName isn't registered: " + element.ipaddress );
			}
		});
	});
};

// 変更命令の結果
HC.displayResult = function(result)
{
	// console.log(JSON.stringify(result, null, 2));
};

// 変更命令のerror結果
HC.displayError = function(err)
{
	console.error(err);
};


//////////////////////////////////////////////////////////////////////
// publicメソッド

// initialize
HC.initialize = function(developper, num, el)
{
	console.log("hue initialize...");
	// デベロッパ名の決定
	HC.devName = developper;

	// Bridge検索
	// hue.locateBridges().then(HC.displayBridges).fail(HC.displayError).done();
	hue.nupnpSearch().then(HC.displayBridges).done();

	HC.numOfLight = num;

	HC.lightsArray[0] = { 'rem': 'Instance 0 is defined as all devices.'};  // 0はEL的にAllなので合わせる
	for( var i=1; i<=num; i++ ) {
		HC.lightsArray.push( JSON.parse(JSON.stringify(lightingsObj)) );  // deep copy
	}

	HC.EL = el;

	// console.dir( HC.lightsArray );
};

// 全情報のJSON取得
HC.getHueJSON = function(callback)
{
	// console.dir("hue get JSON.");

	if( HC.api != null ) { // すぐにhueが操作できるなら操作するし，
		HC.api.getFullState( function(err, config) {
			if (err) throw err;
			callback( config );
		});
	} else { // 出来ないなら1秒待って操作する
		setTimeout( function() { HC.getHueJSON(callback)} , 2000 );
	}
};

//////////////////////////////////////////////////////////////////////
// 電源状態ライブラリ

HC.setHueOn = function(channel)
{
	// console.dir("hue on.");
	if( HC.api != null ) { // すぐにhueが操作できるなら操作するし，
		state = {"on": true};
		HC.api.setLightState(channel, state).then(HC.displayResult).fail(HC.displayError).done();
	} else { // 出来ないなら1秒待って操作する
		setTimeout( function() { HC.setHueOn(channel)} , 2000 );
	}
};


HC.setHueOff = function(channel)
{
	// console.dir("hue off.");
	if( HC.api != null ) { // すぐにhueが操作できるなら操作するし，
		state = {"on": false};
		HC.api.setLightState(channel, state).then(HC.displayResult).fail(HC.displayError).done();
	} else { // 出来ないなら1秒待って操作する
		setTimeout( function() { HC.setHueOff(channel)} , 2000 );
	}
};


HC.getHueOnOff = function(channel, callback)
{
	// console.dir("hue get OnOff.");
	if( HC.api != null ) { // すぐにhueが操作できるなら操作するし，
		HC.api.getFullState( function(err, config) {
			if (err) throw err;
			callback( config.lights[channel].state.on ? "on":"off" );
		});
	} else { // 出来ないなら1秒待って操作する
		setTimeout( function() { HC.getHueOnOff(channel, callback)} , 2000 );
	}

};



//////////////////////////////////////////////////////////////////////
// HSV形式
HC.setHueHue = function(channel, hue)
{
	// console.dir("hue set hue.");
	if( HC.api != null ) { // すぐにhueが操作できるなら操作する
		state = {"on":true, "hue":hue};
		HC.api.setLightState(channel, state).then(HC.displayResult).fail(HC.displayError).done();
	} else { // 出来ないなら1秒待って操作する
		setTimeout( function() { HC.setHueHue(channel, hue)} , 2000 );
	}
};

HC.setHueSaturation = function(channel, saturation)
{
	// console.dir("hue set saturation.");
	if( HC.api != null ) { // すぐにhueが操作できるなら操作する
		state = {"on":true, "sat":saturation};
		HC.api.setLightState(channel, state).then(HC.displayResult).fail(HC.displayError).done();
	} else { // 出来ないなら1秒待って操作する
		setTimeout( function() { HC.setHueSaturation(channel, saturation)} , 2000 );
	}
};

HC.setHueBrightness = function(channel, brightness)
{
	// console.dir("hue set brightness.");
	if( HC.api != null ) { // すぐにhueが操作できるなら操作する
		state = {"on":true, "bri":brightness};
		HC.api.setLightState(channel, state).then(HC.displayResult).fail(HC.displayError).done();
	} else { // 出来ないなら1秒待って操作する
		setTimeout( function() { HC.setHueBrightness(channel, brightness)} , 2000 );
	}
};


HC.setHueHSV = function(channel, hue, saturation, brightness)
{
	// console.dir("hue set HSV: " + hue + ", " + saturation + ", " + brightness);
	if( HC.api != null ) { // すぐにhueが操作できるなら操作する
		state = {"on":true, "hue":hue, "sat":saturation, "bri":brightness};
		HC.api.setLightState(channel, state).then(HC.displayResult).fail(HC.displayError).done();
	} else { // 出来ないなら1秒待って操作する
		setTimeout( function() { HC.setHueHSV(channel, hue, saturation, brightness)} , 2000 );
	}
};


HC.getHueHSV = function(channel, callback)
{
	// console.dir("hue get HSV.");

	if( HC.api != null ) { // すぐにhueが操作できるなら操作する
		HC.api.getFullState( function(err, config) {
			if (err) throw err;

			callback( config.lights[channel].state.hue,
					  config.lights[channel].state.sat,
					  config.lights[channel].state.bri );
		});
	} else { // 出来ないなら1秒待って操作する
		setTimeout( function() { HC.getHueHSV(channel, callback)} , 2000 );
	}

};

//////////////////////////////////////////////////////////////////////
// RGB入力を受けつけて内部ではxyYに変換して利用する，ただしYはbri
HC.setHueRGB = function(channel, red, green, blue)
{
	// まず（r, g, b）をリニアな諧調表現（Vr, Vg, Vb）に変換する
	var r = red / 255.0;
	var g = green / 255.0;
	var b = blue / 255.0;

	var vr = 0;
	var vg = 0;
	var vb = 0;

	if( r <= 0.03928 ) {
		vr = r/12.92;
	} else {
		vr = Math.pow( (r + 0.055)/1.055, 2.4 );
	}

	if( g <= 0.03928 ) {
		vg = g/12.92;
	} else {
		vg = Math.pow( (g + 0.055)/1.055, 2.4);
	}

	if( b <= 0.03928 ) {
		vb = b/12.92;
	} else {
		vb = Math.pow( (b + 0.055)/1.055, 2.4);
	}

	var X = vr * 0.4124 + vg * 0.3576 + vb * 0.1805;
	var Y = vr * 0.2126 + vg * 0.7152 + vb * 0.0722;
	var Z = vr * 0.0193 + vg * 0.1192 + vb * 0.9505;

	var x = X / (X + Y + Z);
	var y = Y / (X + Y + Z);

	var bri = Math.round( Math.pow(Y, 1/2.0) * 255 );
	if( bri > 255 ) { bri = 255 };

	HC.setHueXY( channel, x, y );
	HC.setHueBrightness( channel, bri );
};


// xyYをとってRGBをゲットする，ただしYはbri
HC.getHueRGB = function(channel, callback)
{
	if( HC.api != null ) { // すぐにhueが操作できるなら操作する
		HC.api.getFullState( function(err, config) {
			if (err) throw err;

			var x = config.lights[channel].state.xy[0];
			var y = config.lights[channel].state.xy[1];
			var Y = config.lights[channel].state.bri / 255.0;

			var X = ( x / y );
			var Z = ((1.0 - x - y) / y);

			var vr = ( X * 3.241  - 1 * 1.5374 - Z * 0.4986 ) * Y;
			var vg = (-X * 0.9692 + 1 * 1.8760 + Z * 0.0416 ) * Y;
			var vb = ( X * 0.0556 - 1 * 0.2040 + Z * 1.0570 ) * Y;

			var r = 0;
			var g = 0;
			var b = 0;

			if( vr <= 0.00304 ) {
				r = vr * 12.92;
			} else {
				r = Math.pow( (vr * 1.055, 1.0/2.4) - 0.055 );
			}

			if( vg <= 0.00304 ) {
				vg = g/12.92;
			} else {
				g = Math.pow( (vg * 1.055, 1.0/2.4) - 0.055 );
			}

			if( vb <= 0.00304 ) {
				vb = b/12.92;
			} else {
				b = Math.pow( (vb * 1.055, 1.0/2.4) - 0.055 );
			}

			r = Math.round(vr * 255); if (r > 255) { r = 255 };
			g = Math.round(vg * 255); if (g > 255) { g = 255 };
			b = Math.round(vb * 255); if (b > 255) { b = 255 };

			callback( r, g, b );
		});
	} else { // 出来ないなら1秒待って操作する
		setTimeout( function() { HC.getHueRGB(channel, callback)} , 2000 );
	}

};


//////////////////////////////////////////////////////////////////////
// XY方式
HC.setHueXY = function(channel, x, y)
{
	// console.dir("hue set YX: " + x + ", " + y );

	if( HC.api != null ) { // すぐにhueが操作できるなら操作する
		state = {"on":true, "xy":[x,y] };
		HC.api.setLightState(channel, state).then(HC.displayResult).fail(HC.displayError).done();
	} else { // 出来ないなら1秒待って操作する
		setTimeout( function() { HC.setHueXY(channel, x, y)} , 2000 );
	}
};


HC.getHueXY = function(channel, callback)
{
	// console.dir("hue get XY.");

	if( HC.api != null ) { // すぐにhueが操作できるなら操作する
		HC.api.getFullState( function(err, config) {
			if (err) throw err;

			callback( config.lights[channel].state.xy );
		});
	} else { // 出来ないなら1秒待って操作する
		setTimeout( function() { HC.getHueXY(channel, callback)} , 2000 );
	}

};


//////////////////////////////////////////////////////////////////////
// EL処理
HC.ELprocess = function( rinfo, els )
{
	var check = 1; // インスタンスと照合するか？1ならする

	// コントローラがGetしてくるので，対応してあげる
	// 一般照明を指定してきたかチェック
	if( els.DEOJ == '029000' ) { // 全ライトを制御，チェックしない
		check = 0;
	}

	var instance = HC.EL.toHexArray( els.DEOJ.substr( 4, 2) ) [0];

	// インスタンスとの照合をして操作
	HC.lightsArray.forEach( function(val, index, ar) {
		if( index != 0 ) { // 0はやらない
			if( check == 0 || instance == index ) {
				// ESVで振り分け，主に0x60系列に対応すればいい
				switch( els.ESV ) {
					////////////////////////////////////////////////////////////////////////////////////
					// 0x6x
				  case HC.EL.SETI:   // "60
					for( var epc in els.DETAILs ) {
						switch( epc ) {
						  case '80':  // 電源セット
							switch( els.DETAILs[epc] ) {
							  case '30':
								ar[index]["80"] = [0x30];
								HC.setHueOn(index);
								HC.EL.sendOPC1( rinfo.address, [0x02, 0x90, index], HC.EL.toHexArray(els.SEOJ), 0x73, HC.EL.toHexArray(epc), ar[index]["80"] );
								break;

							  case '31':
								ar[index]["80"] = [0x31];
								HC.EL.sendOPC1( rinfo.address, [0x02, 0x90, index], HC.EL.toHexArray(els.SEOJ), 0x73, HC.EL.toHexArray(epc), ar[index]["80"] );
								HC.setHueOff(index);
								break;

							  default:
								return;
								break;
							}
							break;
						  case 'c0':  // 色のセット
						  case 'C0':  // 色のセット
							var color = HC.EL.toHexArray( els.DETAILs[epc] );
							ar[index]["c0"] = color;
							HC.setHueRGB( index, color[0], color[1], color[2] );
							break;
						  default:  // 未実装EPC
							console.log( "warning epc: " + epc );
							return;
							break;
						}
					}
					break;

				  case HC.EL.SETC: // "61"，返信必要あり
					for( var epc in els.DETAILs ) {
						switch( epc ) {
						  case '80':  // 電源セット
							switch( els.DETAILs[epc] ) {
							  case '30':
								ar[index]["80"] = [0x30];
								HC.setHueOn(index);
								HC.EL.sendOPC1( rinfo.address, [0x02, 0x90, index], HC.EL.toHexArray(els.SEOJ), 0x71, HC.EL.toHexArray(epc), [] );
								HC.EL.sendOPC1( rinfo.address, [0x02, 0x90, index], HC.EL.toHexArray(els.SEOJ), 0x73, HC.EL.toHexArray(epc), ar[index]["80"] );
								break;

							  case '31':
								ar[index]["80"] = [0x31];
								HC.setHueOff(index);
								HC.EL.sendOPC1( rinfo.address, [0x02, 0x90, index], HC.EL.toHexArray(els.SEOJ), 0x71, HC.EL.toHexArray(epc), [] );
								HC.EL.sendOPC1( rinfo.address, [0x02, 0x90, index], HC.EL.toHexArray(els.SEOJ), 0x73, HC.EL.toHexArray(epc), ar[index]["80"] );
								break;

							  default:
								return;
								break;
							}
							break;
						  case 'c0':  // 色のセット
						  case 'C0':  // 色のセット
							var color = HC.EL.toHexArray( els.DETAILs[epc] );
							ar[index]["c0"] = color;
							HC.setHueRGB( index, color[0], color[1], color[2] );
							HC.EL.sendOPC1( rinfo.address, [0x02, 0x90, index], HC.EL.toHexArray(els.SEOJ), 0x71, HC.EL.toHexArray(epc), ar[index][epc] );
							break;
						  default:  // 未実装EPC
							console.log( "warning epc: " + epc );
							return;
							break;
						}
					}
					break;

				  case HC.EL.GET: // 0x62，Get
					for( var epc in els.DETAILs ) {
						// console.log( "get epc is " + epc );
						if( ar[index][epc] ) { // 持ってるEPCのとき
							HC.EL.sendOPC1( rinfo.address, [0x02, 0x90, index], HC.EL.toHexArray(els.SEOJ), 0x72, HC.EL.toHexArray(epc), ar[index][epc] );
						} else { // 持っていないEPCのとき, SNA
							HC.EL.sendOPC1( rinfo.address, [0x02, 0x90, index], HC.EL.toHexArray(els.SEOJ), 0x52, HC.EL.toHexArray(epc), [0x00] );
						}
					}
					break;

				  case HC.EL.INFREQ: // 0x63
					break;

				  case HC.EL.SETGET: // "6e"
					break;

				  default:
					// console.log( "???" );
					// console.dir( els );
					break;
				}
			}
		}
	});
};




module.exports = HC;

//////////////////////////////////////////////////////////////////////
// EOF
//////////////////////////////////////////////////////////////////////
