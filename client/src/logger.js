/* global angular */

// Logging with a few extra bells and whistles.
angular.module('koast.logger', [])
  .factory('_koastLogger', [
    function() {

      var service = {};
      service.levels = {
        debug: 0,
        verbose: 1,
        info: 2,
        warn: 3,
        error: 4
      };
      var logLevel = 0;
      service.colors = {};
      service.setLogLevel = function(newLevel) {
        logLevel = newLevel;
      };

      function log(options, groupOptions, values) {
        options = arguments[0] || {};

        if (options.level && options.level < logLevel) {
          return;
        };

        var color = options.color || 'black';
        var args = [];
        var noMoreColors = false;
        values = Array.prototype.slice.call(values, 0);
        var colored = [];
        if (typeof values[0] === 'string') {
          colored.push('%c' + values.shift());
          args.push('color:' + color + ';');
        }

        if (groupOptions.groupName) {
          colored.unshift('%c[' + groupOptions.groupName + ']');
          args.unshift('color:gray;');
        }
        if (options.symbol) {
          colored.unshift('%c' + options.symbol);
          args.unshift('color:' + color + ';font-weight:bold;font-size:150%;');
        }
        args.unshift(colored.join(' '));
        args = args.concat(values);
        Function.prototype.apply.call(console.log, console, args);
      }

      function makeLoggerFunction(options) {
        return function(groupOptions, args) {
          log(options, groupOptions, args);
        }
      }

      var logFunctions = {
        debug: makeLoggerFunction({
          color: 'gray',
          symbol: '✍'
        }),
        verbose: makeLoggerFunction({
          color: 'cyan',
          symbol: '☞'
        }),
        info: makeLoggerFunction({
          color: '#0074D9',
          symbol: '☞'
        }),
        warn: makeLoggerFunction({
          color: 'orange',
          symbol: '⚐'
        }),
        error: makeLoggerFunction({
          color: 'red',
          symbol: '⚑'
        }),
      };

      var methodNames = ['debug', 'verbose', 'info', 'warn', 'error'];

      service.makeLogger = function (options) {
        var logger = {};
        if (typeof options === 'string') {
          options = {
            groupName: options
          };
        }
        logger.options = options;
        methodNames.forEach(function(methodName) {
          logger[methodName] = function() {
            var args = arguments;
            return logFunctions[methodName](logger.options, args);
          }
        });

        return logger;
      }

      var defaultLogger = service.makeLogger({});

      methodNames.forEach(function(methodName) {
        service[methodName] = defaultLogger[methodName];
      });

      return service;
    }
  ]);