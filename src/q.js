'use strict';
var _ = require('lodash');
function $QProvider() {
    this.$get = ['$rootScope',function ($rootScope) {
        function Promise() {
            this.$$state = {};
        }
        Promise.prototype.then = function (onfulfilled, onRejected) {
            var result = new Deferred();
            this.$$state.pending = this.$$state.pending || [];
            this.$$state.pending.push([result, onfulfilled, onRejected]);
            if(this.$$state.status > 0){
                processQueue(this.$$state);
            }
            return result.promise;
        };
        Promise.prototype.catch = function (onrejected) {
            return this.then(null, onrejected);
        };
        Promise.prototype.finally = function (callback) {
            return this.then(function () {
                callback();
            },function () {
                callback();
            });
        };
        function Deferred(){
            this.promise = new Promise();
        }
        Deferred.prototype.resolve = function (value) {
            if(this.promise.$$state.status){
                return;
            }
            this.promise.$$state.value = value;
            this.promise.$$state.status = 1;
            scheduleProcessQueue(this.promise.$$state);
        };
        Deferred.prototype.reject = function (reason) {
            if(this.promise.$$state.status){
                return;
            }
            this.promise.$$state.value = reason;
            this.promise.$$state.status = 2;
            scheduleProcessQueue(this.promise.$$state);
        };
        function scheduleProcessQueue(state) {
            $rootScope.$evalAsync(function () {
               processQueue(state);
            });
        }
        function processQueue(state) {
            var pending = state.pending;
            state.pending = undefined;
            _.forEach(pending,function (handlers) {
                var deferred = handlers[0];
                var fn = handlers[state.status];
                if(_.isFunction(fn)) {
                    deferred.resolve(fn(state.value));
                }else if(state.status == 1){
                    deferred.resolve(state.value);
                }else{
                    deferred.reject(state.value);
                }
            });
        }
        function defer() {
            return new Deferred();
        }

        return {
            defer:defer
        };
        
    }];
}
module.exports = $QProvider;