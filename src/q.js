'use strict';
var _ = require('lodash');
function $QProvider() {
    this.$get = ['$rootScope',function ($rootScope) {
        function Promise() {
            this.$$state = {};
        }
        Promise.prototype.then = function (onfulfilled, onRejected, onProgress) {
            var result = new Deferred();
            this.$$state.pending = this.$$state.pending || [];
            this.$$state.pending.push([result, onfulfilled, onRejected, onProgress]);
            if(this.$$state.status > 0){
                processQueue(this.$$state);
            }
            return result.promise;
        };
        Promise.prototype.catch = function (onrejected) {
            return this.then(null, onrejected);
        };
        function makePromise(value, resolved) {
            var d = new Deferred();
            if(resolved){
                d.resolve(value);
            }else{
                d.reject(value);
            }
            return d.promise;
        }
        function handleFinallyCallback(callback, value, resolved) {
            var callbackValue = callback();
            if(callbackValue && callbackValue.then){
                return callbackValue.then(function () {
                    return makePromise(value,resolved);
                });
            }else {
                return makePromise(value,resolved);
            }
        }
        Promise.prototype.finally = function (callback, progressBack) {
            return this.then(function (value) {
                return handleFinallyCallback(callback, value, true);
            },function (rejection) {
                return handleFinallyCallback(callback, rejection, false);
            }, progressBack);
        };
        function Deferred(){
            this.promise = new Promise();
        }
        Deferred.prototype.resolve = function (value) {
            if(this.promise.$$state.status){
                return;
            }
            if(value && _.isFunction(value.then)){
                value.then(
                    _.bind(this.resolve, this),
                    _.bind(this.reject, this),
                    _.bind(this.notify, this));
            }else {
                this.promise.$$state.value = value;
                this.promise.$$state.status = 1;
                scheduleProcessQueue(this.promise.$$state);
            }
        };
        Deferred.prototype.reject = function (reason) {
            if(this.promise.$$state.status){
                return;
            }
            this.promise.$$state.value = reason;
            this.promise.$$state.status = 2;
            scheduleProcessQueue(this.promise.$$state);
        };
        Deferred.prototype.notify = function (progress) {
            var pending = this.promise.$$state.pending;
            if(pending && pending.length && !this.promise.$$state.status){
                $rootScope.$evalAsync(function () {
                    _.forEach(pending, function (handlers) {
                        var deferred = handlers[0];
                        var progressBack = handlers[3];
                        try {
                            deferred.notify((_.isFunction(progressBack)) ? progressBack(progress) : progress);
                        }catch(e){
                            console.log(e);
                        }
                    });
                });
            }
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
                try {
                    if (_.isFunction(fn)) {
                        deferred.resolve(fn(state.value));
                    } else if (state.status == 1) {
                        deferred.resolve(state.value);
                    } else {
                        deferred.reject(state.value);
                    }
                }catch (e){
                    deferred.reject(e);
                }
            });
        }
        function defer() {
            return new Deferred();
        }
        function reject(rejection) {
            var d = defer();
            d.reject(rejection);
            return d.promise;
        }
        function when(value) {
            var d = defer();
            d.resolve(value);
            return d.promise;
        }

        return {
            defer:defer,
            reject: reject,
            when: when
        };
        
    }];
}
module.exports = $QProvider;