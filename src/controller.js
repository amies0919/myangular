'use strict';
var _ = require('lodash');
var CNTRL_REG = /^(\S+)(\s+as\s+(\w+))?/;
function $ControllerProvider() {
    var controllers = {};
    var globals = false;

    this.allowGlobals = function() {
        globals = true;
    };
    this.register = function (name, controller) {
        if(_.isObject(name)){
            _.extend(controllers, name);
        }else {
            controllers[name] = controller;
        }
    };
    this.$get = ['$injector',function ($injector) {
        function addToScope(locals, identifier, instance) {
            if(locals && _.isObject(locals.$scope)){
                locals.$scope[identifier] = instance;
            }else{
                throw 'Cannot export controller as' + identifier + '! NO $scope object provided via locals';
            }
            
        }
        return function (ctrl, locals,later, identifier) {
            if(_.isString(ctrl)){
                var match = ctrl.match(CNTRL_REG);
                ctrl = match[1];
                identifier = identifier || match[3];
                if (controllers.hasOwnProperty(ctrl)) {
                    ctrl = controllers[ctrl];
                } else {
                    ctrl = (locals && locals.$scope && locals.$scope[ctrl]) ||
                        (globals && window[ctrl]);
                }
            }
            var instance;
            if(later){
                var ctrlConstructor = _.isArray(ctrl) ? _.last(ctrl) : ctrl;
                instance = Object.create(ctrlConstructor.prototype);
                if(identifier){
                    addToScope(locals, identifier, instance);
                }
                return _.extend(function () {
                    $injector.invoke(ctrl, instance, locals);
                    return instance;
                }, {
                    instance: instance
                });

            }else{
                instance = $injector.instantiate(ctrl, locals);
                if(identifier){
                    addToScope(locals, identifier, instance);
                }
                return instance;
            }
        };
        
    }];
}
function identiferForController(ctrl) {
    if (_.isString(ctrl)) {
        var match = CNTRL_REG.exec(ctrl);
        if (match) {
            return match[3];
        }
    }
}
module.exports = {
    $ControllerProvider: $ControllerProvider,
    identiferForController: identiferForController
};