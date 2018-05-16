// Generated by CoffeeScript 2.2.4
(function() {
  // require '../../../../testml-compiler/lib/testml-compiler/prelude'
  var lodash, operator;

  require('../testml');

  lodash = require('lodash');

  operator = {
    '==': 'eq',
    '.': 'call',
    '=>': 'func',
    '%()': 'pickloop',
    '*': 'point'
  };

  module.exports = TestML.Run = class Run {
    constructor(testml, bridge) {
      this.testml = testml;
      this.bridge = bridge;
      if (!TestML.browser) {
        global._ = lodash;
      }
    }

    from_file(testml_file) {
      this.testml_file = testml_file;
      this.testml = JSON.parse(this.read_file(this.testml_file));
      return this;
    }

    test() {
      this.initialize();
      this.test_begin();
      this.exec(this.code);
      return this.test_end();
    }

    initialize() {
      this.code = this.testml.code;
      this.code.unshift('=>', []);
      this.data = _.map(this.testml.data, (block) => {
        return new TestML.Block(block);
      });
      if (!this.bridge) {
        module.paths.unshift(process.env.TESTML_INPUT_DIR);
        return this.bridge = new (require(process.env.TESTML_BRIDGE));
      }
    }

    exec(expr, context = []) {
      var args, call, name, return_;
      if (!_.isArray(expr)) {
        return [expr];
      }
      args = _.clone(expr);
      call = args.shift();
      if (name = operator[call]) {
        return_ = this[`exec_${name}`](...args);
      } else {
        args = _.map(args, (x) => {
          if (_.isArray(x)) {
            return this.exec(x)[0];
          } else {
            return x;
          }
        });
        args.unshift(...(_.reverse(context)));
        if (call.match(/^[a-z]/)) {
          call = call.replace(/-/g, '_');
          if (!this.bridge[call]) {
            throw `Can't find bridge function: '${call}'`;
          }
          return_ = this.bridge[call](...args);
        } else if (call.match(/^[A-Z]/)) {
          call = _.lowerCase(call);
          if (!this.stdlib.can($call)) {
            throw `Unknown TestML Standard Library function: '${call}'`;
          }
          return_ = this.stdlib[call](...args);
        } else {
          throw `Can't resolve TestML function '${call}'`;
        }
      }
      if (return_ === void 0) {
        return [];
      } else {
        return [return_];
      }
    }

    exec_call(...args) {
      var call, context, i, len;
      context = [];
      for (i = 0, len = args.length; i < len; i++) {
        call = args[i];
        context = this.exec(call, context);
      }
      if (context.length) {
        return context[0];
      }
    }

    exec_eq(left, right) {
      var got, want;
      got = String(this.exec(left)[0]);
      want = String(this.exec(right)[0]);
      return this.test_eq(got, want, this.block.label);
    }

    exec_func(signature, ...statements) {
      var i, len, results, statement;
      results = [];
      for (i = 0, len = statements.length; i < len; i++) {
        statement = statements[i];
        results.push(this.exec(statement));
      }
      return results;
    }

    exec_pickloop(list, expr) {
      var block, i, j, len, len1, pick, point, ref;
      ref = this.data;
      for (i = 0, len = ref.length; i < len; i++) {
        block = ref[i];
        pick = true;
        for (j = 0, len1 = list.length; j < len1; j++) {
          point = list[j];
          if (point.match(/^\*/)) {
            if (block.point[point.slice(1)] == null) {
              pick = false;
              break;
            }
          } else if (point.match(/^\!\*/)) {
            if (block.point[point.slice(2)] != null) {
              pick = false;
              break;
            }
          }
        }
        if (pick) {
          this.block = block;
          this.exec(expr);
        }
      }
      return this.block = void 0;
    }

    exec_point(name) {
      return this.block.point[name];
    }

    read_file(file_path) {
      var fs;
      fs = require('fs');
      if (file_path === '-') {
        return fs.readFileSync('/dev/stdin').toString();
      } else {
        return fs.readFileSync(file_path).toString();
      }
    }

  };

  TestML.Block = class {
    constructor({
        label,
        point: point1
      }) {
      this.label = label;
      this.point = point1;
    }

  };

}).call(this);