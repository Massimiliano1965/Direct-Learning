var exec = require("cordova/exec");
var P = "CiaoRemind";
function call(action, args, ok, err) { exec(ok || function () {}, err || function () {}, P, action, args || []); }
module.exports = {
  status: function (ok, err) { call("status", [], ok, err); },
  setConfig: function (cfg, ok, err) { call("setConfig", [cfg || {}], ok, err); },
  studied: function (ok, err) { call("studied", [], ok, err); },
  takeStudy: function (ok, err) { call("takeStudy", [], ok, err); },
  test: function (ok, err) { call("test", [], ok, err); },
  openOverlaySettings: function (ok, err) { call("openOverlaySettings", [], ok, err); },
  openAppInfo: function (ok, err) { call("openAppInfo", [], ok, err); }
};
