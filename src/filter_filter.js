'use strict';
var _ = require('lodash');
function filterFilter(){
    return function (array, filterExpr) {
        var predicateFn;
        if(_.isFunction(filterExpr)){
            predicateFn = filterExpr;
        }else if(_.isString(filterExpr)){
            predicateFn = createPredicateFn(filterExpr);
        }else {
            return array;
        }
        return _.filter(array, predicateFn);
    };
}
function createPredicateFn(expression) {
    function deepCompare(actual,expected,comparator) {
        if(_.isObject(actual)){
            return _.some(actual, function (value) {
                return comparator(value, expected);
            });
        } else {
            return comparator(actual,expected);
        }
    }
    function comparator(actual, expected) {
        actual = actual.toLowerCase();
        expected = expected.toLowerCase();
        return actual.indexOf(expected) !== -1;
    }
    return function predicateFn(item) {
        return deepCompare(item, expression, comparator);
    };
}
module.exports = filterFilter;