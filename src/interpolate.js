'use strict';
var _ = require('lodash');
function $InterpolateProvider() {
    this.$get = ['$parse', function($parse) {
        function $interpolate(text, mustHaveExpressions) {
            var index = 0;
            var parts = [];
            var expressions = [];
            var expressionFns = [];
            var expressionPositions = [];
            var startIndex, endIndex,exp, expFn;
            while (index < text.length) {
                startIndex = text.indexOf('{{',index);
                if (startIndex !== -1) {
                    endIndex = text.indexOf('}}', startIndex + 2);
                }
                if (startIndex !== -1 && endIndex !== -1) {
                    if (startIndex !== index) {
                        parts.push(unescapeText(text.substring(index, startIndex)));
                    }
                    exp = text.substring(startIndex + 2, endIndex);
                    expFn = $parse(exp);
                    parts.push(expFn);
                    expressions.push(exp);
                    expressionFns.push(expFn);
                    expressionPositions.push(parts.length);
                    index = endIndex + 2;
                }else{
                    parts.push(unescapeText(text.substring(index)));
                    break;
                }
            }
            function unescapeText(text) {
                return text.replace(/\\{\\{/g, '{{')
                    .replace(/\\}\\}/g, '}}');
            }
            function stringify(value) {
                if (_.isNull(value) || _.isUndefined(value)) {
                    return '';
                } else if (_.isObject(value)) {
                    return JSON.stringify(value);
                } else {
                    return '' + value;
                }
            }
            function compute(context) {
                return _.reduce(parts, function(result, part) {
                    if (_.isFunction(part)) {
                        return result + stringify(part(context));
                    } else {
                        return result + part;
                    }
                }, '');
            }
            if (expressions.length || !mustHaveExpressions) {
                return _.extend(function interpolationFn(context) {
                    return compute(context);
                },{
                    expressions: expressions,
                    $$watchDelegate: function(scope, listener) {
                        var lastValue;
                        return scope.$watchGroup(expressionFns, function(newValues, oldValues) {
                            var newValue = compute(scope);
                            listener(
                                newValue,
                                (newValues === oldValues ? newValue : lastValue),
                                scope
                            );
                            lastValue = newValue;
                        });
                    }
                });
            }
        }
        return $interpolate;
    }];
}
module.exports = $InterpolateProvider;