'use strict';
var publishExternalAPI = require('../src/angular_public');
var createInjector = require('../src/injector');
var _ = require('lodash');
describe('$q', function () {
    var $q, $rootScope;
    beforeEach(function () {
       publishExternalAPI();
       var injector = createInjector(['ng']);
       $q = injector.get('$q');
       $rootScope = injector.get('$rootScope');
    });
    it('can create a deferred', function () {
        var d = $q.defer();
        expect(d).toBeDefined();
    });
    it('has a promise for each Deferred',function () {
        var d = $q.defer();
        expect(d.promise).toBeDefined();
    });
    it('can resolve a promise', function (done) {
        var defferred = $q.defer();
        var promise = defferred.promise;

        var promiseSpy = jasmine.createSpy();
        promise.then(promiseSpy);

        defferred.resolve('a-ok');
        setTimeout(function () {
           expect(promiseSpy).toHaveBeenCalledWith('a-ok');
           done();
        },1);
    });
    it('works when resolved before promise listener', function (done) {
        var d = $q.defer();
        d.resolve(42);
        var promiseSpy = jasmine.createSpy();
        d.promise.then(promiseSpy);

        setTimeout(function () {
            expect(promiseSpy).toHaveBeenCalledWith(42);
            done();
        },0);
    });
    it('does not resolve promise immediately', function () {
        var d = $q.defer();
        var promiseSpy = jasmine.createSpy();
        d.promise.then(promiseSpy);
        d.resolve(42);
        expect(promiseSpy).not.toHaveBeenCalled();
    });
    it('resolves promise at next digest', function () {
       var d = $q.defer();
       var promiseSpy = jasmine.createSpy();
       d.promise.then(promiseSpy);
       d.resolve(42);
       $rootScope.$apply();
       expect(promiseSpy).toHaveBeenCalledWith(42);
    });
    it('may only be resolved once', function () {
       var d = $q.defer();
       var promiseSpy = jasmine.createSpy();
       d.promise.then(promiseSpy);

       d.resolve(42);
       d.resolve(43);
       $rootScope.$apply();
       expect(promiseSpy.calls.count()).toEqual(1);
       expect(promiseSpy).toHaveBeenCalledWith(42);
    });
    it('may only ever be resolved once',function () {
        var d = $q.defer();
        var promiseSpy = jasmine.createSpy();
        d.promise.then(promiseSpy);
        d.resolve(42);
        $rootScope.$apply();
        expect(promiseSpy).toHaveBeenCalledWith(42);
        d.resolve(43);
        $rootScope.$apply();
        expect(promiseSpy.calls.count()).toEqual(1);
    });
    it('resolves a listener added after resolution', function () {
       var d = $q.defer();
       d.resolve(42);
       $rootScope.$apply();
       var promiseSpy = jasmine.createSpy();
       d.promise.then(promiseSpy);
       $rootScope.$apply();
       expect(promiseSpy).toHaveBeenCalledWith(42);
    });
    it('may have multiple callbacks', function () {
       var d = $q.defer();
       var firstPromise = jasmine.createSpy();
       var secondPromise = jasmine.createSpy();
       d.promise.then(firstPromise);
       d.promise.then(secondPromise);

       d.resolve(42);
       $rootScope.$apply();
       expect(firstPromise).toHaveBeenCalledWith(42);
       expect(secondPromise).toHaveBeenCalledWith(42);
    });

    it('invokes each callback once', function () {
       var d = $q.defer();
       var firstSpy = jasmine.createSpy();
       var secondSpy = jasmine.createSpy();
       d.promise.then(firstSpy);
       d.resolve(42);
       $rootScope.$apply();
       expect(firstSpy.calls.count()).toBe(1);
       expect(secondSpy.calls.count()).toBe(0);
       d.promise.then(secondSpy);
       $rootScope.$apply();
        expect(firstSpy.calls.count()).toBe(1);
        expect(secondSpy.calls.count()).toBe(1);

    });
    it('can reject a deferred', function () {
        var d = $q.defer();
        var fullfillSpy = jasmine.createSpy();
        var rejectSpy = jasmine.createSpy();
        d.promise.then(fullfillSpy, rejectSpy);
        d.reject('fail');
        $rootScope.$apply();
        expect(fullfillSpy).not.toHaveBeenCalled();
        expect(rejectSpy).toHaveBeenCalledWith('fail');
    });
    it('can reject just once', function () {
        var d = $q.defer();
        var rejectSpy = jasmine.createSpy();
        d.promise.then(null, rejectSpy);
        d.reject('fail');
        $rootScope.$apply();
        expect(rejectSpy.calls.count()).toBe(1);
        d.reject('fail again');
        $rootScope.$apply();
        expect(rejectSpy.calls.count()).toBe(1);
    });
    it('cannot fulfill a promise once rejected', function () {
       var d = $q.defer();
       var fulfillSpy = jasmine.createSpy();
       var rejectSpy = jasmine.createSpy();
       d.promise.then(fulfillSpy, rejectSpy);
       d.reject('fail');
       $rootScope.$apply();
       d.resolve('success');
       $rootScope.$apply();
       expect(fulfillSpy).not.toHaveBeenCalled();
    });
    it('does not require a failure handler each time', function () {
        var d = $q.defer();
        var fulfillSpy = jasmine.createSpy();
        var rejectSpy = jasmine.createSpy();
        d.promise.then(fulfillSpy);
        d.promise.then(null,rejectSpy);
        d.reject('fail');
        $rootScope.$apply();
        expect(rejectSpy).toHaveBeenCalledWith('fail');
    });
    it('does not require a success handler each time', function () {
        var d = $q.defer();
        var fulfillSpy = jasmine.createSpy();
        var rejectSpy = jasmine.createSpy();
        d.promise.then(fulfillSpy);
        d.promise.then(null,rejectSpy);
        d.resolve('ok');
        $rootScope.$apply();
        expect(fulfillSpy).toHaveBeenCalledWith('ok');
    });
    it('can register rejection handler with catch', function () {
        var d = $q.defer();
        var rejectSpy = jasmine.createSpy();
        d.promise.catch(rejectSpy);
        d.reject('fail');
        $rootScope.$apply();
        expect(rejectSpy).toHaveBeenCalled();
    });
    it('invokes a finally handler when fulfilled', function () {
       var d = $q.defer();
       var finallySpy = jasmine.createSpy();
       d.promise.finally(finallySpy);
       d.resolve(42);
       $rootScope.$apply();
       expect(finallySpy).toHaveBeenCalled();
    });
    it('invokes a finally handler when rejected', function () {
        var d = $q.defer();
        var finallySpy = jasmine.createSpy();
        d.promise.finally(finallySpy);
        d.reject('fail');
        $rootScope.$apply();
        expect(finallySpy).toHaveBeenCalledWith();
    });
    it('allows chaining handlers', function () {
       var d = $q.defer();
       var fulfilledSpy = jasmine.createSpy();
       d.promise.then(function (result) {
           return result + 1;
       }).then(function (result) {
           return result * 2;
       }).then(fulfilledSpy);
       d.resolve(20);
       $rootScope.$apply();
       expect(fulfilledSpy).toHaveBeenCalledWith(42);
    });
    it('does not modify original resolution in chains', function () {
        var d = $q.defer();
        var fulfilledSpy = jasmine.createSpy();
        d.promise.then(function (result) {
            return result + 1;
        }).then(function (result) {
            return result * 2;
        });
        d.promise.then(fulfilledSpy);
        d.resolve(20);
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith(20);
    });
    it('catches rejection on chained handler', function () {
       var d = $q.defer();
       var rejectedSpy = jasmine.createSpy();
       d.promise.then(_.noop).catch(rejectedSpy);
       d.reject('fail');
       $rootScope.$apply();
       expect(rejectedSpy).toHaveBeenCalledWith('fail');
    });
    it('fulfills on chained handler', function () {
        var d = $q.defer();
        var fulfilledSpy = jasmine.createSpy();
        d.promise.catch(_.noop).then(fulfilledSpy);
        d.resolve(42);
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith(42);
    });
    it('treats catch return value as resolution', function () {
        var d = $q.defer();
        var fulfillSpy = jasmine.createSpy();
        d.promise.catch(function (value) {
            return 42;
        }).then(fulfillSpy);
        d.reject('fail');
        $rootScope.$apply();
        expect(fulfillSpy).toHaveBeenCalledWith(42);
    });
    it('rejects chained promise when handler throws', function () {
        var d = $q.defer();
        var rejectSpy = jasmine.createSpy();
        d.promise.then(function () {
            throw 'fail';
        }).catch(rejectSpy);
        d.resolve(42);
        $rootScope.$apply();
        expect(rejectSpy).toHaveBeenCalledWith('fail');
    });
    it('does not reject current promise when handler throws', function () {
       var d = $q.defer();
       var rejectSpy = jasmine.createSpy();
       d.promise.then(function () {
           throw 'fail';
       });
       d.promise.catch(rejectSpy);
       d.resolve(42);
       $rootScope.$apply();
       expect(rejectSpy).not.toHaveBeenCalled();
    });
    it('waits on promise returned from handler', function () {
        var d = $q.defer();
        var fulfilledSpy = jasmine.createSpy();
        d.promise.then(function (v) {
            var d2 = $q.defer();
            d2.resolve(v+1);
            return d2.promise;
        }).then(function (v) {
            return v*2;
        }).then(fulfilledSpy);
        d.resolve(20);
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith(42);
    });
    it('waits on promise given to resolve', function () {
        var d = $q.defer();
        var d2 = $q.defer();
        var fulfilledSpy = jasmine.createSpy();
        d.promise.then(fulfilledSpy);
        d2.resolve(42);
        d.resolve(d2.promise);
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith(42);
    });
    it('rejects when promise returned from handler rejects', function () {
       var d = $q.defer();
       var rejectSpy = jasmine.createSpy();
       d.promise.then(function () {
           var d2 = $q.defer();
           d2.reject('fail');
           return d2.promise;
       }).catch(rejectSpy);
       d.resolve('ok');
       $rootScope.$apply();
       expect(rejectSpy).toHaveBeenCalledWith('fail');
    });
    it('allows chaining handlers on finally, with original value', function () {
        var d = $q.defer();
        var fulfilledSpy = jasmine.createSpy();
        d.promise.then(function (result) {
            return result +1;
        }).finally(function (result) {
            return result*2;
        }).then(fulfilledSpy);
        d.resolve(20);
        $rootScope.$apply();
        expect(fulfilledSpy).toHaveBeenCalledWith(21);
    });
    it('allows chaining handlers on finally, with original rejection', function () {
        var d = $q.defer();
        var rejectSpy = jasmine.createSpy();
        d.promise.then(function (result) {
            throw 'fail';
        }).finally(function () {

        }).catch(rejectSpy);
        d.resolve(20);
        $rootScope.$apply();
        expect(rejectSpy).toHaveBeenCalledWith('fail');
    });
    it('resolves to orig value when nested promise resolves', function () {
       var d = $q.defer();
       var fulfilledSpy = jasmine.createSpy();
       var resolveNested;
       d.promise.then(function (result) {
           return result + 1;
       }).finally(function (result) {
            var d2 = $q.defer();
            resolveNested = function () {
                d2.resolve('abc');
            };
            return d2.promise;
       }).then(fulfilledSpy);
       d.resolve(20);
       $rootScope.$apply();
       expect(fulfilledSpy).not.toHaveBeenCalled();
       resolveNested();
       $rootScope.$apply();
       expect(fulfilledSpy).toHaveBeenCalledWith(21);
    });
    it('rejects to orig value when nested promise resolves', function () {
       var d = $q.defer();
       var rejectSpy = jasmine.createSpy();
       var resolveNested;
       d.promise.then(function (result) {
           throw 'fail';
       }).finally(function (result) {
           var d2 = $q.defer();
           resolveNested = function () {
               d2.resolve('abc');
           };
           return d2.promise;
       }).catch(rejectSpy);
       d.resolve(20);
       $rootScope.$apply();
       expect(rejectSpy).not.toHaveBeenCalled();
       resolveNested();
       $rootScope.$apply();
       expect(rejectSpy).toHaveBeenCalledWith('fail');
    });
    it('rejects when nested promise rejects in finally', function () {
       var d = $q.defer();
       var fulfilledSpy = jasmine.createSpy();
       var rejectedSpy = jasmine.createSpy();
       var rejectNested;
       d.promise.then(function (result) {
           return result + 1;
       }).finally(function (result) {
           var d2 = $q.defer();
           rejectNested = function () {
               d2.reject('fail');

           };
           return d2.promise;
       }).then(fulfilledSpy, rejectedSpy);
       d.resolve(20);
       $rootScope.$apply();
       expect(fulfilledSpy).not.toHaveBeenCalled();
       rejectNested();
       $rootScope.$apply();
       expect(fulfilledSpy).not.toHaveBeenCalled();
       expect(rejectedSpy).toHaveBeenCalledWith('fail');
    });
    it('can report progress', function () {
       var d = $q.defer();
       var progressSpy = jasmine.createSpy();
       d.promise.then(null, null, progressSpy);
       d.notify('working...');
       $rootScope.$apply();
       expect(progressSpy).toHaveBeenCalledWith('working...');
    });
    it('can report progress many times', function () {
        var d = $q.defer();
        var progressSpy = jasmine.createSpy();
        d.promise.then(null, null, progressSpy);
        d.notify('40%');
        $rootScope.$apply();
        d.notify('60%');
        d.notify('80%');
        $rootScope.$apply();
        expect(progressSpy.calls.count()).toBe(3);
    });
    it('does not notify progress after being resolved', function () {
       var d = $q.defer();
       var progressSpy = jasmine.createSpy();
       d.promise.then(null, null, progressSpy);
       d.resolve('ok');
       d.notify('working...');
       $rootScope.$apply();
       expect(progressSpy).not.toHaveBeenCalled();
    });
    it('does not notify progress after being rejected', function () {
       var d = $q.defer();
       var progressSpy = jasmine.createSpy();
       d.promise.then(null, null, progressSpy);
       d.reject('fail');
       d.notify('working...');
       $rootScope.$apply();
       expect(progressSpy).not.toHaveBeenCalled();
    });
    it('can notify progress through chain', function () {
       var d = $q.defer();
       var progressSpy = jasmine.createSpy();
       d.promise.then(_.noop).catch(_.noop).then(null, null, progressSpy);
       d.notify('working...');
       $rootScope.$apply();
       expect(progressSpy).toHaveBeenCalledWith('working...');
    });
    it('transforms progress through handlers', function () {
       var d = $q.defer();
       var progressSpy = jasmine.createSpy();
       d.promise.then(_.noop).then(null, null, function (progress) {
           return '***' + progress + '***';
       }).catch(_.noop).then(null, null, progressSpy);
       d.notify('working...');
       $rootScope.$apply();
       expect(progressSpy).toHaveBeenCalledWith('***working...***');
    });
    it('recovers from progressback exceptions', function () {
       var d = $q.defer();
       var progressSpy = jasmine.createSpy();
       var fulfilledSpy = jasmine.createSpy();
       d.promise.then(null, null, function (progress) {
           throw 'fail';
       });
       d.promise.then(fulfilledSpy, null, progressSpy);
       d.notify('working...');
       d.resolve('ok');
       $rootScope.$apply();
       expect(progressSpy).toHaveBeenCalledWith('working...');
       expect(fulfilledSpy).toHaveBeenCalledWith('ok');
    });
    it('can notify progress through promise returned from handler', function () {
       var d = $q.defer();
       var progressSpy = jasmine.createSpy();
       d.promise.then(null, null, progressSpy);
       var d2 = $q.defer();
       d.resolve(d2.promise);
       d2.notify('working...');
       $rootScope.$apply();
       expect(progressSpy).toHaveBeenCalledWith('working...');
    });
    it('allows attaching progressback in finally', function () {
        var d = $q.defer();
        var progressSpy = jasmine.createSpy();
        d.promise.finally(null, progressSpy);
        d.notify('working...');
        $rootScope.$apply();
        expect(progressSpy).toHaveBeenCalledWith('working...');

    });

});