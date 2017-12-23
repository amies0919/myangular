'use strict';
function $QProvider() {
    this.$get = function () {
        function Promise() {
            this.$$state = {};
        }
        Promise.prototype.then = function (onfulfilled) {
            this.$$state.pending = onfulfilled;
        };
        function Deferred(){
            this.promise = new Promise();
        }
        Deferred.prototype.resolve = function (value) {
            this.promise.$$state.pending(value);
        };
        function defer() {
            return new Deferred();
        }

        return {
            defer:defer
        };
        
    };
}
module.exports = $QProvider;