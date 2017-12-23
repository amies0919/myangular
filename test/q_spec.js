'use strict';
var publishExternalAPI = require('../src/angular_public');
var createInjector = require('../src/injector');
describe('$q', function () {
    var $q;
    beforeEach(function () {
       publishExternalAPI();
       $q = createInjector(['ng']).get('$q');
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
});