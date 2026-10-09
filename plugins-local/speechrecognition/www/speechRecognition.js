module.exports = {
  isRecognitionAvailable: function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'SpeechRecognition', 'isRecognitionAvailable', []);
  },
  startListening: function(successCallback, errorCallback, options) {
    options = options || {};
    cordova.exec(successCallback, errorCallback, 'SpeechRecognition', 'startListening', [ options.language, options.matches, options.prompt, options.showPartial, options.showPopup ]);
  },
  // CIAO: rimette l'audio abbassato durante l'ascolto (contro il «bip» di Google), prima che parli l'insegnante
  unmuteBeep: function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'SpeechRecognition', 'unmuteBeep', []);
  },
  stopListening: function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'SpeechRecognition', 'stopListening', []);
  },
  getSupportedLanguages: function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'SpeechRecognition', 'getSupportedLanguages', []);
  },
  hasPermission: function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'SpeechRecognition', 'hasPermission', []);
  },
  requestPermission: function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'SpeechRecognition', 'requestPermission', []);
  }
};
