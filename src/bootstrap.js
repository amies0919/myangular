'use strict';
var $ = require('jquery');
var _ = require('lodash');
var publishExternalAPI = require('./angular_public');
var createInjector = require('./injector');
publishExternalAPI();
window.angular.bootstrap = function(element, modules, confg) {
    var $element = $(element);
    modules = modules || [];
    confg = confg || {};
    modules.unshift(['$provide', function($provide) {
        $provide.value('$rootElement', $element);
    }]);
    modules.unshift('ng');
    var injector = createInjector(modules, confg.strictDi);
    $element.data('$injector', injector);
    injector.invoke(['$compile', '$rootScope', function($compile, $rootScope) {
        $rootScope.$apply(function() {
            $compile($element)($rootScope);
        });
    }]);
    return injector;

};
var ngAttrPrefxes = ['ng-', 'data-ng-', 'ng:', 'x-ng-'];
$(document).ready(function() {
    var foundAppElement, foundModule,confg = {};
    _.forEach(ngAttrPrefxes, function(prefx) {
        var attrName = prefx + 'app';
        var selector = '[' + attrName.replace(':', '\\:') + ']';
        var element;
        if (!foundAppElement &&
            (element = document.querySelector(selector))) {
            foundAppElement = element;
        }
    });
    if (foundAppElement) {
        confg.strictDi = _.some(ngAttrPrefxes, function(prefx) {
            var attrName = prefx + 'strict-di';
            return foundAppElement.hasAttribute(attrName);
        });
        window.angular.bootstrap(
            foundAppElement,
            foundModule ? [foundModule] : [],
            confg
        );
    }
});