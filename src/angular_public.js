'use strict';
var setupModuleLoader = require('./loader');
function publishExternalAPI() {
    setupModuleLoader(window);
    var ngModule = window.angular.module('ng', []);
    ngModule.provider('$filter', require('./filter'));
    ngModule.provider('$parse', require('./parse'));
    ngModule.provider('$rootScope', require('./scope'));
    ngModule.provider('$q', require('./q').$QProvider);
    ngModule.provider('$$q', require('./q').$$Qprovider);
    ngModule.provider('$httpBackend', require('./http_backend'));
    ngModule.provider('$http', require('./http').$HttpProvider);
    ngModule.provider('$httpParamSerializer', require('./http').$HttpParamSerializerProvider);
    ngModule.provider('$HttpParamSerializerJQLike', require('./http').$HttpParamSerializerJQLikeProvider);
    ngModule.provider('$compile', require('./compile'));
    ngModule.provider('$controller', require('./controller').$ControllerProvider);
    ngModule.provider('$interpolate', require('./interpolate'));
    ngModule.directive('ngController', require('./directives/ng_controller'));
    ngModule.directive('ngTransclude', require('./directives/ng_transclude'));
    ngModule.directive('ngClick', require('./directives/ng_click'));
}
module.exports = publishExternalAPI;