import require$$0 from 'tty';
import require$$2 from 'path';
import require$$1$1 from 'url';
import require$$1 from 'fs';
import require$$0$1 from 'util';

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var picocolors = {exports: {}};

let tty = require$$0;

let isColorSupported =
	!("NO_COLOR" in process.env || process.argv.includes("--no-color")) &&
	("FORCE_COLOR" in process.env ||
		process.argv.includes("--color") ||
		process.platform === "win32" ||
		(tty.isatty(1) && process.env.TERM !== "dumb") ||
		"CI" in process.env);

let formatter =
	(open, close, replace = open) =>
	input => {
		let string = "" + input;
		let index = string.indexOf(close, open.length);
		return ~index
			? open + replaceClose(string, close, replace, index) + close
			: open + string + close
	};

let replaceClose = (string, close, replace, index) => {
	let start = string.substring(0, index) + replace;
	let end = string.substring(index + close.length);
	let nextIndex = end.indexOf(close);
	return ~nextIndex ? start + replaceClose(end, close, replace, nextIndex) : start + end
};

let createColors = (enabled = isColorSupported) => ({
	isColorSupported: enabled,
	reset: enabled ? s => `\x1b[0m${s}\x1b[0m` : String,
	bold: enabled ? formatter("\x1b[1m", "\x1b[22m", "\x1b[22m\x1b[1m") : String,
	dim: enabled ? formatter("\x1b[2m", "\x1b[22m", "\x1b[22m\x1b[2m") : String,
	italic: enabled ? formatter("\x1b[3m", "\x1b[23m") : String,
	underline: enabled ? formatter("\x1b[4m", "\x1b[24m") : String,
	inverse: enabled ? formatter("\x1b[7m", "\x1b[27m") : String,
	hidden: enabled ? formatter("\x1b[8m", "\x1b[28m") : String,
	strikethrough: enabled ? formatter("\x1b[9m", "\x1b[29m") : String,
	black: enabled ? formatter("\x1b[30m", "\x1b[39m") : String,
	red: enabled ? formatter("\x1b[31m", "\x1b[39m") : String,
	green: enabled ? formatter("\x1b[32m", "\x1b[39m") : String,
	yellow: enabled ? formatter("\x1b[33m", "\x1b[39m") : String,
	blue: enabled ? formatter("\x1b[34m", "\x1b[39m") : String,
	magenta: enabled ? formatter("\x1b[35m", "\x1b[39m") : String,
	cyan: enabled ? formatter("\x1b[36m", "\x1b[39m") : String,
	white: enabled ? formatter("\x1b[37m", "\x1b[39m") : String,
	gray: enabled ? formatter("\x1b[90m", "\x1b[39m") : String,
	bgBlack: enabled ? formatter("\x1b[40m", "\x1b[49m") : String,
	bgRed: enabled ? formatter("\x1b[41m", "\x1b[49m") : String,
	bgGreen: enabled ? formatter("\x1b[42m", "\x1b[49m") : String,
	bgYellow: enabled ? formatter("\x1b[43m", "\x1b[49m") : String,
	bgBlue: enabled ? formatter("\x1b[44m", "\x1b[49m") : String,
	bgMagenta: enabled ? formatter("\x1b[45m", "\x1b[49m") : String,
	bgCyan: enabled ? formatter("\x1b[46m", "\x1b[49m") : String,
	bgWhite: enabled ? formatter("\x1b[47m", "\x1b[49m") : String,
});

picocolors.exports = createColors();
picocolors.exports.createColors = createColors;

const SINGLE_QUOTE = "'".charCodeAt(0);
const DOUBLE_QUOTE = '"'.charCodeAt(0);
const BACKSLASH = '\\'.charCodeAt(0);
const SLASH = '/'.charCodeAt(0);
const NEWLINE = '\n'.charCodeAt(0);
const SPACE = ' '.charCodeAt(0);
const FEED = '\f'.charCodeAt(0);
const TAB = '\t'.charCodeAt(0);
const CR = '\r'.charCodeAt(0);
const OPEN_SQUARE = '['.charCodeAt(0);
const CLOSE_SQUARE = ']'.charCodeAt(0);
const OPEN_PARENTHESES = '('.charCodeAt(0);
const CLOSE_PARENTHESES = ')'.charCodeAt(0);
const OPEN_CURLY = '{'.charCodeAt(0);
const CLOSE_CURLY = '}'.charCodeAt(0);
const SEMICOLON = ';'.charCodeAt(0);
const ASTERISK = '*'.charCodeAt(0);
const COLON = ':'.charCodeAt(0);
const AT = '@'.charCodeAt(0);

const RE_AT_END = /[\t\n\f\r "#'()/;[\\\]{}]/g;
const RE_WORD_END = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g;
const RE_BAD_BRACKET = /.[\n"'(/\\]/;
const RE_HEX_ESCAPE = /[\da-f]/i;

var tokenize$1 = function tokenizer(input, options = {}) {
  let css = input.css.valueOf();
  let ignore = options.ignoreErrors;

  let code, next, quote, content, escape;
  let escaped, escapePos, prev, n, currentToken;

  let length = css.length;
  let pos = 0;
  let buffer = [];
  let returned = [];

  function position() {
    return pos
  }

  function unclosed(what) {
    throw input.error('Unclosed ' + what, pos)
  }

  function endOfFile() {
    return returned.length === 0 && pos >= length
  }

  function nextToken(opts) {
    if (returned.length) return returned.pop()
    if (pos >= length) return

    let ignoreUnclosed = opts ? opts.ignoreUnclosed : false;

    code = css.charCodeAt(pos);

    switch (code) {
      case NEWLINE:
      case SPACE:
      case TAB:
      case CR:
      case FEED: {
        next = pos;
        do {
          next += 1;
          code = css.charCodeAt(next);
        } while (
          code === SPACE ||
          code === NEWLINE ||
          code === TAB ||
          code === CR ||
          code === FEED
        )

        currentToken = ['space', css.slice(pos, next)];
        pos = next - 1;
        break
      }

      case OPEN_SQUARE:
      case CLOSE_SQUARE:
      case OPEN_CURLY:
      case CLOSE_CURLY:
      case COLON:
      case SEMICOLON:
      case CLOSE_PARENTHESES: {
        let controlChar = String.fromCharCode(code);
        currentToken = [controlChar, controlChar, pos];
        break
      }

      case OPEN_PARENTHESES: {
        prev = buffer.length ? buffer.pop()[1] : '';
        n = css.charCodeAt(pos + 1);
        if (
          prev === 'url' &&
          n !== SINGLE_QUOTE &&
          n !== DOUBLE_QUOTE &&
          n !== SPACE &&
          n !== NEWLINE &&
          n !== TAB &&
          n !== FEED &&
          n !== CR
        ) {
          next = pos;
          do {
            escaped = false;
            next = css.indexOf(')', next + 1);
            if (next === -1) {
              if (ignore || ignoreUnclosed) {
                next = pos;
                break
              } else {
                unclosed('bracket');
              }
            }
            escapePos = next;
            while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
              escapePos -= 1;
              escaped = !escaped;
            }
          } while (escaped)

          currentToken = ['brackets', css.slice(pos, next + 1), pos, next];

          pos = next;
        } else {
          next = css.indexOf(')', pos + 1);
          content = css.slice(pos, next + 1);

          if (next === -1 || RE_BAD_BRACKET.test(content)) {
            currentToken = ['(', '(', pos];
          } else {
            currentToken = ['brackets', content, pos, next];
            pos = next;
          }
        }

        break
      }

      case SINGLE_QUOTE:
      case DOUBLE_QUOTE: {
        quote = code === SINGLE_QUOTE ? "'" : '"';
        next = pos;
        do {
          escaped = false;
          next = css.indexOf(quote, next + 1);
          if (next === -1) {
            if (ignore || ignoreUnclosed) {
              next = pos + 1;
              break
            } else {
              unclosed('string');
            }
          }
          escapePos = next;
          while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
            escapePos -= 1;
            escaped = !escaped;
          }
        } while (escaped)

        currentToken = ['string', css.slice(pos, next + 1), pos, next];
        pos = next;
        break
      }

      case AT: {
        RE_AT_END.lastIndex = pos + 1;
        RE_AT_END.test(css);
        if (RE_AT_END.lastIndex === 0) {
          next = css.length - 1;
        } else {
          next = RE_AT_END.lastIndex - 2;
        }

        currentToken = ['at-word', css.slice(pos, next + 1), pos, next];

        pos = next;
        break
      }

      case BACKSLASH: {
        next = pos;
        escape = true;
        while (css.charCodeAt(next + 1) === BACKSLASH) {
          next += 1;
          escape = !escape;
        }
        code = css.charCodeAt(next + 1);
        if (
          escape &&
          code !== SLASH &&
          code !== SPACE &&
          code !== NEWLINE &&
          code !== TAB &&
          code !== CR &&
          code !== FEED
        ) {
          next += 1;
          if (RE_HEX_ESCAPE.test(css.charAt(next))) {
            while (RE_HEX_ESCAPE.test(css.charAt(next + 1))) {
              next += 1;
            }
            if (css.charCodeAt(next + 1) === SPACE) {
              next += 1;
            }
          }
        }

        currentToken = ['word', css.slice(pos, next + 1), pos, next];

        pos = next;
        break
      }

      default: {
        if (code === SLASH && css.charCodeAt(pos + 1) === ASTERISK) {
          next = css.indexOf('*/', pos + 2) + 1;
          if (next === 0) {
            if (ignore || ignoreUnclosed) {
              next = css.length;
            } else {
              unclosed('comment');
            }
          }

          currentToken = ['comment', css.slice(pos, next + 1), pos, next];
          pos = next;
        } else {
          RE_WORD_END.lastIndex = pos + 1;
          RE_WORD_END.test(css);
          if (RE_WORD_END.lastIndex === 0) {
            next = css.length - 1;
          } else {
            next = RE_WORD_END.lastIndex - 2;
          }

          currentToken = ['word', css.slice(pos, next + 1), pos, next];
          buffer.push(currentToken);
          pos = next;
        }

        break
      }
    }

    pos++;
    return currentToken
  }

  function back(token) {
    returned.push(token);
  }

  return {
    back,
    nextToken,
    endOfFile,
    position
  }
};

let pico$1 = picocolors.exports;

let tokenizer$1 = tokenize$1;

let Input$5;

function registerInput(dependant) {
  Input$5 = dependant;
}

const HIGHLIGHT_THEME = {
  'brackets': pico$1.cyan,
  'at-word': pico$1.cyan,
  'comment': pico$1.gray,
  'string': pico$1.green,
  'class': pico$1.yellow,
  'hash': pico$1.magenta,
  'call': pico$1.cyan,
  '(': pico$1.cyan,
  ')': pico$1.cyan,
  '{': pico$1.yellow,
  '}': pico$1.yellow,
  '[': pico$1.yellow,
  ']': pico$1.yellow,
  ':': pico$1.yellow,
  ';': pico$1.yellow
};

function getTokenType([type, value], processor) {
  if (type === 'word') {
    if (value[0] === '.') {
      return 'class'
    }
    if (value[0] === '#') {
      return 'hash'
    }
  }

  if (!processor.endOfFile()) {
    let next = processor.nextToken();
    processor.back(next);
    if (next[0] === 'brackets' || next[0] === '(') return 'call'
  }

  return type
}

function terminalHighlight$2(css) {
  let processor = tokenizer$1(new Input$5(css), { ignoreErrors: true });
  let result = '';
  while (!processor.endOfFile()) {
    let token = processor.nextToken();
    let color = HIGHLIGHT_THEME[getTokenType(token, processor)];
    if (color) {
      result += token[1]
        .split(/\r?\n/)
        .map(i => color(i))
        .join('\n');
    } else {
      result += token[1];
    }
  }
  return result
}

terminalHighlight$2.registerInput = registerInput;

var terminalHighlight_1 = terminalHighlight$2;

let pico = picocolors.exports;

let terminalHighlight$1 = terminalHighlight_1;

class CssSyntaxError$3 extends Error {
  constructor(message, line, column, source, file, plugin) {
    super(message);
    this.name = 'CssSyntaxError';
    this.reason = message;

    if (file) {
      this.file = file;
    }
    if (source) {
      this.source = source;
    }
    if (plugin) {
      this.plugin = plugin;
    }
    if (typeof line !== 'undefined' && typeof column !== 'undefined') {
      if (typeof line === 'number') {
        this.line = line;
        this.column = column;
      } else {
        this.line = line.line;
        this.column = line.column;
        this.endLine = column.line;
        this.endColumn = column.column;
      }
    }

    this.setMessage();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CssSyntaxError$3);
    }
  }

  setMessage() {
    this.message = this.plugin ? this.plugin + ': ' : '';
    this.message += this.file ? this.file : '<css input>';
    if (typeof this.line !== 'undefined') {
      this.message += ':' + this.line + ':' + this.column;
    }
    this.message += ': ' + this.reason;
  }

  showSourceCode(color) {
    if (!this.source) return ''

    let css = this.source;
    if (color == null) color = pico.isColorSupported;
    if (terminalHighlight$1) {
      if (color) css = terminalHighlight$1(css);
    }

    let lines = css.split(/\r?\n/);
    let start = Math.max(this.line - 3, 0);
    let end = Math.min(this.line + 2, lines.length);

    let maxWidth = String(end).length;

    let mark, aside;
    if (color) {
      let { bold, red, gray } = pico.createColors(true);
      mark = text => bold(red(text));
      aside = text => gray(text);
    } else {
      mark = aside = str => str;
    }

    return lines
      .slice(start, end)
      .map((line, index) => {
        let number = start + 1 + index;
        let gutter = ' ' + (' ' + number).slice(-maxWidth) + ' | ';
        if (number === this.line) {
          let spacing =
            aside(gutter.replace(/\d/g, ' ')) +
            line.slice(0, this.column - 1).replace(/[^\t]/g, ' ');
          return mark('>') + aside(gutter) + line + '\n ' + spacing + mark('^')
        }
        return ' ' + aside(gutter) + line
      })
      .join('\n')
  }

  toString() {
    let code = this.showSourceCode();
    if (code) {
      code = '\n\n' + code + '\n';
    }
    return this.name + ': ' + this.message + code
  }
}

var cssSyntaxError = CssSyntaxError$3;
CssSyntaxError$3.default = CssSyntaxError$3;

var symbols = {};

symbols.isClean = Symbol('isClean');

symbols.my = Symbol('my');

const DEFAULT_RAW = {
  colon: ': ',
  indent: '    ',
  beforeDecl: '\n',
  beforeRule: '\n',
  beforeOpen: ' ',
  beforeClose: '\n',
  beforeComment: '\n',
  after: '\n',
  emptyBody: '',
  commentLeft: ' ',
  commentRight: ' ',
  semicolon: false
};

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1)
}

class Stringifier$2 {
  constructor(builder) {
    this.builder = builder;
  }

  stringify(node, semicolon) {
    /* c8 ignore start */
    if (!this[node.type]) {
      throw new Error(
        'Unknown AST node type ' +
          node.type +
          '. ' +
          'Maybe you need to change PostCSS stringifier.'
      )
    }
    /* c8 ignore stop */
    this[node.type](node, semicolon);
  }

  document(node) {
    this.body(node);
  }

  root(node) {
    this.body(node);
    if (node.raws.after) this.builder(node.raws.after);
  }

  comment(node) {
    let left = this.raw(node, 'left', 'commentLeft');
    let right = this.raw(node, 'right', 'commentRight');
    this.builder('/*' + left + node.text + right + '*/', node);
  }

  decl(node, semicolon) {
    let between = this.raw(node, 'between', 'colon');
    let string = node.prop + between + this.rawValue(node, 'value');

    if (node.important) {
      string += node.raws.important || ' !important';
    }

    if (semicolon) string += ';';
    this.builder(string, node);
  }

  rule(node) {
    this.block(node, this.rawValue(node, 'selector'));
    if (node.raws.ownSemicolon) {
      this.builder(node.raws.ownSemicolon, node, 'end');
    }
  }

  atrule(node, semicolon) {
    let name = '@' + node.name;
    let params = node.params ? this.rawValue(node, 'params') : '';

    if (typeof node.raws.afterName !== 'undefined') {
      name += node.raws.afterName;
    } else if (params) {
      name += ' ';
    }

    if (node.nodes) {
      this.block(node, name + params);
    } else {
      let end = (node.raws.between || '') + (semicolon ? ';' : '');
      this.builder(name + params + end, node);
    }
  }

  body(node) {
    let last = node.nodes.length - 1;
    while (last > 0) {
      if (node.nodes[last].type !== 'comment') break
      last -= 1;
    }

    let semicolon = this.raw(node, 'semicolon');
    for (let i = 0; i < node.nodes.length; i++) {
      let child = node.nodes[i];
      let before = this.raw(child, 'before');
      if (before) this.builder(before);
      this.stringify(child, last !== i || semicolon);
    }
  }

  block(node, start) {
    let between = this.raw(node, 'between', 'beforeOpen');
    this.builder(start + between + '{', node, 'start');

    let after;
    if (node.nodes && node.nodes.length) {
      this.body(node);
      after = this.raw(node, 'after');
    } else {
      after = this.raw(node, 'after', 'emptyBody');
    }

    if (after) this.builder(after);
    this.builder('}', node, 'end');
  }

  raw(node, own, detect) {
    let value;
    if (!detect) detect = own;

    // Already had
    if (own) {
      value = node.raws[own];
      if (typeof value !== 'undefined') return value
    }

    let parent = node.parent;

    if (detect === 'before') {
      // Hack for first rule in CSS
      if (!parent || (parent.type === 'root' && parent.first === node)) {
        return ''
      }

      // `root` nodes in `document` should use only their own raws
      if (parent && parent.type === 'document') {
        return ''
      }
    }

    // Floating child without parent
    if (!parent) return DEFAULT_RAW[detect]

    // Detect style by other nodes
    let root = node.root();
    if (!root.rawCache) root.rawCache = {};
    if (typeof root.rawCache[detect] !== 'undefined') {
      return root.rawCache[detect]
    }

    if (detect === 'before' || detect === 'after') {
      return this.beforeAfter(node, detect)
    } else {
      let method = 'raw' + capitalize(detect);
      if (this[method]) {
        value = this[method](root, node);
      } else {
        root.walk(i => {
          value = i.raws[own];
          if (typeof value !== 'undefined') return false
        });
      }
    }

    if (typeof value === 'undefined') value = DEFAULT_RAW[detect];

    root.rawCache[detect] = value;
    return value
  }

  rawSemicolon(root) {
    let value;
    root.walk(i => {
      if (i.nodes && i.nodes.length && i.last.type === 'decl') {
        value = i.raws.semicolon;
        if (typeof value !== 'undefined') return false
      }
    });
    return value
  }

  rawEmptyBody(root) {
    let value;
    root.walk(i => {
      if (i.nodes && i.nodes.length === 0) {
        value = i.raws.after;
        if (typeof value !== 'undefined') return false
      }
    });
    return value
  }

  rawIndent(root) {
    if (root.raws.indent) return root.raws.indent
    let value;
    root.walk(i => {
      let p = i.parent;
      if (p && p !== root && p.parent && p.parent === root) {
        if (typeof i.raws.before !== 'undefined') {
          let parts = i.raws.before.split('\n');
          value = parts[parts.length - 1];
          value = value.replace(/\S/g, '');
          return false
        }
      }
    });
    return value
  }

  rawBeforeComment(root, node) {
    let value;
    root.walkComments(i => {
      if (typeof i.raws.before !== 'undefined') {
        value = i.raws.before;
        if (value.includes('\n')) {
          value = value.replace(/[^\n]+$/, '');
        }
        return false
      }
    });
    if (typeof value === 'undefined') {
      value = this.raw(node, null, 'beforeDecl');
    } else if (value) {
      value = value.replace(/\S/g, '');
    }
    return value
  }

  rawBeforeDecl(root, node) {
    let value;
    root.walkDecls(i => {
      if (typeof i.raws.before !== 'undefined') {
        value = i.raws.before;
        if (value.includes('\n')) {
          value = value.replace(/[^\n]+$/, '');
        }
        return false
      }
    });
    if (typeof value === 'undefined') {
      value = this.raw(node, null, 'beforeRule');
    } else if (value) {
      value = value.replace(/\S/g, '');
    }
    return value
  }

  rawBeforeRule(root) {
    let value;
    root.walk(i => {
      if (i.nodes && (i.parent !== root || root.first !== i)) {
        if (typeof i.raws.before !== 'undefined') {
          value = i.raws.before;
          if (value.includes('\n')) {
            value = value.replace(/[^\n]+$/, '');
          }
          return false
        }
      }
    });
    if (value) value = value.replace(/\S/g, '');
    return value
  }

  rawBeforeClose(root) {
    let value;
    root.walk(i => {
      if (i.nodes && i.nodes.length > 0) {
        if (typeof i.raws.after !== 'undefined') {
          value = i.raws.after;
          if (value.includes('\n')) {
            value = value.replace(/[^\n]+$/, '');
          }
          return false
        }
      }
    });
    if (value) value = value.replace(/\S/g, '');
    return value
  }

  rawBeforeOpen(root) {
    let value;
    root.walk(i => {
      if (i.type !== 'decl') {
        value = i.raws.between;
        if (typeof value !== 'undefined') return false
      }
    });
    return value
  }

  rawColon(root) {
    let value;
    root.walkDecls(i => {
      if (typeof i.raws.between !== 'undefined') {
        value = i.raws.between.replace(/[^\s:]/g, '');
        return false
      }
    });
    return value
  }

  beforeAfter(node, detect) {
    let value;
    if (node.type === 'decl') {
      value = this.raw(node, null, 'beforeDecl');
    } else if (node.type === 'comment') {
      value = this.raw(node, null, 'beforeComment');
    } else if (detect === 'before') {
      value = this.raw(node, null, 'beforeRule');
    } else {
      value = this.raw(node, null, 'beforeClose');
    }

    let buf = node.parent;
    let depth = 0;
    while (buf && buf.type !== 'root') {
      depth += 1;
      buf = buf.parent;
    }

    if (value.includes('\n')) {
      let indent = this.raw(node, null, 'indent');
      if (indent.length) {
        for (let step = 0; step < depth; step++) value += indent;
      }
    }

    return value
  }

  rawValue(node, prop) {
    let value = node[prop];
    let raw = node.raws[prop];
    if (raw && raw.value === value) {
      return raw.raw
    }

    return value
  }
}

var stringifier = Stringifier$2;
Stringifier$2.default = Stringifier$2;

let Stringifier$1 = stringifier;

function stringify$4(node, builder) {
  let str = new Stringifier$1(builder);
  str.stringify(node);
}

var stringify_1 = stringify$4;
stringify$4.default = stringify$4;

let { isClean: isClean$2, my: my$2 } = symbols;
let CssSyntaxError$2 = cssSyntaxError;
let Stringifier = stringifier;
let stringify$3 = stringify_1;

function cloneNode(obj, parent) {
  let cloned = new obj.constructor();

  for (let i in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, i)) {
      /* c8 ignore next 2 */
      continue
    }
    if (i === 'proxyCache') continue
    let value = obj[i];
    let type = typeof value;

    if (i === 'parent' && type === 'object') {
      if (parent) cloned[i] = parent;
    } else if (i === 'source') {
      cloned[i] = value;
    } else if (Array.isArray(value)) {
      cloned[i] = value.map(j => cloneNode(j, cloned));
    } else {
      if (type === 'object' && value !== null) value = cloneNode(value);
      cloned[i] = value;
    }
  }

  return cloned
}

class Node$4 {
  constructor(defaults = {}) {
    this.raws = {};
    this[isClean$2] = false;
    this[my$2] = true;

    for (let name in defaults) {
      if (name === 'nodes') {
        this.nodes = [];
        for (let node of defaults[name]) {
          if (typeof node.clone === 'function') {
            this.append(node.clone());
          } else {
            this.append(node);
          }
        }
      } else {
        this[name] = defaults[name];
      }
    }
  }

  error(message, opts = {}) {
    if (this.source) {
      let { start, end } = this.rangeBy(opts);
      return this.source.input.error(
        message,
        { line: start.line, column: start.column },
        { line: end.line, column: end.column },
        opts
      )
    }
    return new CssSyntaxError$2(message)
  }

  warn(result, text, opts) {
    let data = { node: this };
    for (let i in opts) data[i] = opts[i];
    return result.warn(text, data)
  }

  remove() {
    if (this.parent) {
      this.parent.removeChild(this);
    }
    this.parent = undefined;
    return this
  }

  toString(stringifier = stringify$3) {
    if (stringifier.stringify) stringifier = stringifier.stringify;
    let result = '';
    stringifier(this, i => {
      result += i;
    });
    return result
  }

  assign(overrides = {}) {
    for (let name in overrides) {
      this[name] = overrides[name];
    }
    return this
  }

  clone(overrides = {}) {
    let cloned = cloneNode(this);
    for (let name in overrides) {
      cloned[name] = overrides[name];
    }
    return cloned
  }

  cloneBefore(overrides = {}) {
    let cloned = this.clone(overrides);
    this.parent.insertBefore(this, cloned);
    return cloned
  }

  cloneAfter(overrides = {}) {
    let cloned = this.clone(overrides);
    this.parent.insertAfter(this, cloned);
    return cloned
  }

  replaceWith(...nodes) {
    if (this.parent) {
      let bookmark = this;
      let foundSelf = false;
      for (let node of nodes) {
        if (node === this) {
          foundSelf = true;
        } else if (foundSelf) {
          this.parent.insertAfter(bookmark, node);
          bookmark = node;
        } else {
          this.parent.insertBefore(bookmark, node);
        }
      }

      if (!foundSelf) {
        this.remove();
      }
    }

    return this
  }

  next() {
    if (!this.parent) return undefined
    let index = this.parent.index(this);
    return this.parent.nodes[index + 1]
  }

  prev() {
    if (!this.parent) return undefined
    let index = this.parent.index(this);
    return this.parent.nodes[index - 1]
  }

  before(add) {
    this.parent.insertBefore(this, add);
    return this
  }

  after(add) {
    this.parent.insertAfter(this, add);
    return this
  }

  root() {
    let result = this;
    while (result.parent && result.parent.type !== 'document') {
      result = result.parent;
    }
    return result
  }

  raw(prop, defaultType) {
    let str = new Stringifier();
    return str.raw(this, prop, defaultType)
  }

  cleanRaws(keepBetween) {
    delete this.raws.before;
    delete this.raws.after;
    if (!keepBetween) delete this.raws.between;
  }

  toJSON(_, inputs) {
    let fixed = {};
    let emitInputs = inputs == null;
    inputs = inputs || new Map();
    let inputsNextIndex = 0;

    for (let name in this) {
      if (!Object.prototype.hasOwnProperty.call(this, name)) {
        /* c8 ignore next 2 */
        continue
      }
      if (name === 'parent' || name === 'proxyCache') continue
      let value = this[name];

      if (Array.isArray(value)) {
        fixed[name] = value.map(i => {
          if (typeof i === 'object' && i.toJSON) {
            return i.toJSON(null, inputs)
          } else {
            return i
          }
        });
      } else if (typeof value === 'object' && value.toJSON) {
        fixed[name] = value.toJSON(null, inputs);
      } else if (name === 'source') {
        let inputId = inputs.get(value.input);
        if (inputId == null) {
          inputId = inputsNextIndex;
          inputs.set(value.input, inputsNextIndex);
          inputsNextIndex++;
        }
        fixed[name] = {
          inputId,
          start: value.start,
          end: value.end
        };
      } else {
        fixed[name] = value;
      }
    }

    if (emitInputs) {
      fixed.inputs = [...inputs.keys()].map(input => input.toJSON());
    }

    return fixed
  }

  positionInside(index) {
    let string = this.toString();
    let column = this.source.start.column;
    let line = this.source.start.line;

    for (let i = 0; i < index; i++) {
      if (string[i] === '\n') {
        column = 1;
        line += 1;
      } else {
        column += 1;
      }
    }

    return { line, column }
  }

  positionBy(opts) {
    let pos = this.source.start;
    if (opts.index) {
      pos = this.positionInside(opts.index);
    } else if (opts.word) {
      let index = this.toString().indexOf(opts.word);
      if (index !== -1) pos = this.positionInside(index);
    }
    return pos
  }

  rangeBy(opts) {
    let start = {
      line: this.source.start.line,
      column: this.source.start.column
    };
    let end = this.source.end
      ? {
          line: this.source.end.line,
          column: this.source.end.column + 1
        }
      : {
          line: start.line,
          column: start.column + 1
        };

    if (opts.word) {
      let index = this.toString().indexOf(opts.word);
      if (index !== -1) {
        start = this.positionInside(index);
        end = this.positionInside(index + opts.word.length);
      }
    } else {
      if (opts.start) {
        start = {
          line: opts.start.line,
          column: opts.start.column
        };
      } else if (opts.index) {
        start = this.positionInside(opts.index);
      }

      if (opts.end) {
        end = {
          line: opts.end.line,
          column: opts.end.column
        };
      } else if (opts.endIndex) {
        end = this.positionInside(opts.endIndex);
      } else if (opts.index) {
        end = this.positionInside(opts.index + 1);
      }
    }

    if (
      end.line < start.line ||
      (end.line === start.line && end.column <= start.column)
    ) {
      end = { line: start.line, column: start.column + 1 };
    }

    return { start, end }
  }

  getProxyProcessor() {
    return {
      set(node, prop, value) {
        if (node[prop] === value) return true
        node[prop] = value;
        if (
          prop === 'prop' ||
          prop === 'value' ||
          prop === 'name' ||
          prop === 'params' ||
          prop === 'important' ||
          /* c8 ignore next */
          prop === 'text'
        ) {
          node.markDirty();
        }
        return true
      },

      get(node, prop) {
        if (prop === 'proxyOf') {
          return node
        } else if (prop === 'root') {
          return () => node.root().toProxy()
        } else {
          return node[prop]
        }
      }
    }
  }

  toProxy() {
    if (!this.proxyCache) {
      this.proxyCache = new Proxy(this, this.getProxyProcessor());
    }
    return this.proxyCache
  }

  addToError(error) {
    error.postcssNode = this;
    if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
      let s = this.source;
      error.stack = error.stack.replace(
        /\n\s{4}at /,
        `$&${s.input.from}:${s.start.line}:${s.start.column}$&`
      );
    }
    return error
  }

  markDirty() {
    if (this[isClean$2]) {
      this[isClean$2] = false;
      let next = this;
      while ((next = next.parent)) {
        next[isClean$2] = false;
      }
    }
  }

  get proxyOf() {
    return this
  }
}

var node_1 = Node$4;
Node$4.default = Node$4;

let Node$3 = node_1;

class Declaration$4 extends Node$3 {
  constructor(defaults) {
    if (
      defaults &&
      typeof defaults.value !== 'undefined' &&
      typeof defaults.value !== 'string'
    ) {
      defaults = { ...defaults, value: String(defaults.value) };
    }
    super(defaults);
    this.type = 'decl';
  }

  get variable() {
    return this.prop.startsWith('--') || this.prop[0] === '$'
  }
}

var declaration = Declaration$4;
Declaration$4.default = Declaration$4;

var sourceMap = {};

var sourceMapGenerator = {};

var base64Vlq = {};

var base64$1 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
base64$1.encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
base64$1.decode = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var base64 = base64$1;

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
base64Vlq.encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
base64Vlq.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

var util$6 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

(function (exports) {
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */

	/**
	 * This is a helper function for getting values from parameter/options
	 * objects.
	 *
	 * @param args The object we are extracting values from
	 * @param name The name of the property we are getting.
	 * @param defaultValue An optional value to return if the property is missing
	 * from the object. If this is not specified and the property is missing, an
	 * error will be thrown.
	 */
	function getArg(aArgs, aName, aDefaultValue) {
	  if (aName in aArgs) {
	    return aArgs[aName];
	  } else if (arguments.length === 3) {
	    return aDefaultValue;
	  } else {
	    throw new Error('"' + aName + '" is a required argument.');
	  }
	}
	exports.getArg = getArg;

	var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
	var dataUrlRegexp = /^data:.+\,.+$/;

	function urlParse(aUrl) {
	  var match = aUrl.match(urlRegexp);
	  if (!match) {
	    return null;
	  }
	  return {
	    scheme: match[1],
	    auth: match[2],
	    host: match[3],
	    port: match[4],
	    path: match[5]
	  };
	}
	exports.urlParse = urlParse;

	function urlGenerate(aParsedUrl) {
	  var url = '';
	  if (aParsedUrl.scheme) {
	    url += aParsedUrl.scheme + ':';
	  }
	  url += '//';
	  if (aParsedUrl.auth) {
	    url += aParsedUrl.auth + '@';
	  }
	  if (aParsedUrl.host) {
	    url += aParsedUrl.host;
	  }
	  if (aParsedUrl.port) {
	    url += ":" + aParsedUrl.port;
	  }
	  if (aParsedUrl.path) {
	    url += aParsedUrl.path;
	  }
	  return url;
	}
	exports.urlGenerate = urlGenerate;

	var MAX_CACHED_INPUTS = 32;

	/**
	 * Takes some function `f(input) -> result` and returns a memoized version of
	 * `f`.
	 *
	 * We keep at most `MAX_CACHED_INPUTS` memoized results of `f` alive. The
	 * memoization is a dumb-simple, linear least-recently-used cache.
	 */
	function lruMemoize(f) {
	  var cache = [];

	  return function(input) {
	    for (var i = 0; i < cache.length; i++) {
	      if (cache[i].input === input) {
	        var temp = cache[0];
	        cache[0] = cache[i];
	        cache[i] = temp;
	        return cache[0].result;
	      }
	    }

	    var result = f(input);

	    cache.unshift({
	      input,
	      result,
	    });

	    if (cache.length > MAX_CACHED_INPUTS) {
	      cache.pop();
	    }

	    return result;
	  };
	}

	/**
	 * Normalizes a path, or the path portion of a URL:
	 *
	 * - Replaces consecutive slashes with one slash.
	 * - Removes unnecessary '.' parts.
	 * - Removes unnecessary '<dir>/..' parts.
	 *
	 * Based on code in the Node.js 'path' core module.
	 *
	 * @param aPath The path or url to normalize.
	 */
	var normalize = lruMemoize(function normalize(aPath) {
	  var path = aPath;
	  var url = urlParse(aPath);
	  if (url) {
	    if (!url.path) {
	      return aPath;
	    }
	    path = url.path;
	  }
	  var isAbsolute = exports.isAbsolute(path);
	  // Split the path into parts between `/` characters. This is much faster than
	  // using `.split(/\/+/g)`.
	  var parts = [];
	  var start = 0;
	  var i = 0;
	  while (true) {
	    start = i;
	    i = path.indexOf("/", start);
	    if (i === -1) {
	      parts.push(path.slice(start));
	      break;
	    } else {
	      parts.push(path.slice(start, i));
	      while (i < path.length && path[i] === "/") {
	        i++;
	      }
	    }
	  }

	  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
	    part = parts[i];
	    if (part === '.') {
	      parts.splice(i, 1);
	    } else if (part === '..') {
	      up++;
	    } else if (up > 0) {
	      if (part === '') {
	        // The first part is blank if the path is absolute. Trying to go
	        // above the root is a no-op. Therefore we can remove all '..' parts
	        // directly after the root.
	        parts.splice(i + 1, up);
	        up = 0;
	      } else {
	        parts.splice(i, 2);
	        up--;
	      }
	    }
	  }
	  path = parts.join('/');

	  if (path === '') {
	    path = isAbsolute ? '/' : '.';
	  }

	  if (url) {
	    url.path = path;
	    return urlGenerate(url);
	  }
	  return path;
	});
	exports.normalize = normalize;

	/**
	 * Joins two paths/URLs.
	 *
	 * @param aRoot The root path or URL.
	 * @param aPath The path or URL to be joined with the root.
	 *
	 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
	 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
	 *   first.
	 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
	 *   is updated with the result and aRoot is returned. Otherwise the result
	 *   is returned.
	 *   - If aPath is absolute, the result is aPath.
	 *   - Otherwise the two paths are joined with a slash.
	 * - Joining for example 'http://' and 'www.example.com' is also supported.
	 */
	function join(aRoot, aPath) {
	  if (aRoot === "") {
	    aRoot = ".";
	  }
	  if (aPath === "") {
	    aPath = ".";
	  }
	  var aPathUrl = urlParse(aPath);
	  var aRootUrl = urlParse(aRoot);
	  if (aRootUrl) {
	    aRoot = aRootUrl.path || '/';
	  }

	  // `join(foo, '//www.example.org')`
	  if (aPathUrl && !aPathUrl.scheme) {
	    if (aRootUrl) {
	      aPathUrl.scheme = aRootUrl.scheme;
	    }
	    return urlGenerate(aPathUrl);
	  }

	  if (aPathUrl || aPath.match(dataUrlRegexp)) {
	    return aPath;
	  }

	  // `join('http://', 'www.example.com')`
	  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
	    aRootUrl.host = aPath;
	    return urlGenerate(aRootUrl);
	  }

	  var joined = aPath.charAt(0) === '/'
	    ? aPath
	    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

	  if (aRootUrl) {
	    aRootUrl.path = joined;
	    return urlGenerate(aRootUrl);
	  }
	  return joined;
	}
	exports.join = join;

	exports.isAbsolute = function (aPath) {
	  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
	};

	/**
	 * Make a path relative to a URL or another path.
	 *
	 * @param aRoot The root path or URL.
	 * @param aPath The path or URL to be made relative to aRoot.
	 */
	function relative(aRoot, aPath) {
	  if (aRoot === "") {
	    aRoot = ".";
	  }

	  aRoot = aRoot.replace(/\/$/, '');

	  // It is possible for the path to be above the root. In this case, simply
	  // checking whether the root is a prefix of the path won't work. Instead, we
	  // need to remove components from the root one by one, until either we find
	  // a prefix that fits, or we run out of components to remove.
	  var level = 0;
	  while (aPath.indexOf(aRoot + '/') !== 0) {
	    var index = aRoot.lastIndexOf("/");
	    if (index < 0) {
	      return aPath;
	    }

	    // If the only part of the root that is left is the scheme (i.e. http://,
	    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
	    // have exhausted all components, so the path is not relative to the root.
	    aRoot = aRoot.slice(0, index);
	    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
	      return aPath;
	    }

	    ++level;
	  }

	  // Make sure we add a "../" for each component we removed from the root.
	  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
	}
	exports.relative = relative;

	var supportsNullProto = (function () {
	  var obj = Object.create(null);
	  return !('__proto__' in obj);
	}());

	function identity (s) {
	  return s;
	}

	/**
	 * Because behavior goes wacky when you set `__proto__` on objects, we
	 * have to prefix all the strings in our set with an arbitrary character.
	 *
	 * See https://github.com/mozilla/source-map/pull/31 and
	 * https://github.com/mozilla/source-map/issues/30
	 *
	 * @param String aStr
	 */
	function toSetString(aStr) {
	  if (isProtoString(aStr)) {
	    return '$' + aStr;
	  }

	  return aStr;
	}
	exports.toSetString = supportsNullProto ? identity : toSetString;

	function fromSetString(aStr) {
	  if (isProtoString(aStr)) {
	    return aStr.slice(1);
	  }

	  return aStr;
	}
	exports.fromSetString = supportsNullProto ? identity : fromSetString;

	function isProtoString(s) {
	  if (!s) {
	    return false;
	  }

	  var length = s.length;

	  if (length < 9 /* "__proto__".length */) {
	    return false;
	  }

	  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
	      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
	      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
	      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
	      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
	      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
	      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
	      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
	      s.charCodeAt(length - 9) !== 95  /* '_' */) {
	    return false;
	  }

	  for (var i = length - 10; i >= 0; i--) {
	    if (s.charCodeAt(i) !== 36 /* '$' */) {
	      return false;
	    }
	  }

	  return true;
	}

	/**
	 * Comparator between two mappings where the original positions are compared.
	 *
	 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
	 * mappings with the same original source/line/column, but different generated
	 * line and column the same. Useful when searching for a mapping with a
	 * stubbed out mapping.
	 */
	function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
	  var cmp = strcmp(mappingA.source, mappingB.source);
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalLine - mappingB.originalLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalColumn - mappingB.originalColumn;
	  if (cmp !== 0 || onlyCompareOriginal) {
	    return cmp;
	  }

	  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.generatedLine - mappingB.generatedLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  return strcmp(mappingA.name, mappingB.name);
	}
	exports.compareByOriginalPositions = compareByOriginalPositions;

	function compareByOriginalPositionsNoSource(mappingA, mappingB, onlyCompareOriginal) {
	  var cmp;

	  cmp = mappingA.originalLine - mappingB.originalLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalColumn - mappingB.originalColumn;
	  if (cmp !== 0 || onlyCompareOriginal) {
	    return cmp;
	  }

	  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.generatedLine - mappingB.generatedLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  return strcmp(mappingA.name, mappingB.name);
	}
	exports.compareByOriginalPositionsNoSource = compareByOriginalPositionsNoSource;

	/**
	 * Comparator between two mappings with deflated source and name indices where
	 * the generated positions are compared.
	 *
	 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
	 * mappings with the same generated line and column, but different
	 * source/name/original line and column the same. Useful when searching for a
	 * mapping with a stubbed out mapping.
	 */
	function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
	  var cmp = mappingA.generatedLine - mappingB.generatedLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
	  if (cmp !== 0 || onlyCompareGenerated) {
	    return cmp;
	  }

	  cmp = strcmp(mappingA.source, mappingB.source);
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalLine - mappingB.originalLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalColumn - mappingB.originalColumn;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  return strcmp(mappingA.name, mappingB.name);
	}
	exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

	function compareByGeneratedPositionsDeflatedNoLine(mappingA, mappingB, onlyCompareGenerated) {
	  var cmp = mappingA.generatedColumn - mappingB.generatedColumn;
	  if (cmp !== 0 || onlyCompareGenerated) {
	    return cmp;
	  }

	  cmp = strcmp(mappingA.source, mappingB.source);
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalLine - mappingB.originalLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalColumn - mappingB.originalColumn;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  return strcmp(mappingA.name, mappingB.name);
	}
	exports.compareByGeneratedPositionsDeflatedNoLine = compareByGeneratedPositionsDeflatedNoLine;

	function strcmp(aStr1, aStr2) {
	  if (aStr1 === aStr2) {
	    return 0;
	  }

	  if (aStr1 === null) {
	    return 1; // aStr2 !== null
	  }

	  if (aStr2 === null) {
	    return -1; // aStr1 !== null
	  }

	  if (aStr1 > aStr2) {
	    return 1;
	  }

	  return -1;
	}

	/**
	 * Comparator between two mappings with inflated source and name strings where
	 * the generated positions are compared.
	 */
	function compareByGeneratedPositionsInflated(mappingA, mappingB) {
	  var cmp = mappingA.generatedLine - mappingB.generatedLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = strcmp(mappingA.source, mappingB.source);
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalLine - mappingB.originalLine;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  cmp = mappingA.originalColumn - mappingB.originalColumn;
	  if (cmp !== 0) {
	    return cmp;
	  }

	  return strcmp(mappingA.name, mappingB.name);
	}
	exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

	/**
	 * Strip any JSON XSSI avoidance prefix from the string (as documented
	 * in the source maps specification), and then parse the string as
	 * JSON.
	 */
	function parseSourceMapInput(str) {
	  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
	}
	exports.parseSourceMapInput = parseSourceMapInput;

	/**
	 * Compute the URL of a source given the the source root, the source's
	 * URL, and the source map's URL.
	 */
	function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
	  sourceURL = sourceURL || '';

	  if (sourceRoot) {
	    // This follows what Chrome does.
	    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
	      sourceRoot += '/';
	    }
	    // The spec says:
	    //   Line 4: An optional source root, useful for relocating source
	    //   files on a server or removing repeated values in the
	    //   “sources” entry.  This value is prepended to the individual
	    //   entries in the “source” field.
	    sourceURL = sourceRoot + sourceURL;
	  }

	  // Historically, SourceMapConsumer did not take the sourceMapURL as
	  // a parameter.  This mode is still somewhat supported, which is why
	  // this code block is conditional.  However, it's preferable to pass
	  // the source map URL to SourceMapConsumer, so that this function
	  // can implement the source URL resolution algorithm as outlined in
	  // the spec.  This block is basically the equivalent of:
	  //    new URL(sourceURL, sourceMapURL).toString()
	  // ... except it avoids using URL, which wasn't available in the
	  // older releases of node still supported by this library.
	  //
	  // The spec says:
	  //   If the sources are not absolute URLs after prepending of the
	  //   “sourceRoot”, the sources are resolved relative to the
	  //   SourceMap (like resolving script src in a html document).
	  if (sourceMapURL) {
	    var parsed = urlParse(sourceMapURL);
	    if (!parsed) {
	      throw new Error("sourceMapURL could not be parsed");
	    }
	    if (parsed.path) {
	      // Strip the last path component, but keep the "/".
	      var index = parsed.path.lastIndexOf('/');
	      if (index >= 0) {
	        parsed.path = parsed.path.substring(0, index + 1);
	      }
	    }
	    sourceURL = join(urlGenerate(parsed), sourceURL);
	  }

	  return normalize(sourceURL);
	}
	exports.computeSourceURL = computeSourceURL;
} (util$6));

var arraySet = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util$5 = util$6;
var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet$2() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet$2.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet$2();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet$2.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet$2.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util$5.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet$2.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util$5.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet$2.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util$5.toSetString(aStr);
    if (has.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet$2.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet$2.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

arraySet.ArraySet = ArraySet$2;

var mappingList = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util$4 = util$6;

/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  var lineA = mappingA.generatedLine;
  var lineB = mappingB.generatedLine;
  var columnA = mappingA.generatedColumn;
  var columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA ||
         util$4.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function MappingList$1() {
  this._array = [];
  this._sorted = true;
  // Serves as infimum
  this._last = {generatedLine: -1, generatedColumn: 0};
}

/**
 * Iterate through internal items. This method takes the same arguments that
 * `Array.prototype.forEach` takes.
 *
 * NOTE: The order of the mappings is NOT guaranteed.
 */
MappingList$1.prototype.unsortedForEach =
  function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
MappingList$1.prototype.add = function MappingList_add(aMapping) {
  if (generatedPositionAfter(this._last, aMapping)) {
    this._last = aMapping;
    this._array.push(aMapping);
  } else {
    this._sorted = false;
    this._array.push(aMapping);
  }
};

/**
 * Returns the flat, sorted array of mappings. The mappings are sorted by
 * generated position.
 *
 * WARNING: This method returns internal data without copying, for
 * performance. The return value must NOT be mutated, and should be treated as
 * an immutable borrow. If you want to take ownership, you must make your own
 * copy.
 */
MappingList$1.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(util$4.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

mappingList.MappingList = MappingList$1;

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var base64VLQ$1 = base64Vlq;
var util$3 = util$6;
var ArraySet$1 = arraySet.ArraySet;
var MappingList = mappingList.MappingList;

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function SourceMapGenerator$4(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = util$3.getArg(aArgs, 'file', null);
  this._sourceRoot = util$3.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = util$3.getArg(aArgs, 'skipValidation', false);
  this._sources = new ArraySet$1();
  this._names = new ArraySet$1();
  this._mappings = new MappingList();
  this._sourcesContents = null;
}

SourceMapGenerator$4.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
SourceMapGenerator$4.fromSourceMap =
  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator$4({
      file: aSourceMapConsumer.file,
      sourceRoot: sourceRoot
    });
    aSourceMapConsumer.eachMapping(function (mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };

      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util$3.relative(sourceRoot, newMapping.source);
        }

        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };

        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }

      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var sourceRelative = sourceFile;
      if (sourceRoot !== null) {
        sourceRelative = util$3.relative(sourceRoot, sourceFile);
      }

      if (!generator._sources.has(sourceRelative)) {
        generator._sources.add(sourceRelative);
      }

      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };

/**
 * Add a single mapping from original source line and column to the generated
 * source's line and column for this source map being created. The mapping
 * object should have the following properties:
 *
 *   - generated: An object with the generated line and column positions.
 *   - original: An object with the original line and column positions.
 *   - source: The original source file (relative to the sourceRoot).
 *   - name: An optional original token name for this mapping.
 */
SourceMapGenerator$4.prototype.addMapping =
  function SourceMapGenerator_addMapping(aArgs) {
    var generated = util$3.getArg(aArgs, 'generated');
    var original = util$3.getArg(aArgs, 'original', null);
    var source = util$3.getArg(aArgs, 'source', null);
    var name = util$3.getArg(aArgs, 'name', null);

    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }

    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }

    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }

    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source: source,
      name: name
    });
  };

/**
 * Set the source content for a source file.
 */
SourceMapGenerator$4.prototype.setSourceContent =
  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util$3.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util$3.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[util$3.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };

/**
 * Applies the mappings of a sub-source-map for a specific source file to the
 * source map being generated. Each mapping to the supplied source file is
 * rewritten using the supplied source map. Note: The resolution for the
 * resulting mappings is the minimium of this map and the supplied map.
 *
 * @param aSourceMapConsumer The source map to be applied.
 * @param aSourceFile Optional. The filename of the source file.
 *        If omitted, SourceMapConsumer's file property will be used.
 * @param aSourceMapPath Optional. The dirname of the path to the source map
 *        to be applied. If relative, it is relative to the SourceMapConsumer.
 *        This parameter is needed when the two source maps aren't in the same
 *        directory, and the source map to be applied contains relative source
 *        paths. If so, those relative source paths need to be rewritten
 *        relative to the SourceMapGenerator.
 */
SourceMapGenerator$4.prototype.applySourceMap =
  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    // If aSourceFile is omitted, we will use the file property of the SourceMap
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error(
          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
          'or the source map\'s "file" property. Both were omitted.'
        );
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    // Make "sourceFile" relative if an absolute Url is passed.
    if (sourceRoot != null) {
      sourceFile = util$3.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    var newSources = new ArraySet$1();
    var newNames = new ArraySet$1();

    // Find mappings for the "sourceFile"
    this._mappings.unsortedForEach(function (mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        // Check if it can be mapped by the source map, then update the mapping.
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          // Copy mapping
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util$3.join(aSourceMapPath, mapping.source);
          }
          if (sourceRoot != null) {
            mapping.source = util$3.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }

      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }

      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }

    }, this);
    this._sources = newSources;
    this._names = newNames;

    // Copy sourcesContents of applied map.
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile = util$3.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = util$3.relative(sourceRoot, sourceFile);
        }
        this.setSourceContent(sourceFile, content);
      }
    }, this);
  };

/**
 * A mapping can have one of the three levels of data:
 *
 *   1. Just the generated position.
 *   2. The Generated position, original position, and original source.
 *   3. Generated and original position, original source, as well as a name
 *      token.
 *
 * To maintain consistency, we validate that any new mapping being added falls
 * in to one of these categories.
 */
SourceMapGenerator$4.prototype._validateMapping =
  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                              aName) {
    // When aOriginal is truthy but has empty values for .line and .column,
    // it is most likely a programmer error. In this case we throw a very
    // specific error message to try to guide them the right way.
    // For example: https://github.com/Polymer/polymer-bundler/pull/519
    if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
        throw new Error(
            'original.line and original.column are not numbers -- you probably meant to omit ' +
            'the original mapping entirely and only map the generated position. If so, pass ' +
            'null for the original mapping instead of an object with empty or null values.'
        );
    }

    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
        && aGenerated.line > 0 && aGenerated.column >= 0
        && !aOriginal && !aSource && !aName) {
      // Case 1.
      return;
    }
    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
             && aGenerated.line > 0 && aGenerated.column >= 0
             && aOriginal.line > 0 && aOriginal.column >= 0
             && aSource) {
      // Cases 2 and 3.
      return;
    }
    else {
      throw new Error('Invalid mapping: ' + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  };

/**
 * Serialize the accumulated mappings in to the stream of base 64 VLQs
 * specified by the source map format.
 */
SourceMapGenerator$4.prototype._serializeMappings =
  function SourceMapGenerator_serializeMappings() {
    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = '';
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;

    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length; i < len; i++) {
      mapping = mappings[i];
      next = '';

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ';';
          previousGeneratedLine++;
        }
      }
      else {
        if (i > 0) {
          if (!util$3.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ',';
        }
      }

      next += base64VLQ$1.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ$1.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += base64VLQ$1.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += base64VLQ$1.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ$1.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  };

SourceMapGenerator$4.prototype._generateSourcesContent =
  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function (source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util$3.relative(aSourceRoot, source);
      }
      var key = util$3.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  };

/**
 * Externalize the source map.
 */
SourceMapGenerator$4.prototype.toJSON =
  function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }

    return map;
  };

/**
 * Render the source map being generated to a string.
 */
SourceMapGenerator$4.prototype.toString =
  function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };

sourceMapGenerator.SourceMapGenerator = SourceMapGenerator$4;

var sourceMapConsumer = {};

var binarySearch$1 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

(function (exports) {
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */

	exports.GREATEST_LOWER_BOUND = 1;
	exports.LEAST_UPPER_BOUND = 2;

	/**
	 * Recursive implementation of binary search.
	 *
	 * @param aLow Indices here and lower do not contain the needle.
	 * @param aHigh Indices here and higher do not contain the needle.
	 * @param aNeedle The element being searched for.
	 * @param aHaystack The non-empty array being searched.
	 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
	 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
	 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
	 *     closest element that is smaller than or greater than the one we are
	 *     searching for, respectively, if the exact element cannot be found.
	 */
	function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
	  // This function terminates when one of the following is true:
	  //
	  //   1. We find the exact element we are looking for.
	  //
	  //   2. We did not find the exact element, but we can return the index of
	  //      the next-closest element.
	  //
	  //   3. We did not find the exact element, and there is no next-closest
	  //      element than the one we are searching for, so we return -1.
	  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
	  var cmp = aCompare(aNeedle, aHaystack[mid], true);
	  if (cmp === 0) {
	    // Found the element we are looking for.
	    return mid;
	  }
	  else if (cmp > 0) {
	    // Our needle is greater than aHaystack[mid].
	    if (aHigh - mid > 1) {
	      // The element is in the upper half.
	      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
	    }

	    // The exact needle element was not found in this haystack. Determine if
	    // we are in termination case (3) or (2) and return the appropriate thing.
	    if (aBias == exports.LEAST_UPPER_BOUND) {
	      return aHigh < aHaystack.length ? aHigh : -1;
	    } else {
	      return mid;
	    }
	  }
	  else {
	    // Our needle is less than aHaystack[mid].
	    if (mid - aLow > 1) {
	      // The element is in the lower half.
	      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
	    }

	    // we are in termination case (3) or (2) and return the appropriate thing.
	    if (aBias == exports.LEAST_UPPER_BOUND) {
	      return mid;
	    } else {
	      return aLow < 0 ? -1 : aLow;
	    }
	  }
	}

	/**
	 * This is an implementation of binary search which will always try and return
	 * the index of the closest element if there is no exact hit. This is because
	 * mappings between original and generated line/col pairs are single points,
	 * and there is an implicit region between each of them, so a miss just means
	 * that you aren't on the very start of a region.
	 *
	 * @param aNeedle The element you are looking for.
	 * @param aHaystack The array that is being searched.
	 * @param aCompare A function which takes the needle and an element in the
	 *     array and returns -1, 0, or 1 depending on whether the needle is less
	 *     than, equal to, or greater than the element, respectively.
	 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
	 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
	 *     closest element that is smaller than or greater than the one we are
	 *     searching for, respectively, if the exact element cannot be found.
	 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
	 */
	exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
	  if (aHaystack.length === 0) {
	    return -1;
	  }

	  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
	                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
	  if (index < 0) {
	    return -1;
	  }

	  // We have found either the exact element, or the next-closest element than
	  // the one we are searching for. However, there may be more than one such
	  // element. Make sure we always return the smallest of these.
	  while (index - 1 >= 0) {
	    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
	      break;
	    }
	    --index;
	  }

	  return index;
	};
} (binarySearch$1));

var quickSort$1 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

function SortTemplate(comparator) {

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot, false) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

  return doQuickSort;
}

function cloneSort(comparator) {
  let template = SortTemplate.toString();
  let templateFn = new Function(`return ${template}`)();
  return templateFn(comparator);
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */

let sortCache = new WeakMap();
quickSort$1.quickSort = function (ary, comparator, start = 0) {
  let doQuickSort = sortCache.get(comparator);
  if (doQuickSort === void 0) {
    doQuickSort = cloneSort(comparator);
    sortCache.set(comparator, doQuickSort);
  }
  doQuickSort(ary, comparator, start, ary.length - 1);
};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util$2 = util$6;
var binarySearch = binarySearch$1;
var ArraySet = arraySet.ArraySet;
var base64VLQ = base64Vlq;
var quickSort = quickSort$1.quickSort;

function SourceMapConsumer$3(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util$2.parseSourceMapInput(aSourceMap);
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
    : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
}

SourceMapConsumer$3.fromSourceMap = function(aSourceMap, aSourceMapURL) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
};

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer$3.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer$3.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer$3.prototype, '_generatedMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer$3.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer$3.prototype, '_originalMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer$3.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer$3.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer$3.GENERATED_ORDER = 1;
SourceMapConsumer$3.ORIGINAL_ORDER = 2;

SourceMapConsumer$3.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer$3.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer$3.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer$3.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer$3.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer$3.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    var boundCallback = aCallback.bind(context);
    var names = this._names;
    var sources = this._sources;
    var sourceMapURL = this._sourceMapURL;

    for (var i = 0, n = mappings.length; i < n; i++) {
      var mapping = mappings[i];
      var source = mapping.source === null ? null : sources.at(mapping.source);
      source = util$2.computeSourceURL(sourceRoot, source, sourceMapURL);
      boundCallback({
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : names.at(mapping.name)
      });
    }
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number is 1-based.
 *   - column: Optional. the column number in the original source.
 *    The column number is 0-based.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *    line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *    The column number is 0-based.
 */
SourceMapConsumer$3.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util$2.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util$2.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util$2.getArg(aArgs, 'column', 0)
    };

    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util$2.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util$2.getArg(mapping, 'generatedLine', null),
            column: util$2.getArg(mapping, 'generatedColumn', null),
            lastColumn: util$2.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util$2.getArg(mapping, 'generatedLine', null),
            column: util$2.getArg(mapping, 'generatedColumn', null),
            lastColumn: util$2.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

sourceMapConsumer.SourceMapConsumer = SourceMapConsumer$3;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The first parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util$2.parseSourceMapInput(aSourceMap);
  }

  var version = util$2.getArg(sourceMap, 'version');
  var sources = util$2.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util$2.getArg(sourceMap, 'names', []);
  var sourceRoot = util$2.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util$2.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util$2.getArg(sourceMap, 'mappings');
  var file = util$2.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  if (sourceRoot) {
    sourceRoot = util$2.normalize(sourceRoot);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util$2.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util$2.isAbsolute(sourceRoot) && util$2.isAbsolute(source)
        ? util$2.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet.fromArray(names.map(String), true);
  this._sources = ArraySet.fromArray(sources, true);

  this._absoluteSources = this._sources.toArray().map(function (s) {
    return util$2.computeSourceURL(sourceRoot, s, aSourceMapURL);
  });

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this._sourceMapURL = aSourceMapURL;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer$3.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer$3;

/**
 * Utility function to find the index of a source.  Returns -1 if not
 * found.
 */
BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
  var relativeSource = aSource;
  if (this.sourceRoot != null) {
    relativeSource = util$2.relative(this.sourceRoot, relativeSource);
  }

  if (this._sources.has(relativeSource)) {
    return this._sources.indexOf(relativeSource);
  }

  // Maybe aSource is an absolute URL as returned by |sources|.  In
  // this case we can't simply undo the transform.
  var i;
  for (i = 0; i < this._absoluteSources.length; ++i) {
    if (this._absoluteSources[i] == aSource) {
      return i;
    }
  }

  return -1;
};

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @param String aSourceMapURL
 *        The URL at which the source map can be found (optional)
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;
    smc._sourceMapURL = aSourceMapURL;
    smc._absoluteSources = smc._sources.toArray().map(function (s) {
      return util$2.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
    });

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort(smc.__originalMappings, util$2.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._absoluteSources.slice();
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */

const compareGenerated = util$2.compareByGeneratedPositionsDeflatedNoLine;
function sortGenerated(array, start) {
  let l = array.length;
  let n = array.length - start;
  if (n <= 1) {
    return;
  } else if (n == 2) {
    let a = array[start];
    let b = array[start + 1];
    if (compareGenerated(a, b) > 0) {
      array[start] = b;
      array[start + 1] = a;
    }
  } else if (n < 20) {
    for (let i = start; i < l; i++) {
      for (let j = i; j > start; j--) {
        let a = array[j - 1];
        let b = array[j];
        if (compareGenerated(a, b) <= 0) {
          break;
        }
        array[j - 1] = b;
        array[j] = a;
      }
    }
  } else {
    quickSort(array, compareGenerated, start);
  }
}
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, segment, end, value;

    let subarrayStart = 0;
    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;

        sortGenerated(generatedMappings, subarrayStart);
        subarrayStart = generatedMappings.length;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        aStr.slice(index, end);

        segment = [];
        while (index < end) {
          base64VLQ.decode(aStr, index, temp);
          value = temp.value;
          index = temp.rest;
          segment.push(value);
        }

        if (segment.length === 2) {
          throw new Error('Found a source, but no line and column');
        }

        if (segment.length === 3) {
          throw new Error('Found a source and line, but no column');
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          let currentSource = mapping.source;
          while (originalMappings.length <= currentSource) {
            originalMappings.push(null);
          }
          if (originalMappings[currentSource] === null) {
            originalMappings[currentSource] = [];
          }
          originalMappings[currentSource].push(mapping);
        }
      }
    }

    sortGenerated(generatedMappings, subarrayStart);
    this.__generatedMappings = generatedMappings;

    for (var i = 0; i < originalMappings.length; i++) {
      if (originalMappings[i] != null) {
        quickSort(originalMappings[i], util$2.compareByOriginalPositionsNoSource);
      }
    }
    this.__originalMappings = [].concat(...originalMappings);
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util$2.getArg(aArgs, 'line'),
      generatedColumn: util$2.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util$2.compareByGeneratedPositionsDeflated,
      util$2.getArg(aArgs, 'bias', SourceMapConsumer$3.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util$2.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util$2.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }
        var name = util$2.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util$2.getArg(mapping, 'originalLine', null),
          column: util$2.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    var index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }

    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util$2.relative(this.sourceRoot, relativeSource);
    }

    var url;
    if (this.sourceRoot != null
        && (url = util$2.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util$2.getArg(aArgs, 'source');
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }

    var needle = {
      source: source,
      originalLine: util$2.getArg(aArgs, 'line'),
      originalColumn: util$2.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util$2.compareByOriginalPositions,
      util$2.getArg(aArgs, 'bias', SourceMapConsumer$3.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util$2.getArg(mapping, 'generatedLine', null),
          column: util$2.getArg(mapping, 'generatedColumn', null),
          lastColumn: util$2.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

sourceMapConsumer.BasicSourceMapConsumer = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The first parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util$2.parseSourceMapInput(aSourceMap);
  }

  var version = util$2.getArg(sourceMap, 'version');
  var sections = util$2.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet();
  this._names = new ArraySet();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util$2.getArg(s, 'offset');
    var offsetLine = util$2.getArg(offset, 'line');
    var offsetColumn = util$2.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer$3(util$2.getArg(s, 'map'), aSourceMapURL)
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer$3.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer$3;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util$2.getArg(aArgs, 'line'),
      generatedColumn: util$2.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based. 
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer._findSourceIndex(util$2.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        source = util$2.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = null;
        if (mapping.name) {
          name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
        }

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort(this.__generatedMappings, util$2.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, util$2.compareByOriginalPositions);
  };

sourceMapConsumer.IndexedSourceMapConsumer = IndexedSourceMapConsumer;

var sourceNode = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var SourceMapGenerator$3 = sourceMapGenerator.SourceMapGenerator;
var util$1 = util$6;

// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
var REGEX_NEWLINE = /(\r?\n)/;

// Newline character code for charCodeAt() comparisons
var NEWLINE_CODE = 10;

// Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
var isSourceNode = "$$$isSourceNode$$$";

/**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */
function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
  this.children = [];
  this.sourceContents = {};
  this.line = aLine == null ? null : aLine;
  this.column = aColumn == null ? null : aColumn;
  this.source = aSource == null ? null : aSource;
  this.name = aName == null ? null : aName;
  this[isSourceNode] = true;
  if (aChunks != null) this.add(aChunks);
}

/**
 * Creates a SourceNode from generated code and a SourceMapConsumer.
 *
 * @param aGeneratedCode The generated code
 * @param aSourceMapConsumer The SourceMap for the generated code
 * @param aRelativePath Optional. The path that relative sources in the
 *        SourceMapConsumer should be relative to.
 */
SourceNode.fromStringWithSourceMap =
  function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    // The SourceNode we want to fill with the generated code
    // and the SourceMap
    var node = new SourceNode();

    // All even indices of this array are one line of the generated code,
    // while all odd indices are the newlines between two adjacent lines
    // (since `REGEX_NEWLINE` captures its match).
    // Processed fragments are accessed by calling `shiftNextLine`.
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var remainingLinesIndex = 0;
    var shiftNextLine = function() {
      var lineContents = getNextLine();
      // The last line of a file might not have a newline.
      var newLine = getNextLine() || "";
      return lineContents + newLine;

      function getNextLine() {
        return remainingLinesIndex < remainingLines.length ?
            remainingLines[remainingLinesIndex++] : undefined;
      }
    };

    // We need to remember the position of "remainingLines"
    var lastGeneratedLine = 1, lastGeneratedColumn = 0;

    // The generate SourceNodes we need a code range.
    // To extract it current and last mapping is used.
    // Here we store the last mapping.
    var lastMapping = null;

    aSourceMapConsumer.eachMapping(function (mapping) {
      if (lastMapping !== null) {
        // We add the code from "lastMapping" to "mapping":
        // First check if there is a new line in between.
        if (lastGeneratedLine < mapping.generatedLine) {
          // Associate first line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
          // The remaining code is added without mapping
        } else {
          // There is no new line in between.
          // Associate the code between "lastGeneratedColumn" and
          // "mapping.generatedColumn" with "lastMapping"
          var nextLine = remainingLines[remainingLinesIndex] || '';
          var code = nextLine.substr(0, mapping.generatedColumn -
                                        lastGeneratedColumn);
          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn -
                                              lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          // No more remaining code, continue
          lastMapping = mapping;
          return;
        }
      }
      // We add the generated code until the first mapping
      // to the SourceNode without any mapping.
      // Each line is added as separate string.
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[remainingLinesIndex] || '';
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLinesIndex < remainingLines.length) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.splice(remainingLinesIndex).join(""));
    }

    // Copy sourcesContent into SourceNode
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util$1.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });

    return node;

    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath
          ? util$1.join(aRelativePath, mapping.source)
          : mapping.source;
        node.add(new SourceNode(mapping.originalLine,
                                mapping.originalColumn,
                                source,
                                code,
                                mapping.name));
      }
    }
  };

/**
 * Add a chunk of generated JS to this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.add = function SourceNode_add(aChunk) {
  if (Array.isArray(aChunk)) {
    aChunk.forEach(function (chunk) {
      this.add(chunk);
    }, this);
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    if (aChunk) {
      this.children.push(aChunk);
    }
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Add a chunk of generated JS to the beginning of this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
  if (Array.isArray(aChunk)) {
    for (var i = aChunk.length-1; i >= 0; i--) {
      this.prepend(aChunk[i]);
    }
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    this.children.unshift(aChunk);
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Walk over the tree of JS snippets in this node and its children. The
 * walking function is called once for each snippet of JS and is passed that
 * snippet and the its original associated source's line/column location.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walk = function SourceNode_walk(aFn) {
  var chunk;
  for (var i = 0, len = this.children.length; i < len; i++) {
    chunk = this.children[i];
    if (chunk[isSourceNode]) {
      chunk.walk(aFn);
    }
    else {
      if (chunk !== '') {
        aFn(chunk, { source: this.source,
                     line: this.line,
                     column: this.column,
                     name: this.name });
      }
    }
  }
};

/**
 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
 * each of `this.children`.
 *
 * @param aSep The separator.
 */
SourceNode.prototype.join = function SourceNode_join(aSep) {
  var newChildren;
  var i;
  var len = this.children.length;
  if (len > 0) {
    newChildren = [];
    for (i = 0; i < len-1; i++) {
      newChildren.push(this.children[i]);
      newChildren.push(aSep);
    }
    newChildren.push(this.children[i]);
    this.children = newChildren;
  }
  return this;
};

/**
 * Call String.prototype.replace on the very right-most source snippet. Useful
 * for trimming whitespace from the end of a source node, etc.
 *
 * @param aPattern The pattern to replace.
 * @param aReplacement The thing to replace the pattern with.
 */
SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
  var lastChild = this.children[this.children.length - 1];
  if (lastChild[isSourceNode]) {
    lastChild.replaceRight(aPattern, aReplacement);
  }
  else if (typeof lastChild === 'string') {
    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
  }
  else {
    this.children.push(''.replace(aPattern, aReplacement));
  }
  return this;
};

/**
 * Set the source content for a source file. This will be added to the SourceMapGenerator
 * in the sourcesContent field.
 *
 * @param aSourceFile The filename of the source file
 * @param aSourceContent The content of the source file
 */
SourceNode.prototype.setSourceContent =
  function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[util$1.toSetString(aSourceFile)] = aSourceContent;
  };

/**
 * Walk over the tree of SourceNodes. The walking function is called for each
 * source file content and is passed the filename and source content.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walkSourceContents =
  function SourceNode_walkSourceContents(aFn) {
    for (var i = 0, len = this.children.length; i < len; i++) {
      if (this.children[i][isSourceNode]) {
        this.children[i].walkSourceContents(aFn);
      }
    }

    var sources = Object.keys(this.sourceContents);
    for (var i = 0, len = sources.length; i < len; i++) {
      aFn(util$1.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }
  };

/**
 * Return the string representation of this source node. Walks over the tree
 * and concatenates all the various snippets together to one string.
 */
SourceNode.prototype.toString = function SourceNode_toString() {
  var str = "";
  this.walk(function (chunk) {
    str += chunk;
  });
  return str;
};

/**
 * Returns the string representation of this source node along with a source
 * map.
 */
SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
  var generated = {
    code: "",
    line: 1,
    column: 0
  };
  var map = new SourceMapGenerator$3(aArgs);
  var sourceMappingActive = false;
  var lastOriginalSource = null;
  var lastOriginalLine = null;
  var lastOriginalColumn = null;
  var lastOriginalName = null;
  this.walk(function (chunk, original) {
    generated.code += chunk;
    if (original.source !== null
        && original.line !== null
        && original.column !== null) {
      if(lastOriginalSource !== original.source
         || lastOriginalLine !== original.line
         || lastOriginalColumn !== original.column
         || lastOriginalName !== original.name) {
        map.addMapping({
          source: original.source,
          original: {
            line: original.line,
            column: original.column
          },
          generated: {
            line: generated.line,
            column: generated.column
          },
          name: original.name
        });
      }
      lastOriginalSource = original.source;
      lastOriginalLine = original.line;
      lastOriginalColumn = original.column;
      lastOriginalName = original.name;
      sourceMappingActive = true;
    } else if (sourceMappingActive) {
      map.addMapping({
        generated: {
          line: generated.line,
          column: generated.column
        }
      });
      lastOriginalSource = null;
      sourceMappingActive = false;
    }
    for (var idx = 0, length = chunk.length; idx < length; idx++) {
      if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
        generated.line++;
        generated.column = 0;
        // Mappings end at eol
        if (idx + 1 === length) {
          lastOriginalSource = null;
          sourceMappingActive = false;
        } else if (sourceMappingActive) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
      } else {
        generated.column++;
      }
    }
  });
  this.walkSourceContents(function (sourceFile, sourceContent) {
    map.setSourceContent(sourceFile, sourceContent);
  });

  return { code: generated.code, map: map };
};

sourceNode.SourceNode = SourceNode;

/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

sourceMap.SourceMapGenerator = sourceMapGenerator.SourceMapGenerator;
sourceMap.SourceMapConsumer = sourceMapConsumer.SourceMapConsumer;
sourceMap.SourceNode = sourceNode.SourceNode;

let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
let customAlphabet = (alphabet, defaultSize = 21) => {
  return (size = defaultSize) => {
    let id = '';
    let i = size;
    while (i--) {
      id += alphabet[(Math.random() * alphabet.length) | 0];
    }
    return id
  }
};
let nanoid$1 = (size = 21) => {
  let id = '';
  let i = size;
  while (i--) {
    id += urlAlphabet[(Math.random() * 64) | 0];
  }
  return id
};
var nonSecure = { nanoid: nanoid$1, customAlphabet };

let { SourceMapConsumer: SourceMapConsumer$2, SourceMapGenerator: SourceMapGenerator$2 } = sourceMap;
let { existsSync, readFileSync } = require$$1;
let { dirname: dirname$1, join } = require$$2;

function fromBase64(str) {
  if (Buffer) {
    return Buffer.from(str, 'base64').toString()
  } else {
    /* c8 ignore next 2 */
    return window.atob(str)
  }
}

class PreviousMap$2 {
  constructor(css, opts) {
    if (opts.map === false) return
    this.loadAnnotation(css);
    this.inline = this.startWith(this.annotation, 'data:');

    let prev = opts.map ? opts.map.prev : undefined;
    let text = this.loadMap(opts.from, prev);
    if (!this.mapFile && opts.from) {
      this.mapFile = opts.from;
    }
    if (this.mapFile) this.root = dirname$1(this.mapFile);
    if (text) this.text = text;
  }

  consumer() {
    if (!this.consumerCache) {
      this.consumerCache = new SourceMapConsumer$2(this.text);
    }
    return this.consumerCache
  }

  withContent() {
    return !!(
      this.consumer().sourcesContent &&
      this.consumer().sourcesContent.length > 0
    )
  }

  startWith(string, start) {
    if (!string) return false
    return string.substr(0, start.length) === start
  }

  getAnnotationURL(sourceMapString) {
    return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, '').trim()
  }

  loadAnnotation(css) {
    let comments = css.match(/\/\*\s*# sourceMappingURL=/gm);
    if (!comments) return

    // sourceMappingURLs from comments, strings, etc.
    let start = css.lastIndexOf(comments.pop());
    let end = css.indexOf('*/', start);

    if (start > -1 && end > -1) {
      // Locate the last sourceMappingURL to avoid pickin
      this.annotation = this.getAnnotationURL(css.substring(start, end));
    }
  }

  decodeInline(text) {
    let baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
    let baseUri = /^data:application\/json;base64,/;
    let charsetUri = /^data:application\/json;charset=utf-?8,/;
    let uri = /^data:application\/json,/;

    if (charsetUri.test(text) || uri.test(text)) {
      return decodeURIComponent(text.substr(RegExp.lastMatch.length))
    }

    if (baseCharsetUri.test(text) || baseUri.test(text)) {
      return fromBase64(text.substr(RegExp.lastMatch.length))
    }

    let encoding = text.match(/data:application\/json;([^,]+),/)[1];
    throw new Error('Unsupported source map encoding ' + encoding)
  }

  loadFile(path) {
    this.root = dirname$1(path);
    if (existsSync(path)) {
      this.mapFile = path;
      return readFileSync(path, 'utf-8').toString().trim()
    }
  }

  loadMap(file, prev) {
    if (prev === false) return false

    if (prev) {
      if (typeof prev === 'string') {
        return prev
      } else if (typeof prev === 'function') {
        let prevPath = prev(file);
        if (prevPath) {
          let map = this.loadFile(prevPath);
          if (!map) {
            throw new Error(
              'Unable to load previous source map: ' + prevPath.toString()
            )
          }
          return map
        }
      } else if (prev instanceof SourceMapConsumer$2) {
        return SourceMapGenerator$2.fromSourceMap(prev).toString()
      } else if (prev instanceof SourceMapGenerator$2) {
        return prev.toString()
      } else if (this.isMap(prev)) {
        return JSON.stringify(prev)
      } else {
        throw new Error(
          'Unsupported previous source map format: ' + prev.toString()
        )
      }
    } else if (this.inline) {
      return this.decodeInline(this.annotation)
    } else if (this.annotation) {
      let map = this.annotation;
      if (file) map = join(dirname$1(file), map);
      return this.loadFile(map)
    }
  }

  isMap(map) {
    if (typeof map !== 'object') return false
    return (
      typeof map.mappings === 'string' ||
      typeof map._mappings === 'string' ||
      Array.isArray(map.sections)
    )
  }
}

var previousMap = PreviousMap$2;
PreviousMap$2.default = PreviousMap$2;

let { SourceMapConsumer: SourceMapConsumer$1, SourceMapGenerator: SourceMapGenerator$1 } = sourceMap;
let { fileURLToPath, pathToFileURL: pathToFileURL$1 } = require$$1$1;
let { resolve: resolve$1, isAbsolute } = require$$2;
let { nanoid } = nonSecure;

let terminalHighlight = terminalHighlight_1;
let CssSyntaxError$1 = cssSyntaxError;
let PreviousMap$1 = previousMap;

let fromOffsetCache = Symbol('fromOffsetCache');

let sourceMapAvailable$1 = Boolean(SourceMapConsumer$1 && SourceMapGenerator$1);
let pathAvailable$1 = Boolean(resolve$1 && isAbsolute);

class Input$4 {
  constructor(css, opts = {}) {
    if (
      css === null ||
      typeof css === 'undefined' ||
      (typeof css === 'object' && !css.toString)
    ) {
      throw new Error(`PostCSS received ${css} instead of CSS string`)
    }

    this.css = css.toString();

    if (this.css[0] === '\uFEFF' || this.css[0] === '\uFFFE') {
      this.hasBOM = true;
      this.css = this.css.slice(1);
    } else {
      this.hasBOM = false;
    }

    if (opts.from) {
      if (
        !pathAvailable$1 ||
        /^\w+:\/\//.test(opts.from) ||
        isAbsolute(opts.from)
      ) {
        this.file = opts.from;
      } else {
        this.file = resolve$1(opts.from);
      }
    }

    if (pathAvailable$1 && sourceMapAvailable$1) {
      let map = new PreviousMap$1(this.css, opts);
      if (map.text) {
        this.map = map;
        let file = map.consumer().file;
        if (!this.file && file) this.file = this.mapResolve(file);
      }
    }

    if (!this.file) {
      this.id = '<input css ' + nanoid(6) + '>';
    }
    if (this.map) this.map.file = this.from;
  }

  fromOffset(offset) {
    let lastLine, lineToIndex;
    if (!this[fromOffsetCache]) {
      let lines = this.css.split('\n');
      lineToIndex = new Array(lines.length);
      let prevIndex = 0;

      for (let i = 0, l = lines.length; i < l; i++) {
        lineToIndex[i] = prevIndex;
        prevIndex += lines[i].length + 1;
      }

      this[fromOffsetCache] = lineToIndex;
    } else {
      lineToIndex = this[fromOffsetCache];
    }
    lastLine = lineToIndex[lineToIndex.length - 1];

    let min = 0;
    if (offset >= lastLine) {
      min = lineToIndex.length - 1;
    } else {
      let max = lineToIndex.length - 2;
      let mid;
      while (min < max) {
        mid = min + ((max - min) >> 1);
        if (offset < lineToIndex[mid]) {
          max = mid - 1;
        } else if (offset >= lineToIndex[mid + 1]) {
          min = mid + 1;
        } else {
          min = mid;
          break
        }
      }
    }
    return {
      line: min + 1,
      col: offset - lineToIndex[min] + 1
    }
  }

  error(message, line, column, opts = {}) {
    let result, endLine, endColumn;

    if (line && typeof line === 'object') {
      let start = line;
      let end = column;
      if (typeof line.offset === 'number') {
        let pos = this.fromOffset(start.offset);
        line = pos.line;
        column = pos.col;
      } else {
        line = start.line;
        column = start.column;
      }
      if (typeof end.offset === 'number') {
        let pos = this.fromOffset(end.offset);
        endLine = pos.line;
        endColumn = pos.col;
      } else {
        endLine = end.line;
        endColumn = end.column;
      }
    } else if (!column) {
      let pos = this.fromOffset(line);
      line = pos.line;
      column = pos.col;
    }

    let origin = this.origin(line, column, endLine, endColumn);
    if (origin) {
      result = new CssSyntaxError$1(
        message,
        origin.endLine === undefined
          ? origin.line
          : { line: origin.line, column: origin.column },
        origin.endLine === undefined
          ? origin.column
          : { line: origin.endLine, column: origin.endColumn },
        origin.source,
        origin.file,
        opts.plugin
      );
    } else {
      result = new CssSyntaxError$1(
        message,
        endLine === undefined ? line : { line, column },
        endLine === undefined ? column : { line: endLine, column: endColumn },
        this.css,
        this.file,
        opts.plugin
      );
    }

    result.input = { line, column, endLine, endColumn, source: this.css };
    if (this.file) {
      if (pathToFileURL$1) {
        result.input.url = pathToFileURL$1(this.file).toString();
      }
      result.input.file = this.file;
    }

    return result
  }

  origin(line, column, endLine, endColumn) {
    if (!this.map) return false
    let consumer = this.map.consumer();

    let from = consumer.originalPositionFor({ line, column });
    if (!from.source) return false

    let to;
    if (typeof endLine === 'number') {
      to = consumer.originalPositionFor({ line: endLine, column: endColumn });
    }

    let fromUrl;

    if (isAbsolute(from.source)) {
      fromUrl = pathToFileURL$1(from.source);
    } else {
      fromUrl = new URL(
        from.source,
        this.map.consumer().sourceRoot || pathToFileURL$1(this.map.mapFile)
      );
    }

    let result = {
      url: fromUrl.toString(),
      line: from.line,
      column: from.column,
      endLine: to && to.line,
      endColumn: to && to.column
    };

    if (fromUrl.protocol === 'file:') {
      if (fileURLToPath) {
        result.file = fileURLToPath(fromUrl);
      } else {
        /* c8 ignore next 2 */
        throw new Error(`file: protocol is not available in this PostCSS build`)
      }
    }

    let source = consumer.sourceContentFor(from.source);
    if (source) result.source = source;

    return result
  }

  mapResolve(file) {
    if (/^\w+:\/\//.test(file)) {
      return file
    }
    return resolve$1(this.map.consumer().sourceRoot || this.map.root || '.', file)
  }

  get from() {
    return this.file || this.id
  }

  toJSON() {
    let json = {};
    for (let name of ['hasBOM', 'css', 'file', 'id']) {
      if (this[name] != null) {
        json[name] = this[name];
      }
    }
    if (this.map) {
      json.map = { ...this.map };
      if (json.map.consumerCache) {
        json.map.consumerCache = undefined;
      }
    }
    return json
  }
}

var input = Input$4;
Input$4.default = Input$4;

if (terminalHighlight && terminalHighlight.registerInput) {
  terminalHighlight.registerInput(Input$4);
}

let { SourceMapConsumer, SourceMapGenerator } = sourceMap;
let { dirname, resolve, relative, sep } = require$$2;
let { pathToFileURL } = require$$1$1;

let Input$3 = input;

let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
let pathAvailable = Boolean(dirname && resolve && relative && sep);

class MapGenerator$2 {
  constructor(stringify, root, opts, cssString) {
    this.stringify = stringify;
    this.mapOpts = opts.map || {};
    this.root = root;
    this.opts = opts;
    this.css = cssString;
  }

  isMap() {
    if (typeof this.opts.map !== 'undefined') {
      return !!this.opts.map
    }
    return this.previous().length > 0
  }

  previous() {
    if (!this.previousMaps) {
      this.previousMaps = [];
      if (this.root) {
        this.root.walk(node => {
          if (node.source && node.source.input.map) {
            let map = node.source.input.map;
            if (!this.previousMaps.includes(map)) {
              this.previousMaps.push(map);
            }
          }
        });
      } else {
        let input = new Input$3(this.css, this.opts);
        if (input.map) this.previousMaps.push(input.map);
      }
    }

    return this.previousMaps
  }

  isInline() {
    if (typeof this.mapOpts.inline !== 'undefined') {
      return this.mapOpts.inline
    }

    let annotation = this.mapOpts.annotation;
    if (typeof annotation !== 'undefined' && annotation !== true) {
      return false
    }

    if (this.previous().length) {
      return this.previous().some(i => i.inline)
    }
    return true
  }

  isSourcesContent() {
    if (typeof this.mapOpts.sourcesContent !== 'undefined') {
      return this.mapOpts.sourcesContent
    }
    if (this.previous().length) {
      return this.previous().some(i => i.withContent())
    }
    return true
  }

  clearAnnotation() {
    if (this.mapOpts.annotation === false) return

    if (this.root) {
      let node;
      for (let i = this.root.nodes.length - 1; i >= 0; i--) {
        node = this.root.nodes[i];
        if (node.type !== 'comment') continue
        if (node.text.indexOf('# sourceMappingURL=') === 0) {
          this.root.removeChild(i);
        }
      }
    } else if (this.css) {
      this.css = this.css.replace(/(\n)?\/\*#[\S\s]*?\*\/$/gm, '');
    }
  }

  setSourcesContent() {
    let already = {};
    if (this.root) {
      this.root.walk(node => {
        if (node.source) {
          let from = node.source.input.from;
          if (from && !already[from]) {
            already[from] = true;
            this.map.setSourceContent(
              this.toUrl(this.path(from)),
              node.source.input.css
            );
          }
        }
      });
    } else if (this.css) {
      let from = this.opts.from
        ? this.toUrl(this.path(this.opts.from))
        : '<no source>';
      this.map.setSourceContent(from, this.css);
    }
  }

  applyPrevMaps() {
    for (let prev of this.previous()) {
      let from = this.toUrl(this.path(prev.file));
      let root = prev.root || dirname(prev.file);
      let map;

      if (this.mapOpts.sourcesContent === false) {
        map = new SourceMapConsumer(prev.text);
        if (map.sourcesContent) {
          map.sourcesContent = map.sourcesContent.map(() => null);
        }
      } else {
        map = prev.consumer();
      }

      this.map.applySourceMap(map, from, this.toUrl(this.path(root)));
    }
  }

  isAnnotation() {
    if (this.isInline()) {
      return true
    }
    if (typeof this.mapOpts.annotation !== 'undefined') {
      return this.mapOpts.annotation
    }
    if (this.previous().length) {
      return this.previous().some(i => i.annotation)
    }
    return true
  }

  toBase64(str) {
    if (Buffer) {
      return Buffer.from(str).toString('base64')
    } else {
      return window.btoa(unescape(encodeURIComponent(str)))
    }
  }

  addAnnotation() {
    let content;

    if (this.isInline()) {
      content =
        'data:application/json;base64,' + this.toBase64(this.map.toString());
    } else if (typeof this.mapOpts.annotation === 'string') {
      content = this.mapOpts.annotation;
    } else if (typeof this.mapOpts.annotation === 'function') {
      content = this.mapOpts.annotation(this.opts.to, this.root);
    } else {
      content = this.outputFile() + '.map';
    }
    let eol = '\n';
    if (this.css.includes('\r\n')) eol = '\r\n';

    this.css += eol + '/*# sourceMappingURL=' + content + ' */';
  }

  outputFile() {
    if (this.opts.to) {
      return this.path(this.opts.to)
    } else if (this.opts.from) {
      return this.path(this.opts.from)
    } else {
      return 'to.css'
    }
  }

  generateMap() {
    if (this.root) {
      this.generateString();
    } else if (this.previous().length === 1) {
      let prev = this.previous()[0].consumer();
      prev.file = this.outputFile();
      this.map = SourceMapGenerator.fromSourceMap(prev);
    } else {
      this.map = new SourceMapGenerator({ file: this.outputFile() });
      this.map.addMapping({
        source: this.opts.from
          ? this.toUrl(this.path(this.opts.from))
          : '<no source>',
        generated: { line: 1, column: 0 },
        original: { line: 1, column: 0 }
      });
    }

    if (this.isSourcesContent()) this.setSourcesContent();
    if (this.root && this.previous().length > 0) this.applyPrevMaps();
    if (this.isAnnotation()) this.addAnnotation();

    if (this.isInline()) {
      return [this.css]
    } else {
      return [this.css, this.map]
    }
  }

  path(file) {
    if (file.indexOf('<') === 0) return file
    if (/^\w+:\/\//.test(file)) return file
    if (this.mapOpts.absolute) return file

    let from = this.opts.to ? dirname(this.opts.to) : '.';

    if (typeof this.mapOpts.annotation === 'string') {
      from = dirname(resolve(from, this.mapOpts.annotation));
    }

    file = relative(from, file);
    return file
  }

  toUrl(path) {
    if (sep === '\\') {
      path = path.replace(/\\/g, '/');
    }
    return encodeURI(path).replace(/[#?]/g, encodeURIComponent)
  }

  sourcePath(node) {
    if (this.mapOpts.from) {
      return this.toUrl(this.mapOpts.from)
    } else if (this.mapOpts.absolute) {
      if (pathToFileURL) {
        return pathToFileURL(node.source.input.from).toString()
      } else {
        throw new Error(
          '`map.absolute` option is not available in this PostCSS build'
        )
      }
    } else {
      return this.toUrl(this.path(node.source.input.from))
    }
  }

  generateString() {
    this.css = '';
    this.map = new SourceMapGenerator({ file: this.outputFile() });

    let line = 1;
    let column = 1;

    let noSource = '<no source>';
    let mapping = {
      source: '',
      generated: { line: 0, column: 0 },
      original: { line: 0, column: 0 }
    };

    let lines, last;
    this.stringify(this.root, (str, node, type) => {
      this.css += str;

      if (node && type !== 'end') {
        mapping.generated.line = line;
        mapping.generated.column = column - 1;
        if (node.source && node.source.start) {
          mapping.source = this.sourcePath(node);
          mapping.original.line = node.source.start.line;
          mapping.original.column = node.source.start.column - 1;
          this.map.addMapping(mapping);
        } else {
          mapping.source = noSource;
          mapping.original.line = 1;
          mapping.original.column = 0;
          this.map.addMapping(mapping);
        }
      }

      lines = str.match(/\n/g);
      if (lines) {
        line += lines.length;
        last = str.lastIndexOf('\n');
        column = str.length - last;
      } else {
        column += str.length;
      }

      if (node && type !== 'start') {
        let p = node.parent || { raws: {} };
        if (node.type !== 'decl' || node !== p.last || p.raws.semicolon) {
          if (node.source && node.source.end) {
            mapping.source = this.sourcePath(node);
            mapping.original.line = node.source.end.line;
            mapping.original.column = node.source.end.column - 1;
            mapping.generated.line = line;
            mapping.generated.column = column - 2;
            this.map.addMapping(mapping);
          } else {
            mapping.source = noSource;
            mapping.original.line = 1;
            mapping.original.column = 0;
            mapping.generated.line = line;
            mapping.generated.column = column - 1;
            this.map.addMapping(mapping);
          }
        }
      }
    });
  }

  generate() {
    this.clearAnnotation();
    if (pathAvailable && sourceMapAvailable && this.isMap()) {
      return this.generateMap()
    } else {
      let result = '';
      this.stringify(this.root, i => {
        result += i;
      });
      return [result]
    }
  }
}

var mapGenerator = MapGenerator$2;

let Node$2 = node_1;

class Comment$4 extends Node$2 {
  constructor(defaults) {
    super(defaults);
    this.type = 'comment';
  }
}

var comment$3 = Comment$4;
Comment$4.default = Comment$4;

let { isClean: isClean$1, my: my$1 } = symbols;
let Declaration$3 = declaration;
let Comment$3 = comment$3;
let Node$1 = node_1;

let parse$4, Rule$4, AtRule$4;

function cleanSource(nodes) {
  return nodes.map(i => {
    if (i.nodes) i.nodes = cleanSource(i.nodes);
    delete i.source;
    return i
  })
}

function markDirtyUp(node) {
  node[isClean$1] = false;
  if (node.proxyOf.nodes) {
    for (let i of node.proxyOf.nodes) {
      markDirtyUp(i);
    }
  }
}

class Container$7 extends Node$1 {
  push(child) {
    child.parent = this;
    this.proxyOf.nodes.push(child);
    return this
  }

  each(callback) {
    if (!this.proxyOf.nodes) return undefined
    let iterator = this.getIterator();

    let index, result;
    while (this.indexes[iterator] < this.proxyOf.nodes.length) {
      index = this.indexes[iterator];
      result = callback(this.proxyOf.nodes[index], index);
      if (result === false) break

      this.indexes[iterator] += 1;
    }

    delete this.indexes[iterator];
    return result
  }

  walk(callback) {
    return this.each((child, i) => {
      let result;
      try {
        result = callback(child, i);
      } catch (e) {
        throw child.addToError(e)
      }
      if (result !== false && child.walk) {
        result = child.walk(callback);
      }

      return result
    })
  }

  walkDecls(prop, callback) {
    if (!callback) {
      callback = prop;
      return this.walk((child, i) => {
        if (child.type === 'decl') {
          return callback(child, i)
        }
      })
    }
    if (prop instanceof RegExp) {
      return this.walk((child, i) => {
        if (child.type === 'decl' && prop.test(child.prop)) {
          return callback(child, i)
        }
      })
    }
    return this.walk((child, i) => {
      if (child.type === 'decl' && child.prop === prop) {
        return callback(child, i)
      }
    })
  }

  walkRules(selector, callback) {
    if (!callback) {
      callback = selector;

      return this.walk((child, i) => {
        if (child.type === 'rule') {
          return callback(child, i)
        }
      })
    }
    if (selector instanceof RegExp) {
      return this.walk((child, i) => {
        if (child.type === 'rule' && selector.test(child.selector)) {
          return callback(child, i)
        }
      })
    }
    return this.walk((child, i) => {
      if (child.type === 'rule' && child.selector === selector) {
        return callback(child, i)
      }
    })
  }

  walkAtRules(name, callback) {
    if (!callback) {
      callback = name;
      return this.walk((child, i) => {
        if (child.type === 'atrule') {
          return callback(child, i)
        }
      })
    }
    if (name instanceof RegExp) {
      return this.walk((child, i) => {
        if (child.type === 'atrule' && name.test(child.name)) {
          return callback(child, i)
        }
      })
    }
    return this.walk((child, i) => {
      if (child.type === 'atrule' && child.name === name) {
        return callback(child, i)
      }
    })
  }

  walkComments(callback) {
    return this.walk((child, i) => {
      if (child.type === 'comment') {
        return callback(child, i)
      }
    })
  }

  append(...children) {
    for (let child of children) {
      let nodes = this.normalize(child, this.last);
      for (let node of nodes) this.proxyOf.nodes.push(node);
    }

    this.markDirty();

    return this
  }

  prepend(...children) {
    children = children.reverse();
    for (let child of children) {
      let nodes = this.normalize(child, this.first, 'prepend').reverse();
      for (let node of nodes) this.proxyOf.nodes.unshift(node);
      for (let id in this.indexes) {
        this.indexes[id] = this.indexes[id] + nodes.length;
      }
    }

    this.markDirty();

    return this
  }

  cleanRaws(keepBetween) {
    super.cleanRaws(keepBetween);
    if (this.nodes) {
      for (let node of this.nodes) node.cleanRaws(keepBetween);
    }
  }

  insertBefore(exist, add) {
    exist = this.index(exist);

    let type = exist === 0 ? 'prepend' : false;
    let nodes = this.normalize(add, this.proxyOf.nodes[exist], type).reverse();
    for (let node of nodes) this.proxyOf.nodes.splice(exist, 0, node);

    let index;
    for (let id in this.indexes) {
      index = this.indexes[id];
      if (exist <= index) {
        this.indexes[id] = index + nodes.length;
      }
    }

    this.markDirty();

    return this
  }

  insertAfter(exist, add) {
    exist = this.index(exist);

    let nodes = this.normalize(add, this.proxyOf.nodes[exist]).reverse();
    for (let node of nodes) this.proxyOf.nodes.splice(exist + 1, 0, node);

    let index;
    for (let id in this.indexes) {
      index = this.indexes[id];
      if (exist < index) {
        this.indexes[id] = index + nodes.length;
      }
    }

    this.markDirty();

    return this
  }

  removeChild(child) {
    child = this.index(child);
    this.proxyOf.nodes[child].parent = undefined;
    this.proxyOf.nodes.splice(child, 1);

    let index;
    for (let id in this.indexes) {
      index = this.indexes[id];
      if (index >= child) {
        this.indexes[id] = index - 1;
      }
    }

    this.markDirty();

    return this
  }

  removeAll() {
    for (let node of this.proxyOf.nodes) node.parent = undefined;
    this.proxyOf.nodes = [];

    this.markDirty();

    return this
  }

  replaceValues(pattern, opts, callback) {
    if (!callback) {
      callback = opts;
      opts = {};
    }

    this.walkDecls(decl => {
      if (opts.props && !opts.props.includes(decl.prop)) return
      if (opts.fast && !decl.value.includes(opts.fast)) return

      decl.value = decl.value.replace(pattern, callback);
    });

    this.markDirty();

    return this
  }

  every(condition) {
    return this.nodes.every(condition)
  }

  some(condition) {
    return this.nodes.some(condition)
  }

  index(child) {
    if (typeof child === 'number') return child
    if (child.proxyOf) child = child.proxyOf;
    return this.proxyOf.nodes.indexOf(child)
  }

  get first() {
    if (!this.proxyOf.nodes) return undefined
    return this.proxyOf.nodes[0]
  }

  get last() {
    if (!this.proxyOf.nodes) return undefined
    return this.proxyOf.nodes[this.proxyOf.nodes.length - 1]
  }

  normalize(nodes, sample) {
    if (typeof nodes === 'string') {
      nodes = cleanSource(parse$4(nodes).nodes);
    } else if (Array.isArray(nodes)) {
      nodes = nodes.slice(0);
      for (let i of nodes) {
        if (i.parent) i.parent.removeChild(i, 'ignore');
      }
    } else if (nodes.type === 'root' && this.type !== 'document') {
      nodes = nodes.nodes.slice(0);
      for (let i of nodes) {
        if (i.parent) i.parent.removeChild(i, 'ignore');
      }
    } else if (nodes.type) {
      nodes = [nodes];
    } else if (nodes.prop) {
      if (typeof nodes.value === 'undefined') {
        throw new Error('Value field is missed in node creation')
      } else if (typeof nodes.value !== 'string') {
        nodes.value = String(nodes.value);
      }
      nodes = [new Declaration$3(nodes)];
    } else if (nodes.selector) {
      nodes = [new Rule$4(nodes)];
    } else if (nodes.name) {
      nodes = [new AtRule$4(nodes)];
    } else if (nodes.text) {
      nodes = [new Comment$3(nodes)];
    } else {
      throw new Error('Unknown node type in node creation')
    }

    let processed = nodes.map(i => {
      /* c8 ignore next */
      if (!i[my$1]) Container$7.rebuild(i);
      i = i.proxyOf;
      if (i.parent) i.parent.removeChild(i);
      if (i[isClean$1]) markDirtyUp(i);
      if (typeof i.raws.before === 'undefined') {
        if (sample && typeof sample.raws.before !== 'undefined') {
          i.raws.before = sample.raws.before.replace(/\S/g, '');
        }
      }
      i.parent = this.proxyOf;
      return i
    });

    return processed
  }

  getProxyProcessor() {
    return {
      set(node, prop, value) {
        if (node[prop] === value) return true
        node[prop] = value;
        if (prop === 'name' || prop === 'params' || prop === 'selector') {
          node.markDirty();
        }
        return true
      },

      get(node, prop) {
        if (prop === 'proxyOf') {
          return node
        } else if (!node[prop]) {
          return node[prop]
        } else if (
          prop === 'each' ||
          (typeof prop === 'string' && prop.startsWith('walk'))
        ) {
          return (...args) => {
            return node[prop](
              ...args.map(i => {
                if (typeof i === 'function') {
                  return (child, index) => i(child.toProxy(), index)
                } else {
                  return i
                }
              })
            )
          }
        } else if (prop === 'every' || prop === 'some') {
          return cb => {
            return node[prop]((child, ...other) =>
              cb(child.toProxy(), ...other)
            )
          }
        } else if (prop === 'root') {
          return () => node.root().toProxy()
        } else if (prop === 'nodes') {
          return node.nodes.map(i => i.toProxy())
        } else if (prop === 'first' || prop === 'last') {
          return node[prop].toProxy()
        } else {
          return node[prop]
        }
      }
    }
  }

  getIterator() {
    if (!this.lastEach) this.lastEach = 0;
    if (!this.indexes) this.indexes = {};

    this.lastEach += 1;
    let iterator = this.lastEach;
    this.indexes[iterator] = 0;

    return iterator
  }
}

Container$7.registerParse = dependant => {
  parse$4 = dependant;
};

Container$7.registerRule = dependant => {
  Rule$4 = dependant;
};

Container$7.registerAtRule = dependant => {
  AtRule$4 = dependant;
};

var container$1 = Container$7;
Container$7.default = Container$7;

/* c8 ignore start */
Container$7.rebuild = node => {
  if (node.type === 'atrule') {
    Object.setPrototypeOf(node, AtRule$4.prototype);
  } else if (node.type === 'rule') {
    Object.setPrototypeOf(node, Rule$4.prototype);
  } else if (node.type === 'decl') {
    Object.setPrototypeOf(node, Declaration$3.prototype);
  } else if (node.type === 'comment') {
    Object.setPrototypeOf(node, Comment$3.prototype);
  }

  node[my$1] = true;

  if (node.nodes) {
    node.nodes.forEach(child => {
      Container$7.rebuild(child);
    });
  }
};

let Container$6 = container$1;

let LazyResult$4, Processor$3;

class Document$3 extends Container$6 {
  constructor(defaults) {
    // type needs to be passed to super, otherwise child roots won't be normalized correctly
    super({ type: 'document', ...defaults });

    if (!this.nodes) {
      this.nodes = [];
    }
  }

  toResult(opts = {}) {
    let lazy = new LazyResult$4(new Processor$3(), this, opts);

    return lazy.stringify()
  }
}

Document$3.registerLazyResult = dependant => {
  LazyResult$4 = dependant;
};

Document$3.registerProcessor = dependant => {
  Processor$3 = dependant;
};

var document = Document$3;
Document$3.default = Document$3;

/* eslint-disable no-console */

let printed = {};

var warnOnce$2 = function warnOnce(message) {
  if (printed[message]) return
  printed[message] = true;

  if (typeof console !== 'undefined' && console.warn) {
    console.warn(message);
  }
};

class Warning$2 {
  constructor(text, opts = {}) {
    this.type = 'warning';
    this.text = text;

    if (opts.node && opts.node.source) {
      let range = opts.node.rangeBy(opts);
      this.line = range.start.line;
      this.column = range.start.column;
      this.endLine = range.end.line;
      this.endColumn = range.end.column;
    }

    for (let opt in opts) this[opt] = opts[opt];
  }

  toString() {
    if (this.node) {
      return this.node.error(this.text, {
        plugin: this.plugin,
        index: this.index,
        word: this.word
      }).message
    }

    if (this.plugin) {
      return this.plugin + ': ' + this.text
    }

    return this.text
  }
}

var warning = Warning$2;
Warning$2.default = Warning$2;

let Warning$1 = warning;

class Result$3 {
  constructor(processor, root, opts) {
    this.processor = processor;
    this.messages = [];
    this.root = root;
    this.opts = opts;
    this.css = undefined;
    this.map = undefined;
  }

  toString() {
    return this.css
  }

  warn(text, opts = {}) {
    if (!opts.plugin) {
      if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
        opts.plugin = this.lastPlugin.postcssPlugin;
      }
    }

    let warning = new Warning$1(text, opts);
    this.messages.push(warning);

    return warning
  }

  warnings() {
    return this.messages.filter(i => i.type === 'warning')
  }

  get content() {
    return this.css
  }
}

var result = Result$3;
Result$3.default = Result$3;

let Container$5 = container$1;

class AtRule$3 extends Container$5 {
  constructor(defaults) {
    super(defaults);
    this.type = 'atrule';
  }

  append(...children) {
    if (!this.proxyOf.nodes) this.nodes = [];
    return super.append(...children)
  }

  prepend(...children) {
    if (!this.proxyOf.nodes) this.nodes = [];
    return super.prepend(...children)
  }
}

var atRule = AtRule$3;
AtRule$3.default = AtRule$3;

Container$5.registerAtRule(AtRule$3);

let Container$4 = container$1;

let LazyResult$3, Processor$2;

class Root$5 extends Container$4 {
  constructor(defaults) {
    super(defaults);
    this.type = 'root';
    if (!this.nodes) this.nodes = [];
  }

  removeChild(child, ignore) {
    let index = this.index(child);

    if (!ignore && index === 0 && this.nodes.length > 1) {
      this.nodes[1].raws.before = this.nodes[index].raws.before;
    }

    return super.removeChild(child)
  }

  normalize(child, sample, type) {
    let nodes = super.normalize(child);

    if (sample) {
      if (type === 'prepend') {
        if (this.nodes.length > 1) {
          sample.raws.before = this.nodes[1].raws.before;
        } else {
          delete sample.raws.before;
        }
      } else if (this.first !== sample) {
        for (let node of nodes) {
          node.raws.before = sample.raws.before;
        }
      }
    }

    return nodes
  }

  toResult(opts = {}) {
    let lazy = new LazyResult$3(new Processor$2(), this, opts);
    return lazy.stringify()
  }
}

Root$5.registerLazyResult = dependant => {
  LazyResult$3 = dependant;
};

Root$5.registerProcessor = dependant => {
  Processor$2 = dependant;
};

var root$2 = Root$5;
Root$5.default = Root$5;

let list$2 = {
  split(string, separators, last) {
    let array = [];
    let current = '';
    let split = false;

    let func = 0;
    let quote = false;
    let escape = false;

    for (let letter of string) {
      if (escape) {
        escape = false;
      } else if (letter === '\\') {
        escape = true;
      } else if (quote) {
        if (letter === quote) {
          quote = false;
        }
      } else if (letter === '"' || letter === "'") {
        quote = letter;
      } else if (letter === '(') {
        func += 1;
      } else if (letter === ')') {
        if (func > 0) func -= 1;
      } else if (func === 0) {
        if (separators.includes(letter)) split = true;
      }

      if (split) {
        if (current !== '') array.push(current.trim());
        current = '';
        split = false;
      } else {
        current += letter;
      }
    }

    if (last || current !== '') array.push(current.trim());
    return array
  },

  space(string) {
    let spaces = [' ', '\n', '\t'];
    return list$2.split(string, spaces)
  },

  comma(string) {
    return list$2.split(string, [','], true)
  }
};

var list_1 = list$2;
list$2.default = list$2;

let Container$3 = container$1;
let list$1 = list_1;

class Rule$3 extends Container$3 {
  constructor(defaults) {
    super(defaults);
    this.type = 'rule';
    if (!this.nodes) this.nodes = [];
  }

  get selectors() {
    return list$1.comma(this.selector)
  }

  set selectors(values) {
    let match = this.selector ? this.selector.match(/,\s*/) : null;
    let sep = match ? match[0] : ',' + this.raw('between', 'beforeOpen');
    this.selector = values.join(sep);
  }
}

var rule = Rule$3;
Rule$3.default = Rule$3;

Container$3.registerRule(Rule$3);

let Declaration$2 = declaration;
let tokenizer = tokenize$1;
let Comment$2 = comment$3;
let AtRule$2 = atRule;
let Root$4 = root$2;
let Rule$2 = rule;

const SAFE_COMMENT_NEIGHBOR = {
  empty: true,
  space: true
};

function findLastWithPosition(tokens) {
  for (let i = tokens.length - 1; i >= 0; i--) {
    let token = tokens[i];
    let pos = token[3] || token[2];
    if (pos) return pos
  }
}

class Parser$1 {
  constructor(input) {
    this.input = input;

    this.root = new Root$4();
    this.current = this.root;
    this.spaces = '';
    this.semicolon = false;
    this.customProperty = false;

    this.createTokenizer();
    this.root.source = { input, start: { offset: 0, line: 1, column: 1 } };
  }

  createTokenizer() {
    this.tokenizer = tokenizer(this.input);
  }

  parse() {
    let token;
    while (!this.tokenizer.endOfFile()) {
      token = this.tokenizer.nextToken();

      switch (token[0]) {
        case 'space':
          this.spaces += token[1];
          break

        case ';':
          this.freeSemicolon(token);
          break

        case '}':
          this.end(token);
          break

        case 'comment':
          this.comment(token);
          break

        case 'at-word':
          this.atrule(token);
          break

        case '{':
          this.emptyRule(token);
          break

        default:
          this.other(token);
          break
      }
    }
    this.endFile();
  }

  comment(token) {
    let node = new Comment$2();
    this.init(node, token[2]);
    node.source.end = this.getPosition(token[3] || token[2]);

    let text = token[1].slice(2, -2);
    if (/^\s*$/.test(text)) {
      node.text = '';
      node.raws.left = text;
      node.raws.right = '';
    } else {
      let match = text.match(/^(\s*)([^]*\S)(\s*)$/);
      node.text = match[2];
      node.raws.left = match[1];
      node.raws.right = match[3];
    }
  }

  emptyRule(token) {
    let node = new Rule$2();
    this.init(node, token[2]);
    node.selector = '';
    node.raws.between = '';
    this.current = node;
  }

  other(start) {
    let end = false;
    let type = null;
    let colon = false;
    let bracket = null;
    let brackets = [];
    let customProperty = start[1].startsWith('--');

    let tokens = [];
    let token = start;
    while (token) {
      type = token[0];
      tokens.push(token);

      if (type === '(' || type === '[') {
        if (!bracket) bracket = token;
        brackets.push(type === '(' ? ')' : ']');
      } else if (customProperty && colon && type === '{') {
        if (!bracket) bracket = token;
        brackets.push('}');
      } else if (brackets.length === 0) {
        if (type === ';') {
          if (colon) {
            this.decl(tokens, customProperty);
            return
          } else {
            break
          }
        } else if (type === '{') {
          this.rule(tokens);
          return
        } else if (type === '}') {
          this.tokenizer.back(tokens.pop());
          end = true;
          break
        } else if (type === ':') {
          colon = true;
        }
      } else if (type === brackets[brackets.length - 1]) {
        brackets.pop();
        if (brackets.length === 0) bracket = null;
      }

      token = this.tokenizer.nextToken();
    }

    if (this.tokenizer.endOfFile()) end = true;
    if (brackets.length > 0) this.unclosedBracket(bracket);

    if (end && colon) {
      if (!customProperty) {
        while (tokens.length) {
          token = tokens[tokens.length - 1][0];
          if (token !== 'space' && token !== 'comment') break
          this.tokenizer.back(tokens.pop());
        }
      }
      this.decl(tokens, customProperty);
    } else {
      this.unknownWord(tokens);
    }
  }

  rule(tokens) {
    tokens.pop();

    let node = new Rule$2();
    this.init(node, tokens[0][2]);

    node.raws.between = this.spacesAndCommentsFromEnd(tokens);
    this.raw(node, 'selector', tokens);
    this.current = node;
  }

  decl(tokens, customProperty) {
    let node = new Declaration$2();
    this.init(node, tokens[0][2]);

    let last = tokens[tokens.length - 1];
    if (last[0] === ';') {
      this.semicolon = true;
      tokens.pop();
    }

    node.source.end = this.getPosition(
      last[3] || last[2] || findLastWithPosition(tokens)
    );

    while (tokens[0][0] !== 'word') {
      if (tokens.length === 1) this.unknownWord(tokens);
      node.raws.before += tokens.shift()[1];
    }
    node.source.start = this.getPosition(tokens[0][2]);

    node.prop = '';
    while (tokens.length) {
      let type = tokens[0][0];
      if (type === ':' || type === 'space' || type === 'comment') {
        break
      }
      node.prop += tokens.shift()[1];
    }

    node.raws.between = '';

    let token;
    while (tokens.length) {
      token = tokens.shift();

      if (token[0] === ':') {
        node.raws.between += token[1];
        break
      } else {
        if (token[0] === 'word' && /\w/.test(token[1])) {
          this.unknownWord([token]);
        }
        node.raws.between += token[1];
      }
    }

    if (node.prop[0] === '_' || node.prop[0] === '*') {
      node.raws.before += node.prop[0];
      node.prop = node.prop.slice(1);
    }

    let firstSpaces = [];
    let next;
    while (tokens.length) {
      next = tokens[0][0];
      if (next !== 'space' && next !== 'comment') break
      firstSpaces.push(tokens.shift());
    }

    this.precheckMissedSemicolon(tokens);

    for (let i = tokens.length - 1; i >= 0; i--) {
      token = tokens[i];
      if (token[1].toLowerCase() === '!important') {
        node.important = true;
        let string = this.stringFrom(tokens, i);
        string = this.spacesFromEnd(tokens) + string;
        if (string !== ' !important') node.raws.important = string;
        break
      } else if (token[1].toLowerCase() === 'important') {
        let cache = tokens.slice(0);
        let str = '';
        for (let j = i; j > 0; j--) {
          let type = cache[j][0];
          if (str.trim().indexOf('!') === 0 && type !== 'space') {
            break
          }
          str = cache.pop()[1] + str;
        }
        if (str.trim().indexOf('!') === 0) {
          node.important = true;
          node.raws.important = str;
          tokens = cache;
        }
      }

      if (token[0] !== 'space' && token[0] !== 'comment') {
        break
      }
    }

    let hasWord = tokens.some(i => i[0] !== 'space' && i[0] !== 'comment');

    if (hasWord) {
      node.raws.between += firstSpaces.map(i => i[1]).join('');
      firstSpaces = [];
    }
    this.raw(node, 'value', firstSpaces.concat(tokens), customProperty);

    if (node.value.includes(':') && !customProperty) {
      this.checkMissedSemicolon(tokens);
    }
  }

  atrule(token) {
    let node = new AtRule$2();
    node.name = token[1].slice(1);
    if (node.name === '') {
      this.unnamedAtrule(node, token);
    }
    this.init(node, token[2]);

    let type;
    let prev;
    let shift;
    let last = false;
    let open = false;
    let params = [];
    let brackets = [];

    while (!this.tokenizer.endOfFile()) {
      token = this.tokenizer.nextToken();
      type = token[0];

      if (type === '(' || type === '[') {
        brackets.push(type === '(' ? ')' : ']');
      } else if (type === '{' && brackets.length > 0) {
        brackets.push('}');
      } else if (type === brackets[brackets.length - 1]) {
        brackets.pop();
      }

      if (brackets.length === 0) {
        if (type === ';') {
          node.source.end = this.getPosition(token[2]);
          this.semicolon = true;
          break
        } else if (type === '{') {
          open = true;
          break
        } else if (type === '}') {
          if (params.length > 0) {
            shift = params.length - 1;
            prev = params[shift];
            while (prev && prev[0] === 'space') {
              prev = params[--shift];
            }
            if (prev) {
              node.source.end = this.getPosition(prev[3] || prev[2]);
            }
          }
          this.end(token);
          break
        } else {
          params.push(token);
        }
      } else {
        params.push(token);
      }

      if (this.tokenizer.endOfFile()) {
        last = true;
        break
      }
    }

    node.raws.between = this.spacesAndCommentsFromEnd(params);
    if (params.length) {
      node.raws.afterName = this.spacesAndCommentsFromStart(params);
      this.raw(node, 'params', params);
      if (last) {
        token = params[params.length - 1];
        node.source.end = this.getPosition(token[3] || token[2]);
        this.spaces = node.raws.between;
        node.raws.between = '';
      }
    } else {
      node.raws.afterName = '';
      node.params = '';
    }

    if (open) {
      node.nodes = [];
      this.current = node;
    }
  }

  end(token) {
    if (this.current.nodes && this.current.nodes.length) {
      this.current.raws.semicolon = this.semicolon;
    }
    this.semicolon = false;

    this.current.raws.after = (this.current.raws.after || '') + this.spaces;
    this.spaces = '';

    if (this.current.parent) {
      this.current.source.end = this.getPosition(token[2]);
      this.current = this.current.parent;
    } else {
      this.unexpectedClose(token);
    }
  }

  endFile() {
    if (this.current.parent) this.unclosedBlock();
    if (this.current.nodes && this.current.nodes.length) {
      this.current.raws.semicolon = this.semicolon;
    }
    this.current.raws.after = (this.current.raws.after || '') + this.spaces;
  }

  freeSemicolon(token) {
    this.spaces += token[1];
    if (this.current.nodes) {
      let prev = this.current.nodes[this.current.nodes.length - 1];
      if (prev && prev.type === 'rule' && !prev.raws.ownSemicolon) {
        prev.raws.ownSemicolon = this.spaces;
        this.spaces = '';
      }
    }
  }

  // Helpers

  getPosition(offset) {
    let pos = this.input.fromOffset(offset);
    return {
      offset,
      line: pos.line,
      column: pos.col
    }
  }

  init(node, offset) {
    this.current.push(node);
    node.source = {
      start: this.getPosition(offset),
      input: this.input
    };
    node.raws.before = this.spaces;
    this.spaces = '';
    if (node.type !== 'comment') this.semicolon = false;
  }

  raw(node, prop, tokens, customProperty) {
    let token, type;
    let length = tokens.length;
    let value = '';
    let clean = true;
    let next, prev;

    for (let i = 0; i < length; i += 1) {
      token = tokens[i];
      type = token[0];
      if (type === 'space' && i === length - 1 && !customProperty) {
        clean = false;
      } else if (type === 'comment') {
        prev = tokens[i - 1] ? tokens[i - 1][0] : 'empty';
        next = tokens[i + 1] ? tokens[i + 1][0] : 'empty';
        if (!SAFE_COMMENT_NEIGHBOR[prev] && !SAFE_COMMENT_NEIGHBOR[next]) {
          if (value.slice(-1) === ',') {
            clean = false;
          } else {
            value += token[1];
          }
        } else {
          clean = false;
        }
      } else {
        value += token[1];
      }
    }
    if (!clean) {
      let raw = tokens.reduce((all, i) => all + i[1], '');
      node.raws[prop] = { value, raw };
    }
    node[prop] = value;
  }

  spacesAndCommentsFromEnd(tokens) {
    let lastTokenType;
    let spaces = '';
    while (tokens.length) {
      lastTokenType = tokens[tokens.length - 1][0];
      if (lastTokenType !== 'space' && lastTokenType !== 'comment') break
      spaces = tokens.pop()[1] + spaces;
    }
    return spaces
  }

  spacesAndCommentsFromStart(tokens) {
    let next;
    let spaces = '';
    while (tokens.length) {
      next = tokens[0][0];
      if (next !== 'space' && next !== 'comment') break
      spaces += tokens.shift()[1];
    }
    return spaces
  }

  spacesFromEnd(tokens) {
    let lastTokenType;
    let spaces = '';
    while (tokens.length) {
      lastTokenType = tokens[tokens.length - 1][0];
      if (lastTokenType !== 'space') break
      spaces = tokens.pop()[1] + spaces;
    }
    return spaces
  }

  stringFrom(tokens, from) {
    let result = '';
    for (let i = from; i < tokens.length; i++) {
      result += tokens[i][1];
    }
    tokens.splice(from, tokens.length - from);
    return result
  }

  colon(tokens) {
    let brackets = 0;
    let token, type, prev;
    for (let [i, element] of tokens.entries()) {
      token = element;
      type = token[0];

      if (type === '(') {
        brackets += 1;
      }
      if (type === ')') {
        brackets -= 1;
      }
      if (brackets === 0 && type === ':') {
        if (!prev) {
          this.doubleColon(token);
        } else if (prev[0] === 'word' && prev[1] === 'progid') {
          continue
        } else {
          return i
        }
      }

      prev = token;
    }
    return false
  }

  // Errors

  unclosedBracket(bracket) {
    throw this.input.error(
      'Unclosed bracket',
      { offset: bracket[2] },
      { offset: bracket[2] + 1 }
    )
  }

  unknownWord(tokens) {
    throw this.input.error(
      'Unknown word',
      { offset: tokens[0][2] },
      { offset: tokens[0][2] + tokens[0][1].length }
    )
  }

  unexpectedClose(token) {
    throw this.input.error(
      'Unexpected }',
      { offset: token[2] },
      { offset: token[2] + 1 }
    )
  }

  unclosedBlock() {
    let pos = this.current.source.start;
    throw this.input.error('Unclosed block', pos.line, pos.column)
  }

  doubleColon(token) {
    throw this.input.error(
      'Double colon',
      { offset: token[2] },
      { offset: token[2] + token[1].length }
    )
  }

  unnamedAtrule(node, token) {
    throw this.input.error(
      'At-rule without name',
      { offset: token[2] },
      { offset: token[2] + token[1].length }
    )
  }

  precheckMissedSemicolon(/* tokens */) {
    // Hook for Safe Parser
  }

  checkMissedSemicolon(tokens) {
    let colon = this.colon(tokens);
    if (colon === false) return

    let founded = 0;
    let token;
    for (let j = colon - 1; j >= 0; j--) {
      token = tokens[j];
      if (token[0] !== 'space') {
        founded += 1;
        if (founded === 2) break
      }
    }
    // If the token is a word, e.g. `!important`, `red` or any other valid property's value.
    // Then we need to return the colon after that word token. [3] is the "end" colon of that word.
    // And because we need it after that one we do +1 to get the next one.
    throw this.input.error(
      'Missed semicolon',
      token[0] === 'word' ? token[3] + 1 : token[2]
    )
  }
}

var parser$1 = Parser$1;

let Container$2 = container$1;
let Parser = parser$1;
let Input$2 = input;

function parse$3(css, opts) {
  let input = new Input$2(css, opts);
  let parser = new Parser(input);
  try {
    parser.parse();
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      if (e.name === 'CssSyntaxError' && opts && opts.from) {
        if (/\.scss$/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse SCSS with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-scss parser';
        } else if (/\.sass/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse Sass with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-sass parser';
        } else if (/\.less$/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse Less with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-less parser';
        }
      }
    }
    throw e
  }

  return parser.root
}

var parse_1 = parse$3;
parse$3.default = parse$3;

Container$2.registerParse(parse$3);

let { isClean, my } = symbols;
let MapGenerator$1 = mapGenerator;
let stringify$2 = stringify_1;
let Container$1 = container$1;
let Document$2 = document;
let warnOnce$1 = warnOnce$2;
let Result$2 = result;
let parse$2 = parse_1;
let Root$3 = root$2;

const TYPE_TO_CLASS_NAME = {
  document: 'Document',
  root: 'Root',
  atrule: 'AtRule',
  rule: 'Rule',
  decl: 'Declaration',
  comment: 'Comment'
};

const PLUGIN_PROPS = {
  postcssPlugin: true,
  prepare: true,
  Once: true,
  Document: true,
  Root: true,
  Declaration: true,
  Rule: true,
  AtRule: true,
  Comment: true,
  DeclarationExit: true,
  RuleExit: true,
  AtRuleExit: true,
  CommentExit: true,
  RootExit: true,
  DocumentExit: true,
  OnceExit: true
};

const NOT_VISITORS = {
  postcssPlugin: true,
  prepare: true,
  Once: true
};

const CHILDREN = 0;

function isPromise(obj) {
  return typeof obj === 'object' && typeof obj.then === 'function'
}

function getEvents(node) {
  let key = false;
  let type = TYPE_TO_CLASS_NAME[node.type];
  if (node.type === 'decl') {
    key = node.prop.toLowerCase();
  } else if (node.type === 'atrule') {
    key = node.name.toLowerCase();
  }

  if (key && node.append) {
    return [
      type,
      type + '-' + key,
      CHILDREN,
      type + 'Exit',
      type + 'Exit-' + key
    ]
  } else if (key) {
    return [type, type + '-' + key, type + 'Exit', type + 'Exit-' + key]
  } else if (node.append) {
    return [type, CHILDREN, type + 'Exit']
  } else {
    return [type, type + 'Exit']
  }
}

function toStack(node) {
  let events;
  if (node.type === 'document') {
    events = ['Document', CHILDREN, 'DocumentExit'];
  } else if (node.type === 'root') {
    events = ['Root', CHILDREN, 'RootExit'];
  } else {
    events = getEvents(node);
  }

  return {
    node,
    events,
    eventIndex: 0,
    visitors: [],
    visitorIndex: 0,
    iterator: 0
  }
}

function cleanMarks(node) {
  node[isClean] = false;
  if (node.nodes) node.nodes.forEach(i => cleanMarks(i));
  return node
}

let postcss$1 = {};

class LazyResult$2 {
  constructor(processor, css, opts) {
    this.stringified = false;
    this.processed = false;

    let root;
    if (
      typeof css === 'object' &&
      css !== null &&
      (css.type === 'root' || css.type === 'document')
    ) {
      root = cleanMarks(css);
    } else if (css instanceof LazyResult$2 || css instanceof Result$2) {
      root = cleanMarks(css.root);
      if (css.map) {
        if (typeof opts.map === 'undefined') opts.map = {};
        if (!opts.map.inline) opts.map.inline = false;
        opts.map.prev = css.map;
      }
    } else {
      let parser = parse$2;
      if (opts.syntax) parser = opts.syntax.parse;
      if (opts.parser) parser = opts.parser;
      if (parser.parse) parser = parser.parse;

      try {
        root = parser(css, opts);
      } catch (error) {
        this.processed = true;
        this.error = error;
      }

      if (root && !root[my]) {
        /* c8 ignore next 2 */
        Container$1.rebuild(root);
      }
    }

    this.result = new Result$2(processor, root, opts);
    this.helpers = { ...postcss$1, result: this.result, postcss: postcss$1 };
    this.plugins = this.processor.plugins.map(plugin => {
      if (typeof plugin === 'object' && plugin.prepare) {
        return { ...plugin, ...plugin.prepare(this.result) }
      } else {
        return plugin
      }
    });
  }

  get [Symbol.toStringTag]() {
    return 'LazyResult'
  }

  get processor() {
    return this.result.processor
  }

  get opts() {
    return this.result.opts
  }

  get css() {
    return this.stringify().css
  }

  get content() {
    return this.stringify().content
  }

  get map() {
    return this.stringify().map
  }

  get root() {
    return this.sync().root
  }

  get messages() {
    return this.sync().messages
  }

  warnings() {
    return this.sync().warnings()
  }

  toString() {
    return this.css
  }

  then(onFulfilled, onRejected) {
    if (process.env.NODE_ENV !== 'production') {
      if (!('from' in this.opts)) {
        warnOnce$1(
          'Without `from` option PostCSS could generate wrong source map ' +
            'and will not find Browserslist config. Set it to CSS file path ' +
            'or to `undefined` to prevent this warning.'
        );
      }
    }
    return this.async().then(onFulfilled, onRejected)
  }

  catch(onRejected) {
    return this.async().catch(onRejected)
  }

  finally(onFinally) {
    return this.async().then(onFinally, onFinally)
  }

  async() {
    if (this.error) return Promise.reject(this.error)
    if (this.processed) return Promise.resolve(this.result)
    if (!this.processing) {
      this.processing = this.runAsync();
    }
    return this.processing
  }

  sync() {
    if (this.error) throw this.error
    if (this.processed) return this.result
    this.processed = true;

    if (this.processing) {
      throw this.getAsyncError()
    }

    for (let plugin of this.plugins) {
      let promise = this.runOnRoot(plugin);
      if (isPromise(promise)) {
        throw this.getAsyncError()
      }
    }

    this.prepareVisitors();
    if (this.hasListener) {
      let root = this.result.root;
      while (!root[isClean]) {
        root[isClean] = true;
        this.walkSync(root);
      }
      if (this.listeners.OnceExit) {
        if (root.type === 'document') {
          for (let subRoot of root.nodes) {
            this.visitSync(this.listeners.OnceExit, subRoot);
          }
        } else {
          this.visitSync(this.listeners.OnceExit, root);
        }
      }
    }

    return this.result
  }

  stringify() {
    if (this.error) throw this.error
    if (this.stringified) return this.result
    this.stringified = true;

    this.sync();

    let opts = this.result.opts;
    let str = stringify$2;
    if (opts.syntax) str = opts.syntax.stringify;
    if (opts.stringifier) str = opts.stringifier;
    if (str.stringify) str = str.stringify;

    let map = new MapGenerator$1(str, this.result.root, this.result.opts);
    let data = map.generate();
    this.result.css = data[0];
    this.result.map = data[1];

    return this.result
  }

  walkSync(node) {
    node[isClean] = true;
    let events = getEvents(node);
    for (let event of events) {
      if (event === CHILDREN) {
        if (node.nodes) {
          node.each(child => {
            if (!child[isClean]) this.walkSync(child);
          });
        }
      } else {
        let visitors = this.listeners[event];
        if (visitors) {
          if (this.visitSync(visitors, node.toProxy())) return
        }
      }
    }
  }

  visitSync(visitors, node) {
    for (let [plugin, visitor] of visitors) {
      this.result.lastPlugin = plugin;
      let promise;
      try {
        promise = visitor(node, this.helpers);
      } catch (e) {
        throw this.handleError(e, node.proxyOf)
      }
      if (node.type !== 'root' && node.type !== 'document' && !node.parent) {
        return true
      }
      if (isPromise(promise)) {
        throw this.getAsyncError()
      }
    }
  }

  runOnRoot(plugin) {
    this.result.lastPlugin = plugin;
    try {
      if (typeof plugin === 'object' && plugin.Once) {
        if (this.result.root.type === 'document') {
          let roots = this.result.root.nodes.map(root =>
            plugin.Once(root, this.helpers)
          );

          if (isPromise(roots[0])) {
            return Promise.all(roots)
          }

          return roots
        }

        return plugin.Once(this.result.root, this.helpers)
      } else if (typeof plugin === 'function') {
        return plugin(this.result.root, this.result)
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  getAsyncError() {
    throw new Error('Use process(css).then(cb) to work with async plugins')
  }

  handleError(error, node) {
    let plugin = this.result.lastPlugin;
    try {
      if (node) node.addToError(error);
      this.error = error;
      if (error.name === 'CssSyntaxError' && !error.plugin) {
        error.plugin = plugin.postcssPlugin;
        error.setMessage();
      } else if (plugin.postcssVersion) {
        if (process.env.NODE_ENV !== 'production') {
          let pluginName = plugin.postcssPlugin;
          let pluginVer = plugin.postcssVersion;
          let runtimeVer = this.result.processor.version;
          let a = pluginVer.split('.');
          let b = runtimeVer.split('.');

          if (a[0] !== b[0] || parseInt(a[1]) > parseInt(b[1])) {
            // eslint-disable-next-line no-console
            console.error(
              'Unknown error from PostCSS plugin. Your current PostCSS ' +
                'version is ' +
                runtimeVer +
                ', but ' +
                pluginName +
                ' uses ' +
                pluginVer +
                '. Perhaps this is the source of the error below.'
            );
          }
        }
      }
    } catch (err) {
      /* c8 ignore next 3 */
      // eslint-disable-next-line no-console
      if (console && console.error) console.error(err);
    }
    return error
  }

  async runAsync() {
    this.plugin = 0;
    for (let i = 0; i < this.plugins.length; i++) {
      let plugin = this.plugins[i];
      let promise = this.runOnRoot(plugin);
      if (isPromise(promise)) {
        try {
          await promise;
        } catch (error) {
          throw this.handleError(error)
        }
      }
    }

    this.prepareVisitors();
    if (this.hasListener) {
      let root = this.result.root;
      while (!root[isClean]) {
        root[isClean] = true;
        let stack = [toStack(root)];
        while (stack.length > 0) {
          let promise = this.visitTick(stack);
          if (isPromise(promise)) {
            try {
              await promise;
            } catch (e) {
              let node = stack[stack.length - 1].node;
              throw this.handleError(e, node)
            }
          }
        }
      }

      if (this.listeners.OnceExit) {
        for (let [plugin, visitor] of this.listeners.OnceExit) {
          this.result.lastPlugin = plugin;
          try {
            if (root.type === 'document') {
              let roots = root.nodes.map(subRoot =>
                visitor(subRoot, this.helpers)
              );

              await Promise.all(roots);
            } else {
              await visitor(root, this.helpers);
            }
          } catch (e) {
            throw this.handleError(e)
          }
        }
      }
    }

    this.processed = true;
    return this.stringify()
  }

  prepareVisitors() {
    this.listeners = {};
    let add = (plugin, type, cb) => {
      if (!this.listeners[type]) this.listeners[type] = [];
      this.listeners[type].push([plugin, cb]);
    };
    for (let plugin of this.plugins) {
      if (typeof plugin === 'object') {
        for (let event in plugin) {
          if (!PLUGIN_PROPS[event] && /^[A-Z]/.test(event)) {
            throw new Error(
              `Unknown event ${event} in ${plugin.postcssPlugin}. ` +
                `Try to update PostCSS (${this.processor.version} now).`
            )
          }
          if (!NOT_VISITORS[event]) {
            if (typeof plugin[event] === 'object') {
              for (let filter in plugin[event]) {
                if (filter === '*') {
                  add(plugin, event, plugin[event][filter]);
                } else {
                  add(
                    plugin,
                    event + '-' + filter.toLowerCase(),
                    plugin[event][filter]
                  );
                }
              }
            } else if (typeof plugin[event] === 'function') {
              add(plugin, event, plugin[event]);
            }
          }
        }
      }
    }
    this.hasListener = Object.keys(this.listeners).length > 0;
  }

  visitTick(stack) {
    let visit = stack[stack.length - 1];
    let { node, visitors } = visit;

    if (node.type !== 'root' && node.type !== 'document' && !node.parent) {
      stack.pop();
      return
    }

    if (visitors.length > 0 && visit.visitorIndex < visitors.length) {
      let [plugin, visitor] = visitors[visit.visitorIndex];
      visit.visitorIndex += 1;
      if (visit.visitorIndex === visitors.length) {
        visit.visitors = [];
        visit.visitorIndex = 0;
      }
      this.result.lastPlugin = plugin;
      try {
        return visitor(node.toProxy(), this.helpers)
      } catch (e) {
        throw this.handleError(e, node)
      }
    }

    if (visit.iterator !== 0) {
      let iterator = visit.iterator;
      let child;
      while ((child = node.nodes[node.indexes[iterator]])) {
        node.indexes[iterator] += 1;
        if (!child[isClean]) {
          child[isClean] = true;
          stack.push(toStack(child));
          return
        }
      }
      visit.iterator = 0;
      delete node.indexes[iterator];
    }

    let events = visit.events;
    while (visit.eventIndex < events.length) {
      let event = events[visit.eventIndex];
      visit.eventIndex += 1;
      if (event === CHILDREN) {
        if (node.nodes && node.nodes.length) {
          node[isClean] = true;
          visit.iterator = node.getIterator();
        }
        return
      } else if (this.listeners[event]) {
        visit.visitors = this.listeners[event];
        return
      }
    }
    stack.pop();
  }
}

LazyResult$2.registerPostcss = dependant => {
  postcss$1 = dependant;
};

var lazyResult = LazyResult$2;
LazyResult$2.default = LazyResult$2;

Root$3.registerLazyResult(LazyResult$2);
Document$2.registerLazyResult(LazyResult$2);

let MapGenerator = mapGenerator;
let stringify$1 = stringify_1;
let warnOnce = warnOnce$2;
let parse$1 = parse_1;
const Result$1 = result;

class NoWorkResult$1 {
  constructor(processor, css, opts) {
    css = css.toString();
    this.stringified = false;

    this._processor = processor;
    this._css = css;
    this._opts = opts;
    this._map = undefined;
    let root;

    let str = stringify$1;
    this.result = new Result$1(this._processor, root, this._opts);
    this.result.css = css;

    let self = this;
    Object.defineProperty(this.result, 'root', {
      get() {
        return self.root
      }
    });

    let map = new MapGenerator(str, root, this._opts, css);
    if (map.isMap()) {
      let [generatedCSS, generatedMap] = map.generate();
      if (generatedCSS) {
        this.result.css = generatedCSS;
      }
      if (generatedMap) {
        this.result.map = generatedMap;
      }
    }
  }

  get [Symbol.toStringTag]() {
    return 'NoWorkResult'
  }

  get processor() {
    return this.result.processor
  }

  get opts() {
    return this.result.opts
  }

  get css() {
    return this.result.css
  }

  get content() {
    return this.result.css
  }

  get map() {
    return this.result.map
  }

  get root() {
    if (this._root) {
      return this._root
    }

    let root;
    let parser = parse$1;

    try {
      root = parser(this._css, this._opts);
    } catch (error) {
      this.error = error;
    }

    if (this.error) {
      throw this.error
    } else {
      this._root = root;
      return root
    }
  }

  get messages() {
    return []
  }

  warnings() {
    return []
  }

  toString() {
    return this._css
  }

  then(onFulfilled, onRejected) {
    if (process.env.NODE_ENV !== 'production') {
      if (!('from' in this._opts)) {
        warnOnce(
          'Without `from` option PostCSS could generate wrong source map ' +
            'and will not find Browserslist config. Set it to CSS file path ' +
            'or to `undefined` to prevent this warning.'
        );
      }
    }

    return this.async().then(onFulfilled, onRejected)
  }

  catch(onRejected) {
    return this.async().catch(onRejected)
  }

  finally(onFinally) {
    return this.async().then(onFinally, onFinally)
  }

  async() {
    if (this.error) return Promise.reject(this.error)
    return Promise.resolve(this.result)
  }

  sync() {
    if (this.error) throw this.error
    return this.result
  }
}

var noWorkResult = NoWorkResult$1;
NoWorkResult$1.default = NoWorkResult$1;

let NoWorkResult = noWorkResult;
let LazyResult$1 = lazyResult;
let Document$1 = document;
let Root$2 = root$2;

class Processor$1 {
  constructor(plugins = []) {
    this.version = '8.4.14';
    this.plugins = this.normalize(plugins);
  }

  use(plugin) {
    this.plugins = this.plugins.concat(this.normalize([plugin]));
    return this
  }

  process(css, opts = {}) {
    if (
      this.plugins.length === 0 &&
      typeof opts.parser === 'undefined' &&
      typeof opts.stringifier === 'undefined' &&
      typeof opts.syntax === 'undefined'
    ) {
      return new NoWorkResult(this, css, opts)
    } else {
      return new LazyResult$1(this, css, opts)
    }
  }

  normalize(plugins) {
    let normalized = [];
    for (let i of plugins) {
      if (i.postcss === true) {
        i = i();
      } else if (i.postcss) {
        i = i.postcss;
      }

      if (typeof i === 'object' && Array.isArray(i.plugins)) {
        normalized = normalized.concat(i.plugins);
      } else if (typeof i === 'object' && i.postcssPlugin) {
        normalized.push(i);
      } else if (typeof i === 'function') {
        normalized.push(i);
      } else if (typeof i === 'object' && (i.parse || i.stringify)) {
        if (process.env.NODE_ENV !== 'production') {
          throw new Error(
            'PostCSS syntaxes cannot be used as plugins. Instead, please use ' +
              'one of the syntax/parser/stringifier options as outlined ' +
              'in your PostCSS runner documentation.'
          )
        }
      } else {
        throw new Error(i + ' is not a PostCSS plugin')
      }
    }
    return normalized
  }
}

var processor$1 = Processor$1;
Processor$1.default = Processor$1;

Root$2.registerProcessor(Processor$1);
Document$1.registerProcessor(Processor$1);

let Declaration$1 = declaration;
let PreviousMap = previousMap;
let Comment$1 = comment$3;
let AtRule$1 = atRule;
let Input$1 = input;
let Root$1 = root$2;
let Rule$1 = rule;

function fromJSON$1(json, inputs) {
  if (Array.isArray(json)) return json.map(n => fromJSON$1(n))

  let { inputs: ownInputs, ...defaults } = json;
  if (ownInputs) {
    inputs = [];
    for (let input of ownInputs) {
      let inputHydrated = { ...input, __proto__: Input$1.prototype };
      if (inputHydrated.map) {
        inputHydrated.map = {
          ...inputHydrated.map,
          __proto__: PreviousMap.prototype
        };
      }
      inputs.push(inputHydrated);
    }
  }
  if (defaults.nodes) {
    defaults.nodes = json.nodes.map(n => fromJSON$1(n, inputs));
  }
  if (defaults.source) {
    let { inputId, ...source } = defaults.source;
    defaults.source = source;
    if (inputId != null) {
      defaults.source.input = inputs[inputId];
    }
  }
  if (defaults.type === 'root') {
    return new Root$1(defaults)
  } else if (defaults.type === 'decl') {
    return new Declaration$1(defaults)
  } else if (defaults.type === 'rule') {
    return new Rule$1(defaults)
  } else if (defaults.type === 'comment') {
    return new Comment$1(defaults)
  } else if (defaults.type === 'atrule') {
    return new AtRule$1(defaults)
  } else {
    throw new Error('Unknown node type: ' + json.type)
  }
}

var fromJSON_1 = fromJSON$1;
fromJSON$1.default = fromJSON$1;

let CssSyntaxError = cssSyntaxError;
let Declaration = declaration;
let LazyResult = lazyResult;
let Container = container$1;
let Processor = processor$1;
let stringify = stringify_1;
let fromJSON = fromJSON_1;
let Document = document;
let Warning = warning;
let Comment = comment$3;
let AtRule = atRule;
let Result = result;
let Input = input;
let parse = parse_1;
let list = list_1;
let Rule = rule;
let Root = root$2;
let Node = node_1;

function postcss(...plugins) {
  if (plugins.length === 1 && Array.isArray(plugins[0])) {
    plugins = plugins[0];
  }
  return new Processor(plugins)
}

postcss.plugin = function plugin(name, initializer) {
  let warningPrinted = false;
  function creator(...args) {
    // eslint-disable-next-line no-console
    if (console && console.warn && !warningPrinted) {
      warningPrinted = true;
      // eslint-disable-next-line no-console
      console.warn(
        name +
          ': postcss.plugin was deprecated. Migration guide:\n' +
          'https://evilmartians.com/chronicles/postcss-8-plugin-migration'
      );
      if (process.env.LANG && process.env.LANG.startsWith('cn')) {
        /* c8 ignore next 7 */
        // eslint-disable-next-line no-console
        console.warn(
          name +
            ': 里面 postcss.plugin 被弃用. 迁移指南:\n' +
            'https://www.w3ctech.com/topic/2226'
        );
      }
    }
    let transformer = initializer(...args);
    transformer.postcssPlugin = name;
    transformer.postcssVersion = new Processor().version;
    return transformer
  }

  let cache;
  Object.defineProperty(creator, 'postcss', {
    get() {
      if (!cache) cache = creator();
      return cache
    }
  });

  creator.process = function (css, processOpts, pluginOpts) {
    return postcss([creator(pluginOpts)]).process(css, processOpts)
  };

  return creator
};

postcss.stringify = stringify;
postcss.parse = parse;
postcss.fromJSON = fromJSON;
postcss.list = list;

postcss.comment = defaults => new Comment(defaults);
postcss.atRule = defaults => new AtRule(defaults);
postcss.decl = defaults => new Declaration(defaults);
postcss.rule = defaults => new Rule(defaults);
postcss.root = defaults => new Root(defaults);
postcss.document = defaults => new Document(defaults);

postcss.CssSyntaxError = CssSyntaxError;
postcss.Declaration = Declaration;
postcss.Container = Container;
postcss.Processor = Processor;
postcss.Document = Document;
postcss.Comment = Comment;
postcss.Warning = Warning;
postcss.AtRule = AtRule;
postcss.Result = Result;
postcss.Input = Input;
postcss.Rule = Rule;
postcss.Root = Root;
postcss.Node = Node;

LazyResult.registerPostcss(postcss);

var postcss_1 = postcss;
postcss.default = postcss;

postcss_1.stringify;
postcss_1.fromJSON;
postcss_1.plugin;
postcss_1.parse;
postcss_1.list;

postcss_1.document;
postcss_1.comment;
postcss_1.atRule;
postcss_1.rule;
postcss_1.decl;
postcss_1.root;

postcss_1.CssSyntaxError;
postcss_1.Declaration;
postcss_1.Container;
postcss_1.Processor;
postcss_1.Document;
postcss_1.Comment;
postcss_1.Warning;
postcss_1.AtRule;
postcss_1.Result;
postcss_1.Input;
postcss_1.Rule;
postcss_1.Root;
postcss_1.Node;

var dist = {exports: {}};

var processor = {exports: {}};

var parser = {exports: {}};

var root$1 = {exports: {}};

var container = {exports: {}};

var node$1 = {exports: {}};

var util = {};

var unesc = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = unesc;

	// Many thanks for this post which made this migration much easier.
	// https://mathiasbynens.be/notes/css-escapes

	/**
	 * 
	 * @param {string} str 
	 * @returns {[string, number]|undefined}
	 */
	function gobbleHex(str) {
	  var lower = str.toLowerCase();
	  var hex = '';
	  var spaceTerminated = false;

	  for (var i = 0; i < 6 && lower[i] !== undefined; i++) {
	    var code = lower.charCodeAt(i); // check to see if we are dealing with a valid hex char [a-f|0-9]

	    var valid = code >= 97 && code <= 102 || code >= 48 && code <= 57; // https://drafts.csswg.org/css-syntax/#consume-escaped-code-point

	    spaceTerminated = code === 32;

	    if (!valid) {
	      break;
	    }

	    hex += lower[i];
	  }

	  if (hex.length === 0) {
	    return undefined;
	  }

	  var codePoint = parseInt(hex, 16);
	  var isSurrogate = codePoint >= 0xD800 && codePoint <= 0xDFFF; // Add special case for
	  // "If this number is zero, or is for a surrogate, or is greater than the maximum allowed code point"
	  // https://drafts.csswg.org/css-syntax/#maximum-allowed-code-point

	  if (isSurrogate || codePoint === 0x0000 || codePoint > 0x10FFFF) {
	    return ["\uFFFD", hex.length + (spaceTerminated ? 1 : 0)];
	  }

	  return [String.fromCodePoint(codePoint), hex.length + (spaceTerminated ? 1 : 0)];
	}

	var CONTAINS_ESCAPE = /\\/;

	function unesc(str) {
	  var needToProcess = CONTAINS_ESCAPE.test(str);

	  if (!needToProcess) {
	    return str;
	  }

	  var ret = "";

	  for (var i = 0; i < str.length; i++) {
	    if (str[i] === "\\") {
	      var gobbled = gobbleHex(str.slice(i + 1, i + 7));

	      if (gobbled !== undefined) {
	        ret += gobbled[0];
	        i += gobbled[1];
	        continue;
	      } // Retain a pair of \\ if double escaped `\\\\`
	      // https://github.com/postcss/postcss-selector-parser/commit/268c9a7656fb53f543dc620aa5b73a30ec3ff20e


	      if (str[i + 1] === "\\") {
	        ret += "\\";
	        i++;
	        continue;
	      } // if \\ is at the end of the string retain it
	      // https://github.com/postcss/postcss-selector-parser/commit/01a6b346e3612ce1ab20219acc26abdc259ccefb


	      if (str.length === i + 1) {
	        ret += str[i];
	      }

	      continue;
	    }

	    ret += str[i];
	  }

	  return ret;
	}

	module.exports = exports.default;
} (unesc, unesc.exports));

var getProp = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = getProp;

	function getProp(obj) {
	  for (var _len = arguments.length, props = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    props[_key - 1] = arguments[_key];
	  }

	  while (props.length > 0) {
	    var prop = props.shift();

	    if (!obj[prop]) {
	      return undefined;
	    }

	    obj = obj[prop];
	  }

	  return obj;
	}

	module.exports = exports.default;
} (getProp, getProp.exports));

var ensureObject = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = ensureObject;

	function ensureObject(obj) {
	  for (var _len = arguments.length, props = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    props[_key - 1] = arguments[_key];
	  }

	  while (props.length > 0) {
	    var prop = props.shift();

	    if (!obj[prop]) {
	      obj[prop] = {};
	    }

	    obj = obj[prop];
	  }
	}

	module.exports = exports.default;
} (ensureObject, ensureObject.exports));

var stripComments = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = stripComments;

	function stripComments(str) {
	  var s = "";
	  var commentStart = str.indexOf("/*");
	  var lastEnd = 0;

	  while (commentStart >= 0) {
	    s = s + str.slice(lastEnd, commentStart);
	    var commentEnd = str.indexOf("*/", commentStart + 2);

	    if (commentEnd < 0) {
	      return s;
	    }

	    lastEnd = commentEnd + 2;
	    commentStart = str.indexOf("/*", lastEnd);
	  }

	  s = s + str.slice(lastEnd);
	  return s;
	}

	module.exports = exports.default;
} (stripComments, stripComments.exports));

util.__esModule = true;
util.stripComments = util.ensureObject = util.getProp = util.unesc = void 0;

var _unesc = _interopRequireDefault$1(unesc.exports);

util.unesc = _unesc["default"];

var _getProp = _interopRequireDefault$1(getProp.exports);

util.getProp = _getProp["default"];

var _ensureObject = _interopRequireDefault$1(ensureObject.exports);

util.ensureObject = _ensureObject["default"];

var _stripComments = _interopRequireDefault$1(stripComments.exports);

util.stripComments = _stripComments["default"];

function _interopRequireDefault$1(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _util = util;

	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

	function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

	var cloneNode = function cloneNode(obj, parent) {
	  if (typeof obj !== 'object' || obj === null) {
	    return obj;
	  }

	  var cloned = new obj.constructor();

	  for (var i in obj) {
	    if (!obj.hasOwnProperty(i)) {
	      continue;
	    }

	    var value = obj[i];
	    var type = typeof value;

	    if (i === 'parent' && type === 'object') {
	      if (parent) {
	        cloned[i] = parent;
	      }
	    } else if (value instanceof Array) {
	      cloned[i] = value.map(function (j) {
	        return cloneNode(j, cloned);
	      });
	    } else {
	      cloned[i] = cloneNode(value, cloned);
	    }
	  }

	  return cloned;
	};

	var Node = /*#__PURE__*/function () {
	  function Node(opts) {
	    if (opts === void 0) {
	      opts = {};
	    }

	    Object.assign(this, opts);
	    this.spaces = this.spaces || {};
	    this.spaces.before = this.spaces.before || '';
	    this.spaces.after = this.spaces.after || '';
	  }

	  var _proto = Node.prototype;

	  _proto.remove = function remove() {
	    if (this.parent) {
	      this.parent.removeChild(this);
	    }

	    this.parent = undefined;
	    return this;
	  };

	  _proto.replaceWith = function replaceWith() {
	    if (this.parent) {
	      for (var index in arguments) {
	        this.parent.insertBefore(this, arguments[index]);
	      }

	      this.remove();
	    }

	    return this;
	  };

	  _proto.next = function next() {
	    return this.parent.at(this.parent.index(this) + 1);
	  };

	  _proto.prev = function prev() {
	    return this.parent.at(this.parent.index(this) - 1);
	  };

	  _proto.clone = function clone(overrides) {
	    if (overrides === void 0) {
	      overrides = {};
	    }

	    var cloned = cloneNode(this);

	    for (var name in overrides) {
	      cloned[name] = overrides[name];
	    }

	    return cloned;
	  }
	  /**
	   * Some non-standard syntax doesn't follow normal escaping rules for css.
	   * This allows non standard syntax to be appended to an existing property
	   * by specifying the escaped value. By specifying the escaped value,
	   * illegal characters are allowed to be directly inserted into css output.
	   * @param {string} name the property to set
	   * @param {any} value the unescaped value of the property
	   * @param {string} valueEscaped optional. the escaped value of the property.
	   */
	  ;

	  _proto.appendToPropertyAndEscape = function appendToPropertyAndEscape(name, value, valueEscaped) {
	    if (!this.raws) {
	      this.raws = {};
	    }

	    var originalValue = this[name];
	    var originalEscaped = this.raws[name];
	    this[name] = originalValue + value; // this may trigger a setter that updates raws, so it has to be set first.

	    if (originalEscaped || valueEscaped !== value) {
	      this.raws[name] = (originalEscaped || originalValue) + valueEscaped;
	    } else {
	      delete this.raws[name]; // delete any escaped value that was created by the setter.
	    }
	  }
	  /**
	   * Some non-standard syntax doesn't follow normal escaping rules for css.
	   * This allows the escaped value to be specified directly, allowing illegal
	   * characters to be directly inserted into css output.
	   * @param {string} name the property to set
	   * @param {any} value the unescaped value of the property
	   * @param {string} valueEscaped the escaped value of the property.
	   */
	  ;

	  _proto.setPropertyAndEscape = function setPropertyAndEscape(name, value, valueEscaped) {
	    if (!this.raws) {
	      this.raws = {};
	    }

	    this[name] = value; // this may trigger a setter that updates raws, so it has to be set first.

	    this.raws[name] = valueEscaped;
	  }
	  /**
	   * When you want a value to passed through to CSS directly. This method
	   * deletes the corresponding raw value causing the stringifier to fallback
	   * to the unescaped value.
	   * @param {string} name the property to set.
	   * @param {any} value The value that is both escaped and unescaped.
	   */
	  ;

	  _proto.setPropertyWithoutEscape = function setPropertyWithoutEscape(name, value) {
	    this[name] = value; // this may trigger a setter that updates raws, so it has to be set first.

	    if (this.raws) {
	      delete this.raws[name];
	    }
	  }
	  /**
	   *
	   * @param {number} line The number (starting with 1)
	   * @param {number} column The column number (starting with 1)
	   */
	  ;

	  _proto.isAtPosition = function isAtPosition(line, column) {
	    if (this.source && this.source.start && this.source.end) {
	      if (this.source.start.line > line) {
	        return false;
	      }

	      if (this.source.end.line < line) {
	        return false;
	      }

	      if (this.source.start.line === line && this.source.start.column > column) {
	        return false;
	      }

	      if (this.source.end.line === line && this.source.end.column < column) {
	        return false;
	      }

	      return true;
	    }

	    return undefined;
	  };

	  _proto.stringifyProperty = function stringifyProperty(name) {
	    return this.raws && this.raws[name] || this[name];
	  };

	  _proto.valueToString = function valueToString() {
	    return String(this.stringifyProperty("value"));
	  };

	  _proto.toString = function toString() {
	    return [this.rawSpaceBefore, this.valueToString(), this.rawSpaceAfter].join('');
	  };

	  _createClass(Node, [{
	    key: "rawSpaceBefore",
	    get: function get() {
	      var rawSpace = this.raws && this.raws.spaces && this.raws.spaces.before;

	      if (rawSpace === undefined) {
	        rawSpace = this.spaces && this.spaces.before;
	      }

	      return rawSpace || "";
	    },
	    set: function set(raw) {
	      (0, _util.ensureObject)(this, "raws", "spaces");
	      this.raws.spaces.before = raw;
	    }
	  }, {
	    key: "rawSpaceAfter",
	    get: function get() {
	      var rawSpace = this.raws && this.raws.spaces && this.raws.spaces.after;

	      if (rawSpace === undefined) {
	        rawSpace = this.spaces.after;
	      }

	      return rawSpace || "";
	    },
	    set: function set(raw) {
	      (0, _util.ensureObject)(this, "raws", "spaces");
	      this.raws.spaces.after = raw;
	    }
	  }]);

	  return Node;
	}();

	exports["default"] = Node;
	module.exports = exports.default;
} (node$1, node$1.exports));

var types = {};

types.__esModule = true;
types.UNIVERSAL = types.ATTRIBUTE = types.CLASS = types.COMBINATOR = types.COMMENT = types.ID = types.NESTING = types.PSEUDO = types.ROOT = types.SELECTOR = types.STRING = types.TAG = void 0;
var TAG = 'tag';
types.TAG = TAG;
var STRING = 'string';
types.STRING = STRING;
var SELECTOR = 'selector';
types.SELECTOR = SELECTOR;
var ROOT = 'root';
types.ROOT = ROOT;
var PSEUDO = 'pseudo';
types.PSEUDO = PSEUDO;
var NESTING = 'nesting';
types.NESTING = NESTING;
var ID = 'id';
types.ID = ID;
var COMMENT = 'comment';
types.COMMENT = COMMENT;
var COMBINATOR = 'combinator';
types.COMBINATOR = COMBINATOR;
var CLASS = 'class';
types.CLASS = CLASS;
var ATTRIBUTE = 'attribute';
types.ATTRIBUTE = ATTRIBUTE;
var UNIVERSAL = 'universal';
types.UNIVERSAL = UNIVERSAL;

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _node = _interopRequireDefault(node$1.exports);

	var types$1 = _interopRequireWildcard(types);

	function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } it = o[Symbol.iterator](); return it.next.bind(it); }

	function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

	function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

	function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var Container = /*#__PURE__*/function (_Node) {
	  _inheritsLoose(Container, _Node);

	  function Container(opts) {
	    var _this;

	    _this = _Node.call(this, opts) || this;

	    if (!_this.nodes) {
	      _this.nodes = [];
	    }

	    return _this;
	  }

	  var _proto = Container.prototype;

	  _proto.append = function append(selector) {
	    selector.parent = this;
	    this.nodes.push(selector);
	    return this;
	  };

	  _proto.prepend = function prepend(selector) {
	    selector.parent = this;
	    this.nodes.unshift(selector);
	    return this;
	  };

	  _proto.at = function at(index) {
	    return this.nodes[index];
	  };

	  _proto.index = function index(child) {
	    if (typeof child === 'number') {
	      return child;
	    }

	    return this.nodes.indexOf(child);
	  };

	  _proto.removeChild = function removeChild(child) {
	    child = this.index(child);
	    this.at(child).parent = undefined;
	    this.nodes.splice(child, 1);
	    var index;

	    for (var id in this.indexes) {
	      index = this.indexes[id];

	      if (index >= child) {
	        this.indexes[id] = index - 1;
	      }
	    }

	    return this;
	  };

	  _proto.removeAll = function removeAll() {
	    for (var _iterator = _createForOfIteratorHelperLoose(this.nodes), _step; !(_step = _iterator()).done;) {
	      var node = _step.value;
	      node.parent = undefined;
	    }

	    this.nodes = [];
	    return this;
	  };

	  _proto.empty = function empty() {
	    return this.removeAll();
	  };

	  _proto.insertAfter = function insertAfter(oldNode, newNode) {
	    newNode.parent = this;
	    var oldIndex = this.index(oldNode);
	    this.nodes.splice(oldIndex + 1, 0, newNode);
	    newNode.parent = this;
	    var index;

	    for (var id in this.indexes) {
	      index = this.indexes[id];

	      if (oldIndex <= index) {
	        this.indexes[id] = index + 1;
	      }
	    }

	    return this;
	  };

	  _proto.insertBefore = function insertBefore(oldNode, newNode) {
	    newNode.parent = this;
	    var oldIndex = this.index(oldNode);
	    this.nodes.splice(oldIndex, 0, newNode);
	    newNode.parent = this;
	    var index;

	    for (var id in this.indexes) {
	      index = this.indexes[id];

	      if (index <= oldIndex) {
	        this.indexes[id] = index + 1;
	      }
	    }

	    return this;
	  };

	  _proto._findChildAtPosition = function _findChildAtPosition(line, col) {
	    var found = undefined;
	    this.each(function (node) {
	      if (node.atPosition) {
	        var foundChild = node.atPosition(line, col);

	        if (foundChild) {
	          found = foundChild;
	          return false;
	        }
	      } else if (node.isAtPosition(line, col)) {
	        found = node;
	        return false;
	      }
	    });
	    return found;
	  }
	  /**
	   * Return the most specific node at the line and column number given.
	   * The source location is based on the original parsed location, locations aren't
	   * updated as selector nodes are mutated.
	   * 
	   * Note that this location is relative to the location of the first character
	   * of the selector, and not the location of the selector in the overall document
	   * when used in conjunction with postcss.
	   *
	   * If not found, returns undefined.
	   * @param {number} line The line number of the node to find. (1-based index)
	   * @param {number} col  The column number of the node to find. (1-based index)
	   */
	  ;

	  _proto.atPosition = function atPosition(line, col) {
	    if (this.isAtPosition(line, col)) {
	      return this._findChildAtPosition(line, col) || this;
	    } else {
	      return undefined;
	    }
	  };

	  _proto._inferEndPosition = function _inferEndPosition() {
	    if (this.last && this.last.source && this.last.source.end) {
	      this.source = this.source || {};
	      this.source.end = this.source.end || {};
	      Object.assign(this.source.end, this.last.source.end);
	    }
	  };

	  _proto.each = function each(callback) {
	    if (!this.lastEach) {
	      this.lastEach = 0;
	    }

	    if (!this.indexes) {
	      this.indexes = {};
	    }

	    this.lastEach++;
	    var id = this.lastEach;
	    this.indexes[id] = 0;

	    if (!this.length) {
	      return undefined;
	    }

	    var index, result;

	    while (this.indexes[id] < this.length) {
	      index = this.indexes[id];
	      result = callback(this.at(index), index);

	      if (result === false) {
	        break;
	      }

	      this.indexes[id] += 1;
	    }

	    delete this.indexes[id];

	    if (result === false) {
	      return false;
	    }
	  };

	  _proto.walk = function walk(callback) {
	    return this.each(function (node, i) {
	      var result = callback(node, i);

	      if (result !== false && node.length) {
	        result = node.walk(callback);
	      }

	      if (result === false) {
	        return false;
	      }
	    });
	  };

	  _proto.walkAttributes = function walkAttributes(callback) {
	    var _this2 = this;

	    return this.walk(function (selector) {
	      if (selector.type === types$1.ATTRIBUTE) {
	        return callback.call(_this2, selector);
	      }
	    });
	  };

	  _proto.walkClasses = function walkClasses(callback) {
	    var _this3 = this;

	    return this.walk(function (selector) {
	      if (selector.type === types$1.CLASS) {
	        return callback.call(_this3, selector);
	      }
	    });
	  };

	  _proto.walkCombinators = function walkCombinators(callback) {
	    var _this4 = this;

	    return this.walk(function (selector) {
	      if (selector.type === types$1.COMBINATOR) {
	        return callback.call(_this4, selector);
	      }
	    });
	  };

	  _proto.walkComments = function walkComments(callback) {
	    var _this5 = this;

	    return this.walk(function (selector) {
	      if (selector.type === types$1.COMMENT) {
	        return callback.call(_this5, selector);
	      }
	    });
	  };

	  _proto.walkIds = function walkIds(callback) {
	    var _this6 = this;

	    return this.walk(function (selector) {
	      if (selector.type === types$1.ID) {
	        return callback.call(_this6, selector);
	      }
	    });
	  };

	  _proto.walkNesting = function walkNesting(callback) {
	    var _this7 = this;

	    return this.walk(function (selector) {
	      if (selector.type === types$1.NESTING) {
	        return callback.call(_this7, selector);
	      }
	    });
	  };

	  _proto.walkPseudos = function walkPseudos(callback) {
	    var _this8 = this;

	    return this.walk(function (selector) {
	      if (selector.type === types$1.PSEUDO) {
	        return callback.call(_this8, selector);
	      }
	    });
	  };

	  _proto.walkTags = function walkTags(callback) {
	    var _this9 = this;

	    return this.walk(function (selector) {
	      if (selector.type === types$1.TAG) {
	        return callback.call(_this9, selector);
	      }
	    });
	  };

	  _proto.walkUniversals = function walkUniversals(callback) {
	    var _this10 = this;

	    return this.walk(function (selector) {
	      if (selector.type === types$1.UNIVERSAL) {
	        return callback.call(_this10, selector);
	      }
	    });
	  };

	  _proto.split = function split(callback) {
	    var _this11 = this;

	    var current = [];
	    return this.reduce(function (memo, node, index) {
	      var split = callback.call(_this11, node);
	      current.push(node);

	      if (split) {
	        memo.push(current);
	        current = [];
	      } else if (index === _this11.length - 1) {
	        memo.push(current);
	      }

	      return memo;
	    }, []);
	  };

	  _proto.map = function map(callback) {
	    return this.nodes.map(callback);
	  };

	  _proto.reduce = function reduce(callback, memo) {
	    return this.nodes.reduce(callback, memo);
	  };

	  _proto.every = function every(callback) {
	    return this.nodes.every(callback);
	  };

	  _proto.some = function some(callback) {
	    return this.nodes.some(callback);
	  };

	  _proto.filter = function filter(callback) {
	    return this.nodes.filter(callback);
	  };

	  _proto.sort = function sort(callback) {
	    return this.nodes.sort(callback);
	  };

	  _proto.toString = function toString() {
	    return this.map(String).join('');
	  };

	  _createClass(Container, [{
	    key: "first",
	    get: function get() {
	      return this.at(0);
	    }
	  }, {
	    key: "last",
	    get: function get() {
	      return this.at(this.length - 1);
	    }
	  }, {
	    key: "length",
	    get: function get() {
	      return this.nodes.length;
	    }
	  }]);

	  return Container;
	}(_node["default"]);

	exports["default"] = Container;
	module.exports = exports.default;
} (container, container.exports));

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _container = _interopRequireDefault(container.exports);

	var _types = types;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

	function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var Root = /*#__PURE__*/function (_Container) {
	  _inheritsLoose(Root, _Container);

	  function Root(opts) {
	    var _this;

	    _this = _Container.call(this, opts) || this;
	    _this.type = _types.ROOT;
	    return _this;
	  }

	  var _proto = Root.prototype;

	  _proto.toString = function toString() {
	    var str = this.reduce(function (memo, selector) {
	      memo.push(String(selector));
	      return memo;
	    }, []).join(',');
	    return this.trailingComma ? str + ',' : str;
	  };

	  _proto.error = function error(message, options) {
	    if (this._error) {
	      return this._error(message, options);
	    } else {
	      return new Error(message);
	    }
	  };

	  _createClass(Root, [{
	    key: "errorGenerator",
	    set: function set(handler) {
	      this._error = handler;
	    }
	  }]);

	  return Root;
	}(_container["default"]);

	exports["default"] = Root;
	module.exports = exports.default;
} (root$1, root$1.exports));

var selector$1 = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _container = _interopRequireDefault(container.exports);

	var _types = types;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var Selector = /*#__PURE__*/function (_Container) {
	  _inheritsLoose(Selector, _Container);

	  function Selector(opts) {
	    var _this;

	    _this = _Container.call(this, opts) || this;
	    _this.type = _types.SELECTOR;
	    return _this;
	  }

	  return Selector;
	}(_container["default"]);

	exports["default"] = Selector;
	module.exports = exports.default;
} (selector$1, selector$1.exports));

var className$1 = {exports: {}};

/*! https://mths.be/cssesc v3.0.0 by @mathias */

var object = {};
var hasOwnProperty = object.hasOwnProperty;
var merge = function merge(options, defaults) {
	if (!options) {
		return defaults;
	}
	var result = {};
	for (var key in defaults) {
		// `if (defaults.hasOwnProperty(key) { … }` is not needed here, since
		// only recognized option names are used.
		result[key] = hasOwnProperty.call(options, key) ? options[key] : defaults[key];
	}
	return result;
};

var regexAnySingleEscape = /[ -,\.\/:-@\[-\^`\{-~]/;
var regexSingleEscape = /[ -,\.\/:-@\[\]\^`\{-~]/;
var regexExcessiveSpaces = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g;

// https://mathiasbynens.be/notes/css-escapes#css
var cssesc = function cssesc(string, options) {
	options = merge(options, cssesc.options);
	if (options.quotes != 'single' && options.quotes != 'double') {
		options.quotes = 'single';
	}
	var quote = options.quotes == 'double' ? '"' : '\'';
	var isIdentifier = options.isIdentifier;

	var firstChar = string.charAt(0);
	var output = '';
	var counter = 0;
	var length = string.length;
	while (counter < length) {
		var character = string.charAt(counter++);
		var codePoint = character.charCodeAt();
		var value = void 0;
		// If it’s not a printable ASCII character…
		if (codePoint < 0x20 || codePoint > 0x7E) {
			if (codePoint >= 0xD800 && codePoint <= 0xDBFF && counter < length) {
				// It’s a high surrogate, and there is a next character.
				var extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) {
					// next character is low surrogate
					codePoint = ((codePoint & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
				} else {
					// It’s an unmatched surrogate; only append this code unit, in case
					// the next code unit is the high surrogate of a surrogate pair.
					counter--;
				}
			}
			value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
		} else {
			if (options.escapeEverything) {
				if (regexAnySingleEscape.test(character)) {
					value = '\\' + character;
				} else {
					value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
				}
			} else if (/[\t\n\f\r\x0B]/.test(character)) {
				value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
			} else if (character == '\\' || !isIdentifier && (character == '"' && quote == character || character == '\'' && quote == character) || isIdentifier && regexSingleEscape.test(character)) {
				value = '\\' + character;
			} else {
				value = character;
			}
		}
		output += value;
	}

	if (isIdentifier) {
		if (/^-[-\d]/.test(output)) {
			output = '\\-' + output.slice(1);
		} else if (/\d/.test(firstChar)) {
			output = '\\3' + firstChar + ' ' + output.slice(1);
		}
	}

	// Remove spaces after `\HEX` escapes that are not followed by a hex digit,
	// since they’re redundant. Note that this is only possible if the escape
	// sequence isn’t preceded by an odd number of backslashes.
	output = output.replace(regexExcessiveSpaces, function ($0, $1, $2) {
		if ($1 && $1.length % 2) {
			// It’s not safe to remove the space, so don’t.
			return $0;
		}
		// Strip the space.
		return ($1 || '') + $2;
	});

	if (!isIdentifier && options.wrap) {
		return quote + output + quote;
	}
	return output;
};

// Expose default options (so they can be overridden globally).
cssesc.options = {
	'escapeEverything': false,
	'isIdentifier': false,
	'quotes': 'single',
	'wrap': false
};

cssesc.version = '3.0.0';

var cssesc_1 = cssesc;

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _cssesc = _interopRequireDefault(cssesc_1);

	var _util = util;

	var _node = _interopRequireDefault(node$1.exports);

	var _types = types;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

	function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var ClassName = /*#__PURE__*/function (_Node) {
	  _inheritsLoose(ClassName, _Node);

	  function ClassName(opts) {
	    var _this;

	    _this = _Node.call(this, opts) || this;
	    _this.type = _types.CLASS;
	    _this._constructed = true;
	    return _this;
	  }

	  var _proto = ClassName.prototype;

	  _proto.valueToString = function valueToString() {
	    return '.' + _Node.prototype.valueToString.call(this);
	  };

	  _createClass(ClassName, [{
	    key: "value",
	    get: function get() {
	      return this._value;
	    },
	    set: function set(v) {
	      if (this._constructed) {
	        var escaped = (0, _cssesc["default"])(v, {
	          isIdentifier: true
	        });

	        if (escaped !== v) {
	          (0, _util.ensureObject)(this, "raws");
	          this.raws.value = escaped;
	        } else if (this.raws) {
	          delete this.raws.value;
	        }
	      }

	      this._value = v;
	    }
	  }]);

	  return ClassName;
	}(_node["default"]);

	exports["default"] = ClassName;
	module.exports = exports.default;
} (className$1, className$1.exports));

var comment$2 = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _node = _interopRequireDefault(node$1.exports);

	var _types = types;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var Comment = /*#__PURE__*/function (_Node) {
	  _inheritsLoose(Comment, _Node);

	  function Comment(opts) {
	    var _this;

	    _this = _Node.call(this, opts) || this;
	    _this.type = _types.COMMENT;
	    return _this;
	  }

	  return Comment;
	}(_node["default"]);

	exports["default"] = Comment;
	module.exports = exports.default;
} (comment$2, comment$2.exports));

var id$1 = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _node = _interopRequireDefault(node$1.exports);

	var _types = types;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var ID = /*#__PURE__*/function (_Node) {
	  _inheritsLoose(ID, _Node);

	  function ID(opts) {
	    var _this;

	    _this = _Node.call(this, opts) || this;
	    _this.type = _types.ID;
	    return _this;
	  }

	  var _proto = ID.prototype;

	  _proto.valueToString = function valueToString() {
	    return '#' + _Node.prototype.valueToString.call(this);
	  };

	  return ID;
	}(_node["default"]);

	exports["default"] = ID;
	module.exports = exports.default;
} (id$1, id$1.exports));

var tag$1 = {exports: {}};

var namespace = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _cssesc = _interopRequireDefault(cssesc_1);

	var _util = util;

	var _node = _interopRequireDefault(node$1.exports);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

	function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var Namespace = /*#__PURE__*/function (_Node) {
	  _inheritsLoose(Namespace, _Node);

	  function Namespace() {
	    return _Node.apply(this, arguments) || this;
	  }

	  var _proto = Namespace.prototype;

	  _proto.qualifiedName = function qualifiedName(value) {
	    if (this.namespace) {
	      return this.namespaceString + "|" + value;
	    } else {
	      return value;
	    }
	  };

	  _proto.valueToString = function valueToString() {
	    return this.qualifiedName(_Node.prototype.valueToString.call(this));
	  };

	  _createClass(Namespace, [{
	    key: "namespace",
	    get: function get() {
	      return this._namespace;
	    },
	    set: function set(namespace) {
	      if (namespace === true || namespace === "*" || namespace === "&") {
	        this._namespace = namespace;

	        if (this.raws) {
	          delete this.raws.namespace;
	        }

	        return;
	      }

	      var escaped = (0, _cssesc["default"])(namespace, {
	        isIdentifier: true
	      });
	      this._namespace = namespace;

	      if (escaped !== namespace) {
	        (0, _util.ensureObject)(this, "raws");
	        this.raws.namespace = escaped;
	      } else if (this.raws) {
	        delete this.raws.namespace;
	      }
	    }
	  }, {
	    key: "ns",
	    get: function get() {
	      return this._namespace;
	    },
	    set: function set(namespace) {
	      this.namespace = namespace;
	    }
	  }, {
	    key: "namespaceString",
	    get: function get() {
	      if (this.namespace) {
	        var ns = this.stringifyProperty("namespace");

	        if (ns === true) {
	          return '';
	        } else {
	          return ns;
	        }
	      } else {
	        return '';
	      }
	    }
	  }]);

	  return Namespace;
	}(_node["default"]);

	exports["default"] = Namespace;
	module.exports = exports.default;
} (namespace, namespace.exports));

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _namespace = _interopRequireDefault(namespace.exports);

	var _types = types;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var Tag = /*#__PURE__*/function (_Namespace) {
	  _inheritsLoose(Tag, _Namespace);

	  function Tag(opts) {
	    var _this;

	    _this = _Namespace.call(this, opts) || this;
	    _this.type = _types.TAG;
	    return _this;
	  }

	  return Tag;
	}(_namespace["default"]);

	exports["default"] = Tag;
	module.exports = exports.default;
} (tag$1, tag$1.exports));

var string$1 = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _node = _interopRequireDefault(node$1.exports);

	var _types = types;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var String = /*#__PURE__*/function (_Node) {
	  _inheritsLoose(String, _Node);

	  function String(opts) {
	    var _this;

	    _this = _Node.call(this, opts) || this;
	    _this.type = _types.STRING;
	    return _this;
	  }

	  return String;
	}(_node["default"]);

	exports["default"] = String;
	module.exports = exports.default;
} (string$1, string$1.exports));

var pseudo$1 = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _container = _interopRequireDefault(container.exports);

	var _types = types;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var Pseudo = /*#__PURE__*/function (_Container) {
	  _inheritsLoose(Pseudo, _Container);

	  function Pseudo(opts) {
	    var _this;

	    _this = _Container.call(this, opts) || this;
	    _this.type = _types.PSEUDO;
	    return _this;
	  }

	  var _proto = Pseudo.prototype;

	  _proto.toString = function toString() {
	    var params = this.length ? '(' + this.map(String).join(',') + ')' : '';
	    return [this.rawSpaceBefore, this.stringifyProperty("value"), params, this.rawSpaceAfter].join('');
	  };

	  return Pseudo;
	}(_container["default"]);

	exports["default"] = Pseudo;
	module.exports = exports.default;
} (pseudo$1, pseudo$1.exports));

var attribute$1 = {};

/**
 * For Node.js, simply re-export the core `util.deprecate` function.
 */

var node = require$$0$1.deprecate;

(function (exports) {

	exports.__esModule = true;
	exports.unescapeValue = unescapeValue;
	exports["default"] = void 0;

	var _cssesc = _interopRequireDefault(cssesc_1);

	var _unesc = _interopRequireDefault(unesc.exports);

	var _namespace = _interopRequireDefault(namespace.exports);

	var _types = types;

	var _CSSESC_QUOTE_OPTIONS;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

	function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var deprecate = node;

	var WRAPPED_IN_QUOTES = /^('|")([^]*)\1$/;
	var warnOfDeprecatedValueAssignment = deprecate(function () {}, "Assigning an attribute a value containing characters that might need to be escaped is deprecated. " + "Call attribute.setValue() instead.");
	var warnOfDeprecatedQuotedAssignment = deprecate(function () {}, "Assigning attr.quoted is deprecated and has no effect. Assign to attr.quoteMark instead.");
	var warnOfDeprecatedConstructor = deprecate(function () {}, "Constructing an Attribute selector with a value without specifying quoteMark is deprecated. Note: The value should be unescaped now.");

	function unescapeValue(value) {
	  var deprecatedUsage = false;
	  var quoteMark = null;
	  var unescaped = value;
	  var m = unescaped.match(WRAPPED_IN_QUOTES);

	  if (m) {
	    quoteMark = m[1];
	    unescaped = m[2];
	  }

	  unescaped = (0, _unesc["default"])(unescaped);

	  if (unescaped !== value) {
	    deprecatedUsage = true;
	  }

	  return {
	    deprecatedUsage: deprecatedUsage,
	    unescaped: unescaped,
	    quoteMark: quoteMark
	  };
	}

	function handleDeprecatedContructorOpts(opts) {
	  if (opts.quoteMark !== undefined) {
	    return opts;
	  }

	  if (opts.value === undefined) {
	    return opts;
	  }

	  warnOfDeprecatedConstructor();

	  var _unescapeValue = unescapeValue(opts.value),
	      quoteMark = _unescapeValue.quoteMark,
	      unescaped = _unescapeValue.unescaped;

	  if (!opts.raws) {
	    opts.raws = {};
	  }

	  if (opts.raws.value === undefined) {
	    opts.raws.value = opts.value;
	  }

	  opts.value = unescaped;
	  opts.quoteMark = quoteMark;
	  return opts;
	}

	var Attribute = /*#__PURE__*/function (_Namespace) {
	  _inheritsLoose(Attribute, _Namespace);

	  function Attribute(opts) {
	    var _this;

	    if (opts === void 0) {
	      opts = {};
	    }

	    _this = _Namespace.call(this, handleDeprecatedContructorOpts(opts)) || this;
	    _this.type = _types.ATTRIBUTE;
	    _this.raws = _this.raws || {};
	    Object.defineProperty(_this.raws, 'unquoted', {
	      get: deprecate(function () {
	        return _this.value;
	      }, "attr.raws.unquoted is deprecated. Call attr.value instead."),
	      set: deprecate(function () {
	        return _this.value;
	      }, "Setting attr.raws.unquoted is deprecated and has no effect. attr.value is unescaped by default now.")
	    });
	    _this._constructed = true;
	    return _this;
	  }
	  /**
	   * Returns the Attribute's value quoted such that it would be legal to use
	   * in the value of a css file. The original value's quotation setting
	   * used for stringification is left unchanged. See `setValue(value, options)`
	   * if you want to control the quote settings of a new value for the attribute.
	   *
	   * You can also change the quotation used for the current value by setting quoteMark.
	   *
	   * Options:
	   *   * quoteMark {'"' | "'" | null} - Use this value to quote the value. If this
	   *     option is not set, the original value for quoteMark will be used. If
	   *     indeterminate, a double quote is used. The legal values are:
	   *     * `null` - the value will be unquoted and characters will be escaped as necessary.
	   *     * `'` - the value will be quoted with a single quote and single quotes are escaped.
	   *     * `"` - the value will be quoted with a double quote and double quotes are escaped.
	   *   * preferCurrentQuoteMark {boolean} - if true, prefer the source quote mark
	   *     over the quoteMark option value.
	   *   * smart {boolean} - if true, will select a quote mark based on the value
	   *     and the other options specified here. See the `smartQuoteMark()`
	   *     method.
	   **/


	  var _proto = Attribute.prototype;

	  _proto.getQuotedValue = function getQuotedValue(options) {
	    if (options === void 0) {
	      options = {};
	    }

	    var quoteMark = this._determineQuoteMark(options);

	    var cssescopts = CSSESC_QUOTE_OPTIONS[quoteMark];
	    var escaped = (0, _cssesc["default"])(this._value, cssescopts);
	    return escaped;
	  };

	  _proto._determineQuoteMark = function _determineQuoteMark(options) {
	    return options.smart ? this.smartQuoteMark(options) : this.preferredQuoteMark(options);
	  }
	  /**
	   * Set the unescaped value with the specified quotation options. The value
	   * provided must not include any wrapping quote marks -- those quotes will
	   * be interpreted as part of the value and escaped accordingly.
	   */
	  ;

	  _proto.setValue = function setValue(value, options) {
	    if (options === void 0) {
	      options = {};
	    }

	    this._value = value;
	    this._quoteMark = this._determineQuoteMark(options);

	    this._syncRawValue();
	  }
	  /**
	   * Intelligently select a quoteMark value based on the value's contents. If
	   * the value is a legal CSS ident, it will not be quoted. Otherwise a quote
	   * mark will be picked that minimizes the number of escapes.
	   *
	   * If there's no clear winner, the quote mark from these options is used,
	   * then the source quote mark (this is inverted if `preferCurrentQuoteMark` is
	   * true). If the quoteMark is unspecified, a double quote is used.
	   *
	   * @param options This takes the quoteMark and preferCurrentQuoteMark options
	   * from the quoteValue method.
	   */
	  ;

	  _proto.smartQuoteMark = function smartQuoteMark(options) {
	    var v = this.value;
	    var numSingleQuotes = v.replace(/[^']/g, '').length;
	    var numDoubleQuotes = v.replace(/[^"]/g, '').length;

	    if (numSingleQuotes + numDoubleQuotes === 0) {
	      var escaped = (0, _cssesc["default"])(v, {
	        isIdentifier: true
	      });

	      if (escaped === v) {
	        return Attribute.NO_QUOTE;
	      } else {
	        var pref = this.preferredQuoteMark(options);

	        if (pref === Attribute.NO_QUOTE) {
	          // pick a quote mark that isn't none and see if it's smaller
	          var quote = this.quoteMark || options.quoteMark || Attribute.DOUBLE_QUOTE;
	          var opts = CSSESC_QUOTE_OPTIONS[quote];
	          var quoteValue = (0, _cssesc["default"])(v, opts);

	          if (quoteValue.length < escaped.length) {
	            return quote;
	          }
	        }

	        return pref;
	      }
	    } else if (numDoubleQuotes === numSingleQuotes) {
	      return this.preferredQuoteMark(options);
	    } else if (numDoubleQuotes < numSingleQuotes) {
	      return Attribute.DOUBLE_QUOTE;
	    } else {
	      return Attribute.SINGLE_QUOTE;
	    }
	  }
	  /**
	   * Selects the preferred quote mark based on the options and the current quote mark value.
	   * If you want the quote mark to depend on the attribute value, call `smartQuoteMark(opts)`
	   * instead.
	   */
	  ;

	  _proto.preferredQuoteMark = function preferredQuoteMark(options) {
	    var quoteMark = options.preferCurrentQuoteMark ? this.quoteMark : options.quoteMark;

	    if (quoteMark === undefined) {
	      quoteMark = options.preferCurrentQuoteMark ? options.quoteMark : this.quoteMark;
	    }

	    if (quoteMark === undefined) {
	      quoteMark = Attribute.DOUBLE_QUOTE;
	    }

	    return quoteMark;
	  };

	  _proto._syncRawValue = function _syncRawValue() {
	    var rawValue = (0, _cssesc["default"])(this._value, CSSESC_QUOTE_OPTIONS[this.quoteMark]);

	    if (rawValue === this._value) {
	      if (this.raws) {
	        delete this.raws.value;
	      }
	    } else {
	      this.raws.value = rawValue;
	    }
	  };

	  _proto._handleEscapes = function _handleEscapes(prop, value) {
	    if (this._constructed) {
	      var escaped = (0, _cssesc["default"])(value, {
	        isIdentifier: true
	      });

	      if (escaped !== value) {
	        this.raws[prop] = escaped;
	      } else {
	        delete this.raws[prop];
	      }
	    }
	  };

	  _proto._spacesFor = function _spacesFor(name) {
	    var attrSpaces = {
	      before: '',
	      after: ''
	    };
	    var spaces = this.spaces[name] || {};
	    var rawSpaces = this.raws.spaces && this.raws.spaces[name] || {};
	    return Object.assign(attrSpaces, spaces, rawSpaces);
	  };

	  _proto._stringFor = function _stringFor(name, spaceName, concat) {
	    if (spaceName === void 0) {
	      spaceName = name;
	    }

	    if (concat === void 0) {
	      concat = defaultAttrConcat;
	    }

	    var attrSpaces = this._spacesFor(spaceName);

	    return concat(this.stringifyProperty(name), attrSpaces);
	  }
	  /**
	   * returns the offset of the attribute part specified relative to the
	   * start of the node of the output string.
	   *
	   * * "ns" - alias for "namespace"
	   * * "namespace" - the namespace if it exists.
	   * * "attribute" - the attribute name
	   * * "attributeNS" - the start of the attribute or its namespace
	   * * "operator" - the match operator of the attribute
	   * * "value" - The value (string or identifier)
	   * * "insensitive" - the case insensitivity flag;
	   * @param part One of the possible values inside an attribute.
	   * @returns -1 if the name is invalid or the value doesn't exist in this attribute.
	   */
	  ;

	  _proto.offsetOf = function offsetOf(name) {
	    var count = 1;

	    var attributeSpaces = this._spacesFor("attribute");

	    count += attributeSpaces.before.length;

	    if (name === "namespace" || name === "ns") {
	      return this.namespace ? count : -1;
	    }

	    if (name === "attributeNS") {
	      return count;
	    }

	    count += this.namespaceString.length;

	    if (this.namespace) {
	      count += 1;
	    }

	    if (name === "attribute") {
	      return count;
	    }

	    count += this.stringifyProperty("attribute").length;
	    count += attributeSpaces.after.length;

	    var operatorSpaces = this._spacesFor("operator");

	    count += operatorSpaces.before.length;
	    var operator = this.stringifyProperty("operator");

	    if (name === "operator") {
	      return operator ? count : -1;
	    }

	    count += operator.length;
	    count += operatorSpaces.after.length;

	    var valueSpaces = this._spacesFor("value");

	    count += valueSpaces.before.length;
	    var value = this.stringifyProperty("value");

	    if (name === "value") {
	      return value ? count : -1;
	    }

	    count += value.length;
	    count += valueSpaces.after.length;

	    var insensitiveSpaces = this._spacesFor("insensitive");

	    count += insensitiveSpaces.before.length;

	    if (name === "insensitive") {
	      return this.insensitive ? count : -1;
	    }

	    return -1;
	  };

	  _proto.toString = function toString() {
	    var _this2 = this;

	    var selector = [this.rawSpaceBefore, '['];
	    selector.push(this._stringFor('qualifiedAttribute', 'attribute'));

	    if (this.operator && (this.value || this.value === '')) {
	      selector.push(this._stringFor('operator'));
	      selector.push(this._stringFor('value'));
	      selector.push(this._stringFor('insensitiveFlag', 'insensitive', function (attrValue, attrSpaces) {
	        if (attrValue.length > 0 && !_this2.quoted && attrSpaces.before.length === 0 && !(_this2.spaces.value && _this2.spaces.value.after)) {
	          attrSpaces.before = " ";
	        }

	        return defaultAttrConcat(attrValue, attrSpaces);
	      }));
	    }

	    selector.push(']');
	    selector.push(this.rawSpaceAfter);
	    return selector.join('');
	  };

	  _createClass(Attribute, [{
	    key: "quoted",
	    get: function get() {
	      var qm = this.quoteMark;
	      return qm === "'" || qm === '"';
	    },
	    set: function set(value) {
	      warnOfDeprecatedQuotedAssignment();
	    }
	    /**
	     * returns a single (`'`) or double (`"`) quote character if the value is quoted.
	     * returns `null` if the value is not quoted.
	     * returns `undefined` if the quotation state is unknown (this can happen when
	     * the attribute is constructed without specifying a quote mark.)
	     */

	  }, {
	    key: "quoteMark",
	    get: function get() {
	      return this._quoteMark;
	    }
	    /**
	     * Set the quote mark to be used by this attribute's value.
	     * If the quote mark changes, the raw (escaped) value at `attr.raws.value` of the attribute
	     * value is updated accordingly.
	     *
	     * @param {"'" | '"' | null} quoteMark The quote mark or `null` if the value should be unquoted.
	     */
	    ,
	    set: function set(quoteMark) {
	      if (!this._constructed) {
	        this._quoteMark = quoteMark;
	        return;
	      }

	      if (this._quoteMark !== quoteMark) {
	        this._quoteMark = quoteMark;

	        this._syncRawValue();
	      }
	    }
	  }, {
	    key: "qualifiedAttribute",
	    get: function get() {
	      return this.qualifiedName(this.raws.attribute || this.attribute);
	    }
	  }, {
	    key: "insensitiveFlag",
	    get: function get() {
	      return this.insensitive ? 'i' : '';
	    }
	  }, {
	    key: "value",
	    get: function get() {
	      return this._value;
	    }
	    /**
	     * Before 3.0, the value had to be set to an escaped value including any wrapped
	     * quote marks. In 3.0, the semantics of `Attribute.value` changed so that the value
	     * is unescaped during parsing and any quote marks are removed.
	     *
	     * Because the ambiguity of this semantic change, if you set `attr.value = newValue`,
	     * a deprecation warning is raised when the new value contains any characters that would
	     * require escaping (including if it contains wrapped quotes).
	     *
	     * Instead, you should call `attr.setValue(newValue, opts)` and pass options that describe
	     * how the new value is quoted.
	     */
	    ,
	    set: function set(v) {
	      if (this._constructed) {
	        var _unescapeValue2 = unescapeValue(v),
	            deprecatedUsage = _unescapeValue2.deprecatedUsage,
	            unescaped = _unescapeValue2.unescaped,
	            quoteMark = _unescapeValue2.quoteMark;

	        if (deprecatedUsage) {
	          warnOfDeprecatedValueAssignment();
	        }

	        if (unescaped === this._value && quoteMark === this._quoteMark) {
	          return;
	        }

	        this._value = unescaped;
	        this._quoteMark = quoteMark;

	        this._syncRawValue();
	      } else {
	        this._value = v;
	      }
	    }
	  }, {
	    key: "attribute",
	    get: function get() {
	      return this._attribute;
	    },
	    set: function set(name) {
	      this._handleEscapes("attribute", name);

	      this._attribute = name;
	    }
	  }]);

	  return Attribute;
	}(_namespace["default"]);

	exports["default"] = Attribute;
	Attribute.NO_QUOTE = null;
	Attribute.SINGLE_QUOTE = "'";
	Attribute.DOUBLE_QUOTE = '"';
	var CSSESC_QUOTE_OPTIONS = (_CSSESC_QUOTE_OPTIONS = {
	  "'": {
	    quotes: 'single',
	    wrap: true
	  },
	  '"': {
	    quotes: 'double',
	    wrap: true
	  }
	}, _CSSESC_QUOTE_OPTIONS[null] = {
	  isIdentifier: true
	}, _CSSESC_QUOTE_OPTIONS);

	function defaultAttrConcat(attrValue, attrSpaces) {
	  return "" + attrSpaces.before + attrValue + attrSpaces.after;
	}
} (attribute$1));

var universal$1 = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _namespace = _interopRequireDefault(namespace.exports);

	var _types = types;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var Universal = /*#__PURE__*/function (_Namespace) {
	  _inheritsLoose(Universal, _Namespace);

	  function Universal(opts) {
	    var _this;

	    _this = _Namespace.call(this, opts) || this;
	    _this.type = _types.UNIVERSAL;
	    _this.value = '*';
	    return _this;
	  }

	  return Universal;
	}(_namespace["default"]);

	exports["default"] = Universal;
	module.exports = exports.default;
} (universal$1, universal$1.exports));

var combinator$2 = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _node = _interopRequireDefault(node$1.exports);

	var _types = types;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var Combinator = /*#__PURE__*/function (_Node) {
	  _inheritsLoose(Combinator, _Node);

	  function Combinator(opts) {
	    var _this;

	    _this = _Node.call(this, opts) || this;
	    _this.type = _types.COMBINATOR;
	    return _this;
	  }

	  return Combinator;
	}(_node["default"]);

	exports["default"] = Combinator;
	module.exports = exports.default;
} (combinator$2, combinator$2.exports));

var nesting$1 = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _node = _interopRequireDefault(node$1.exports);

	var _types = types;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }

	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

	var Nesting = /*#__PURE__*/function (_Node) {
	  _inheritsLoose(Nesting, _Node);

	  function Nesting(opts) {
	    var _this;

	    _this = _Node.call(this, opts) || this;
	    _this.type = _types.NESTING;
	    _this.value = '&';
	    return _this;
	  }

	  return Nesting;
	}(_node["default"]);

	exports["default"] = Nesting;
	module.exports = exports.default;
} (nesting$1, nesting$1.exports));

var sortAscending = {exports: {}};

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = sortAscending;

	function sortAscending(list) {
	  return list.sort(function (a, b) {
	    return a - b;
	  });
	}
	module.exports = exports.default;
} (sortAscending, sortAscending.exports));

var tokenize = {};

var tokenTypes = {};

tokenTypes.__esModule = true;
tokenTypes.combinator = tokenTypes.word = tokenTypes.comment = tokenTypes.str = tokenTypes.tab = tokenTypes.newline = tokenTypes.feed = tokenTypes.cr = tokenTypes.backslash = tokenTypes.bang = tokenTypes.slash = tokenTypes.doubleQuote = tokenTypes.singleQuote = tokenTypes.space = tokenTypes.greaterThan = tokenTypes.pipe = tokenTypes.equals = tokenTypes.plus = tokenTypes.caret = tokenTypes.tilde = tokenTypes.dollar = tokenTypes.closeSquare = tokenTypes.openSquare = tokenTypes.closeParenthesis = tokenTypes.openParenthesis = tokenTypes.semicolon = tokenTypes.colon = tokenTypes.comma = tokenTypes.at = tokenTypes.asterisk = tokenTypes.ampersand = void 0;
var ampersand = 38; // `&`.charCodeAt(0);

tokenTypes.ampersand = ampersand;
var asterisk = 42; // `*`.charCodeAt(0);

tokenTypes.asterisk = asterisk;
var at = 64; // `@`.charCodeAt(0);

tokenTypes.at = at;
var comma = 44; // `,`.charCodeAt(0);

tokenTypes.comma = comma;
var colon = 58; // `:`.charCodeAt(0);

tokenTypes.colon = colon;
var semicolon = 59; // `;`.charCodeAt(0);

tokenTypes.semicolon = semicolon;
var openParenthesis = 40; // `(`.charCodeAt(0);

tokenTypes.openParenthesis = openParenthesis;
var closeParenthesis = 41; // `)`.charCodeAt(0);

tokenTypes.closeParenthesis = closeParenthesis;
var openSquare = 91; // `[`.charCodeAt(0);

tokenTypes.openSquare = openSquare;
var closeSquare = 93; // `]`.charCodeAt(0);

tokenTypes.closeSquare = closeSquare;
var dollar = 36; // `$`.charCodeAt(0);

tokenTypes.dollar = dollar;
var tilde = 126; // `~`.charCodeAt(0);

tokenTypes.tilde = tilde;
var caret = 94; // `^`.charCodeAt(0);

tokenTypes.caret = caret;
var plus = 43; // `+`.charCodeAt(0);

tokenTypes.plus = plus;
var equals = 61; // `=`.charCodeAt(0);

tokenTypes.equals = equals;
var pipe = 124; // `|`.charCodeAt(0);

tokenTypes.pipe = pipe;
var greaterThan = 62; // `>`.charCodeAt(0);

tokenTypes.greaterThan = greaterThan;
var space = 32; // ` `.charCodeAt(0);

tokenTypes.space = space;
var singleQuote = 39; // `'`.charCodeAt(0);

tokenTypes.singleQuote = singleQuote;
var doubleQuote = 34; // `"`.charCodeAt(0);

tokenTypes.doubleQuote = doubleQuote;
var slash = 47; // `/`.charCodeAt(0);

tokenTypes.slash = slash;
var bang = 33; // `!`.charCodeAt(0);

tokenTypes.bang = bang;
var backslash = 92; // '\\'.charCodeAt(0);

tokenTypes.backslash = backslash;
var cr = 13; // '\r'.charCodeAt(0);

tokenTypes.cr = cr;
var feed = 12; // '\f'.charCodeAt(0);

tokenTypes.feed = feed;
var newline = 10; // '\n'.charCodeAt(0);

tokenTypes.newline = newline;
var tab = 9; // '\t'.charCodeAt(0);
// Expose aliases primarily for readability.

tokenTypes.tab = tab;
var str = singleQuote; // No good single character representation!

tokenTypes.str = str;
var comment$1 = -1;
tokenTypes.comment = comment$1;
var word = -2;
tokenTypes.word = word;
var combinator$1 = -3;
tokenTypes.combinator = combinator$1;

(function (exports) {

	exports.__esModule = true;
	exports["default"] = tokenize;
	exports.FIELDS = void 0;

	var t = _interopRequireWildcard(tokenTypes);

	var _unescapable, _wordDelimiters;

	function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

	var unescapable = (_unescapable = {}, _unescapable[t.tab] = true, _unescapable[t.newline] = true, _unescapable[t.cr] = true, _unescapable[t.feed] = true, _unescapable);
	var wordDelimiters = (_wordDelimiters = {}, _wordDelimiters[t.space] = true, _wordDelimiters[t.tab] = true, _wordDelimiters[t.newline] = true, _wordDelimiters[t.cr] = true, _wordDelimiters[t.feed] = true, _wordDelimiters[t.ampersand] = true, _wordDelimiters[t.asterisk] = true, _wordDelimiters[t.bang] = true, _wordDelimiters[t.comma] = true, _wordDelimiters[t.colon] = true, _wordDelimiters[t.semicolon] = true, _wordDelimiters[t.openParenthesis] = true, _wordDelimiters[t.closeParenthesis] = true, _wordDelimiters[t.openSquare] = true, _wordDelimiters[t.closeSquare] = true, _wordDelimiters[t.singleQuote] = true, _wordDelimiters[t.doubleQuote] = true, _wordDelimiters[t.plus] = true, _wordDelimiters[t.pipe] = true, _wordDelimiters[t.tilde] = true, _wordDelimiters[t.greaterThan] = true, _wordDelimiters[t.equals] = true, _wordDelimiters[t.dollar] = true, _wordDelimiters[t.caret] = true, _wordDelimiters[t.slash] = true, _wordDelimiters);
	var hex = {};
	var hexChars = "0123456789abcdefABCDEF";

	for (var i = 0; i < hexChars.length; i++) {
	  hex[hexChars.charCodeAt(i)] = true;
	}
	/**
	 *  Returns the last index of the bar css word
	 * @param {string} css The string in which the word begins
	 * @param {number} start The index into the string where word's first letter occurs
	 */


	function consumeWord(css, start) {
	  var next = start;
	  var code;

	  do {
	    code = css.charCodeAt(next);

	    if (wordDelimiters[code]) {
	      return next - 1;
	    } else if (code === t.backslash) {
	      next = consumeEscape(css, next) + 1;
	    } else {
	      // All other characters are part of the word
	      next++;
	    }
	  } while (next < css.length);

	  return next - 1;
	}
	/**
	 *  Returns the last index of the escape sequence
	 * @param {string} css The string in which the sequence begins
	 * @param {number} start The index into the string where escape character (`\`) occurs.
	 */


	function consumeEscape(css, start) {
	  var next = start;
	  var code = css.charCodeAt(next + 1);

	  if (unescapable[code]) ; else if (hex[code]) {
	    var hexDigits = 0; // consume up to 6 hex chars

	    do {
	      next++;
	      hexDigits++;
	      code = css.charCodeAt(next + 1);
	    } while (hex[code] && hexDigits < 6); // if fewer than 6 hex chars, a trailing space ends the escape


	    if (hexDigits < 6 && code === t.space) {
	      next++;
	    }
	  } else {
	    // the next char is part of the current word
	    next++;
	  }

	  return next;
	}

	var FIELDS = {
	  TYPE: 0,
	  START_LINE: 1,
	  START_COL: 2,
	  END_LINE: 3,
	  END_COL: 4,
	  START_POS: 5,
	  END_POS: 6
	};
	exports.FIELDS = FIELDS;

	function tokenize(input) {
	  var tokens = [];
	  var css = input.css.valueOf();
	  var _css = css,
	      length = _css.length;
	  var offset = -1;
	  var line = 1;
	  var start = 0;
	  var end = 0;
	  var code, content, endColumn, endLine, escaped, escapePos, last, lines, next, nextLine, nextOffset, quote, tokenType;

	  function unclosed(what, fix) {
	    if (input.safe) {
	      // fyi: this is never set to true.
	      css += fix;
	      next = css.length - 1;
	    } else {
	      throw input.error('Unclosed ' + what, line, start - offset, start);
	    }
	  }

	  while (start < length) {
	    code = css.charCodeAt(start);

	    if (code === t.newline) {
	      offset = start;
	      line += 1;
	    }

	    switch (code) {
	      case t.space:
	      case t.tab:
	      case t.newline:
	      case t.cr:
	      case t.feed:
	        next = start;

	        do {
	          next += 1;
	          code = css.charCodeAt(next);

	          if (code === t.newline) {
	            offset = next;
	            line += 1;
	          }
	        } while (code === t.space || code === t.newline || code === t.tab || code === t.cr || code === t.feed);

	        tokenType = t.space;
	        endLine = line;
	        endColumn = next - offset - 1;
	        end = next;
	        break;

	      case t.plus:
	      case t.greaterThan:
	      case t.tilde:
	      case t.pipe:
	        next = start;

	        do {
	          next += 1;
	          code = css.charCodeAt(next);
	        } while (code === t.plus || code === t.greaterThan || code === t.tilde || code === t.pipe);

	        tokenType = t.combinator;
	        endLine = line;
	        endColumn = start - offset;
	        end = next;
	        break;
	      // Consume these characters as single tokens.

	      case t.asterisk:
	      case t.ampersand:
	      case t.bang:
	      case t.comma:
	      case t.equals:
	      case t.dollar:
	      case t.caret:
	      case t.openSquare:
	      case t.closeSquare:
	      case t.colon:
	      case t.semicolon:
	      case t.openParenthesis:
	      case t.closeParenthesis:
	        next = start;
	        tokenType = code;
	        endLine = line;
	        endColumn = start - offset;
	        end = next + 1;
	        break;

	      case t.singleQuote:
	      case t.doubleQuote:
	        quote = code === t.singleQuote ? "'" : '"';
	        next = start;

	        do {
	          escaped = false;
	          next = css.indexOf(quote, next + 1);

	          if (next === -1) {
	            unclosed('quote', quote);
	          }

	          escapePos = next;

	          while (css.charCodeAt(escapePos - 1) === t.backslash) {
	            escapePos -= 1;
	            escaped = !escaped;
	          }
	        } while (escaped);

	        tokenType = t.str;
	        endLine = line;
	        endColumn = start - offset;
	        end = next + 1;
	        break;

	      default:
	        if (code === t.slash && css.charCodeAt(start + 1) === t.asterisk) {
	          next = css.indexOf('*/', start + 2) + 1;

	          if (next === 0) {
	            unclosed('comment', '*/');
	          }

	          content = css.slice(start, next + 1);
	          lines = content.split('\n');
	          last = lines.length - 1;

	          if (last > 0) {
	            nextLine = line + last;
	            nextOffset = next - lines[last].length;
	          } else {
	            nextLine = line;
	            nextOffset = offset;
	          }

	          tokenType = t.comment;
	          line = nextLine;
	          endLine = nextLine;
	          endColumn = next - nextOffset;
	        } else if (code === t.slash) {
	          next = start;
	          tokenType = code;
	          endLine = line;
	          endColumn = start - offset;
	          end = next + 1;
	        } else {
	          next = consumeWord(css, start);
	          tokenType = t.word;
	          endLine = line;
	          endColumn = next - offset;
	        }

	        end = next + 1;
	        break;
	    } // Ensure that the token structure remains consistent


	    tokens.push([tokenType, // [0] Token type
	    line, // [1] Starting line
	    start - offset, // [2] Starting column
	    endLine, // [3] Ending line
	    endColumn, // [4] Ending column
	    start, // [5] Start position / Source index
	    end // [6] End position
	    ]); // Reset offset for the next token

	    if (nextOffset) {
	      offset = nextOffset;
	      nextOffset = null;
	    }

	    start = end;
	  }

	  return tokens;
	}
} (tokenize));

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _root = _interopRequireDefault(root$1.exports);

	var _selector = _interopRequireDefault(selector$1.exports);

	var _className = _interopRequireDefault(className$1.exports);

	var _comment = _interopRequireDefault(comment$2.exports);

	var _id = _interopRequireDefault(id$1.exports);

	var _tag = _interopRequireDefault(tag$1.exports);

	var _string = _interopRequireDefault(string$1.exports);

	var _pseudo = _interopRequireDefault(pseudo$1.exports);

	var _attribute = _interopRequireWildcard(attribute$1);

	var _universal = _interopRequireDefault(universal$1.exports);

	var _combinator = _interopRequireDefault(combinator$2.exports);

	var _nesting = _interopRequireDefault(nesting$1.exports);

	var _sortAscending = _interopRequireDefault(sortAscending.exports);

	var _tokenize = _interopRequireWildcard(tokenize);

	var tokens = _interopRequireWildcard(tokenTypes);

	var types$1 = _interopRequireWildcard(types);

	var _util = util;

	var _WHITESPACE_TOKENS, _Object$assign;

	function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

	function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

	var WHITESPACE_TOKENS = (_WHITESPACE_TOKENS = {}, _WHITESPACE_TOKENS[tokens.space] = true, _WHITESPACE_TOKENS[tokens.cr] = true, _WHITESPACE_TOKENS[tokens.feed] = true, _WHITESPACE_TOKENS[tokens.newline] = true, _WHITESPACE_TOKENS[tokens.tab] = true, _WHITESPACE_TOKENS);
	var WHITESPACE_EQUIV_TOKENS = Object.assign({}, WHITESPACE_TOKENS, (_Object$assign = {}, _Object$assign[tokens.comment] = true, _Object$assign));

	function tokenStart(token) {
	  return {
	    line: token[_tokenize.FIELDS.START_LINE],
	    column: token[_tokenize.FIELDS.START_COL]
	  };
	}

	function tokenEnd(token) {
	  return {
	    line: token[_tokenize.FIELDS.END_LINE],
	    column: token[_tokenize.FIELDS.END_COL]
	  };
	}

	function getSource(startLine, startColumn, endLine, endColumn) {
	  return {
	    start: {
	      line: startLine,
	      column: startColumn
	    },
	    end: {
	      line: endLine,
	      column: endColumn
	    }
	  };
	}

	function getTokenSource(token) {
	  return getSource(token[_tokenize.FIELDS.START_LINE], token[_tokenize.FIELDS.START_COL], token[_tokenize.FIELDS.END_LINE], token[_tokenize.FIELDS.END_COL]);
	}

	function getTokenSourceSpan(startToken, endToken) {
	  if (!startToken) {
	    return undefined;
	  }

	  return getSource(startToken[_tokenize.FIELDS.START_LINE], startToken[_tokenize.FIELDS.START_COL], endToken[_tokenize.FIELDS.END_LINE], endToken[_tokenize.FIELDS.END_COL]);
	}

	function unescapeProp(node, prop) {
	  var value = node[prop];

	  if (typeof value !== "string") {
	    return;
	  }

	  if (value.indexOf("\\") !== -1) {
	    (0, _util.ensureObject)(node, 'raws');
	    node[prop] = (0, _util.unesc)(value);

	    if (node.raws[prop] === undefined) {
	      node.raws[prop] = value;
	    }
	  }

	  return node;
	}

	function indexesOf(array, item) {
	  var i = -1;
	  var indexes = [];

	  while ((i = array.indexOf(item, i + 1)) !== -1) {
	    indexes.push(i);
	  }

	  return indexes;
	}

	function uniqs() {
	  var list = Array.prototype.concat.apply([], arguments);
	  return list.filter(function (item, i) {
	    return i === list.indexOf(item);
	  });
	}

	var Parser = /*#__PURE__*/function () {
	  function Parser(rule, options) {
	    if (options === void 0) {
	      options = {};
	    }

	    this.rule = rule;
	    this.options = Object.assign({
	      lossy: false,
	      safe: false
	    }, options);
	    this.position = 0;
	    this.css = typeof this.rule === 'string' ? this.rule : this.rule.selector;
	    this.tokens = (0, _tokenize["default"])({
	      css: this.css,
	      error: this._errorGenerator(),
	      safe: this.options.safe
	    });
	    var rootSource = getTokenSourceSpan(this.tokens[0], this.tokens[this.tokens.length - 1]);
	    this.root = new _root["default"]({
	      source: rootSource
	    });
	    this.root.errorGenerator = this._errorGenerator();
	    var selector = new _selector["default"]({
	      source: {
	        start: {
	          line: 1,
	          column: 1
	        }
	      }
	    });
	    this.root.append(selector);
	    this.current = selector;
	    this.loop();
	  }

	  var _proto = Parser.prototype;

	  _proto._errorGenerator = function _errorGenerator() {
	    var _this = this;

	    return function (message, errorOptions) {
	      if (typeof _this.rule === 'string') {
	        return new Error(message);
	      }

	      return _this.rule.error(message, errorOptions);
	    };
	  };

	  _proto.attribute = function attribute() {
	    var attr = [];
	    var startingToken = this.currToken;
	    this.position++;

	    while (this.position < this.tokens.length && this.currToken[_tokenize.FIELDS.TYPE] !== tokens.closeSquare) {
	      attr.push(this.currToken);
	      this.position++;
	    }

	    if (this.currToken[_tokenize.FIELDS.TYPE] !== tokens.closeSquare) {
	      return this.expected('closing square bracket', this.currToken[_tokenize.FIELDS.START_POS]);
	    }

	    var len = attr.length;
	    var node = {
	      source: getSource(startingToken[1], startingToken[2], this.currToken[3], this.currToken[4]),
	      sourceIndex: startingToken[_tokenize.FIELDS.START_POS]
	    };

	    if (len === 1 && !~[tokens.word].indexOf(attr[0][_tokenize.FIELDS.TYPE])) {
	      return this.expected('attribute', attr[0][_tokenize.FIELDS.START_POS]);
	    }

	    var pos = 0;
	    var spaceBefore = '';
	    var commentBefore = '';
	    var lastAdded = null;
	    var spaceAfterMeaningfulToken = false;

	    while (pos < len) {
	      var token = attr[pos];
	      var content = this.content(token);
	      var next = attr[pos + 1];

	      switch (token[_tokenize.FIELDS.TYPE]) {
	        case tokens.space:
	          // if (
	          //     len === 1 ||
	          //     pos === 0 && this.content(next) === '|'
	          // ) {
	          //     return this.expected('attribute', token[TOKEN.START_POS], content);
	          // }
	          spaceAfterMeaningfulToken = true;

	          if (this.options.lossy) {
	            break;
	          }

	          if (lastAdded) {
	            (0, _util.ensureObject)(node, 'spaces', lastAdded);
	            var prevContent = node.spaces[lastAdded].after || '';
	            node.spaces[lastAdded].after = prevContent + content;
	            var existingComment = (0, _util.getProp)(node, 'raws', 'spaces', lastAdded, 'after') || null;

	            if (existingComment) {
	              node.raws.spaces[lastAdded].after = existingComment + content;
	            }
	          } else {
	            spaceBefore = spaceBefore + content;
	            commentBefore = commentBefore + content;
	          }

	          break;

	        case tokens.asterisk:
	          if (next[_tokenize.FIELDS.TYPE] === tokens.equals) {
	            node.operator = content;
	            lastAdded = 'operator';
	          } else if ((!node.namespace || lastAdded === "namespace" && !spaceAfterMeaningfulToken) && next) {
	            if (spaceBefore) {
	              (0, _util.ensureObject)(node, 'spaces', 'attribute');
	              node.spaces.attribute.before = spaceBefore;
	              spaceBefore = '';
	            }

	            if (commentBefore) {
	              (0, _util.ensureObject)(node, 'raws', 'spaces', 'attribute');
	              node.raws.spaces.attribute.before = spaceBefore;
	              commentBefore = '';
	            }

	            node.namespace = (node.namespace || "") + content;
	            var rawValue = (0, _util.getProp)(node, 'raws', 'namespace') || null;

	            if (rawValue) {
	              node.raws.namespace += content;
	            }

	            lastAdded = 'namespace';
	          }

	          spaceAfterMeaningfulToken = false;
	          break;

	        case tokens.dollar:
	          if (lastAdded === "value") {
	            var oldRawValue = (0, _util.getProp)(node, 'raws', 'value');
	            node.value += "$";

	            if (oldRawValue) {
	              node.raws.value = oldRawValue + "$";
	            }

	            break;
	          }

	        // Falls through

	        case tokens.caret:
	          if (next[_tokenize.FIELDS.TYPE] === tokens.equals) {
	            node.operator = content;
	            lastAdded = 'operator';
	          }

	          spaceAfterMeaningfulToken = false;
	          break;

	        case tokens.combinator:
	          if (content === '~' && next[_tokenize.FIELDS.TYPE] === tokens.equals) {
	            node.operator = content;
	            lastAdded = 'operator';
	          }

	          if (content !== '|') {
	            spaceAfterMeaningfulToken = false;
	            break;
	          }

	          if (next[_tokenize.FIELDS.TYPE] === tokens.equals) {
	            node.operator = content;
	            lastAdded = 'operator';
	          } else if (!node.namespace && !node.attribute) {
	            node.namespace = true;
	          }

	          spaceAfterMeaningfulToken = false;
	          break;

	        case tokens.word:
	          if (next && this.content(next) === '|' && attr[pos + 2] && attr[pos + 2][_tokenize.FIELDS.TYPE] !== tokens.equals && // this look-ahead probably fails with comment nodes involved.
	          !node.operator && !node.namespace) {
	            node.namespace = content;
	            lastAdded = 'namespace';
	          } else if (!node.attribute || lastAdded === "attribute" && !spaceAfterMeaningfulToken) {
	            if (spaceBefore) {
	              (0, _util.ensureObject)(node, 'spaces', 'attribute');
	              node.spaces.attribute.before = spaceBefore;
	              spaceBefore = '';
	            }

	            if (commentBefore) {
	              (0, _util.ensureObject)(node, 'raws', 'spaces', 'attribute');
	              node.raws.spaces.attribute.before = commentBefore;
	              commentBefore = '';
	            }

	            node.attribute = (node.attribute || "") + content;

	            var _rawValue = (0, _util.getProp)(node, 'raws', 'attribute') || null;

	            if (_rawValue) {
	              node.raws.attribute += content;
	            }

	            lastAdded = 'attribute';
	          } else if (!node.value && node.value !== "" || lastAdded === "value" && !spaceAfterMeaningfulToken) {
	            var _unescaped = (0, _util.unesc)(content);

	            var _oldRawValue = (0, _util.getProp)(node, 'raws', 'value') || '';

	            var oldValue = node.value || '';
	            node.value = oldValue + _unescaped;
	            node.quoteMark = null;

	            if (_unescaped !== content || _oldRawValue) {
	              (0, _util.ensureObject)(node, 'raws');
	              node.raws.value = (_oldRawValue || oldValue) + content;
	            }

	            lastAdded = 'value';
	          } else {
	            var insensitive = content === 'i' || content === "I";

	            if ((node.value || node.value === '') && (node.quoteMark || spaceAfterMeaningfulToken)) {
	              node.insensitive = insensitive;

	              if (!insensitive || content === "I") {
	                (0, _util.ensureObject)(node, 'raws');
	                node.raws.insensitiveFlag = content;
	              }

	              lastAdded = 'insensitive';

	              if (spaceBefore) {
	                (0, _util.ensureObject)(node, 'spaces', 'insensitive');
	                node.spaces.insensitive.before = spaceBefore;
	                spaceBefore = '';
	              }

	              if (commentBefore) {
	                (0, _util.ensureObject)(node, 'raws', 'spaces', 'insensitive');
	                node.raws.spaces.insensitive.before = commentBefore;
	                commentBefore = '';
	              }
	            } else if (node.value || node.value === '') {
	              lastAdded = 'value';
	              node.value += content;

	              if (node.raws.value) {
	                node.raws.value += content;
	              }
	            }
	          }

	          spaceAfterMeaningfulToken = false;
	          break;

	        case tokens.str:
	          if (!node.attribute || !node.operator) {
	            return this.error("Expected an attribute followed by an operator preceding the string.", {
	              index: token[_tokenize.FIELDS.START_POS]
	            });
	          }

	          var _unescapeValue = (0, _attribute.unescapeValue)(content),
	              unescaped = _unescapeValue.unescaped,
	              quoteMark = _unescapeValue.quoteMark;

	          node.value = unescaped;
	          node.quoteMark = quoteMark;
	          lastAdded = 'value';
	          (0, _util.ensureObject)(node, 'raws');
	          node.raws.value = content;
	          spaceAfterMeaningfulToken = false;
	          break;

	        case tokens.equals:
	          if (!node.attribute) {
	            return this.expected('attribute', token[_tokenize.FIELDS.START_POS], content);
	          }

	          if (node.value) {
	            return this.error('Unexpected "=" found; an operator was already defined.', {
	              index: token[_tokenize.FIELDS.START_POS]
	            });
	          }

	          node.operator = node.operator ? node.operator + content : content;
	          lastAdded = 'operator';
	          spaceAfterMeaningfulToken = false;
	          break;

	        case tokens.comment:
	          if (lastAdded) {
	            if (spaceAfterMeaningfulToken || next && next[_tokenize.FIELDS.TYPE] === tokens.space || lastAdded === 'insensitive') {
	              var lastComment = (0, _util.getProp)(node, 'spaces', lastAdded, 'after') || '';
	              var rawLastComment = (0, _util.getProp)(node, 'raws', 'spaces', lastAdded, 'after') || lastComment;
	              (0, _util.ensureObject)(node, 'raws', 'spaces', lastAdded);
	              node.raws.spaces[lastAdded].after = rawLastComment + content;
	            } else {
	              var lastValue = node[lastAdded] || '';
	              var rawLastValue = (0, _util.getProp)(node, 'raws', lastAdded) || lastValue;
	              (0, _util.ensureObject)(node, 'raws');
	              node.raws[lastAdded] = rawLastValue + content;
	            }
	          } else {
	            commentBefore = commentBefore + content;
	          }

	          break;

	        default:
	          return this.error("Unexpected \"" + content + "\" found.", {
	            index: token[_tokenize.FIELDS.START_POS]
	          });
	      }

	      pos++;
	    }

	    unescapeProp(node, "attribute");
	    unescapeProp(node, "namespace");
	    this.newNode(new _attribute["default"](node));
	    this.position++;
	  }
	  /**
	   * return a node containing meaningless garbage up to (but not including) the specified token position.
	   * if the token position is negative, all remaining tokens are consumed.
	   *
	   * This returns an array containing a single string node if all whitespace,
	   * otherwise an array of comment nodes with space before and after.
	   *
	   * These tokens are not added to the current selector, the caller can add them or use them to amend
	   * a previous node's space metadata.
	   *
	   * In lossy mode, this returns only comments.
	   */
	  ;

	  _proto.parseWhitespaceEquivalentTokens = function parseWhitespaceEquivalentTokens(stopPosition) {
	    if (stopPosition < 0) {
	      stopPosition = this.tokens.length;
	    }

	    var startPosition = this.position;
	    var nodes = [];
	    var space = "";
	    var lastComment = undefined;

	    do {
	      if (WHITESPACE_TOKENS[this.currToken[_tokenize.FIELDS.TYPE]]) {
	        if (!this.options.lossy) {
	          space += this.content();
	        }
	      } else if (this.currToken[_tokenize.FIELDS.TYPE] === tokens.comment) {
	        var spaces = {};

	        if (space) {
	          spaces.before = space;
	          space = "";
	        }

	        lastComment = new _comment["default"]({
	          value: this.content(),
	          source: getTokenSource(this.currToken),
	          sourceIndex: this.currToken[_tokenize.FIELDS.START_POS],
	          spaces: spaces
	        });
	        nodes.push(lastComment);
	      }
	    } while (++this.position < stopPosition);

	    if (space) {
	      if (lastComment) {
	        lastComment.spaces.after = space;
	      } else if (!this.options.lossy) {
	        var firstToken = this.tokens[startPosition];
	        var lastToken = this.tokens[this.position - 1];
	        nodes.push(new _string["default"]({
	          value: '',
	          source: getSource(firstToken[_tokenize.FIELDS.START_LINE], firstToken[_tokenize.FIELDS.START_COL], lastToken[_tokenize.FIELDS.END_LINE], lastToken[_tokenize.FIELDS.END_COL]),
	          sourceIndex: firstToken[_tokenize.FIELDS.START_POS],
	          spaces: {
	            before: space,
	            after: ''
	          }
	        }));
	      }
	    }

	    return nodes;
	  }
	  /**
	   * 
	   * @param {*} nodes 
	   */
	  ;

	  _proto.convertWhitespaceNodesToSpace = function convertWhitespaceNodesToSpace(nodes, requiredSpace) {
	    var _this2 = this;

	    if (requiredSpace === void 0) {
	      requiredSpace = false;
	    }

	    var space = "";
	    var rawSpace = "";
	    nodes.forEach(function (n) {
	      var spaceBefore = _this2.lossySpace(n.spaces.before, requiredSpace);

	      var rawSpaceBefore = _this2.lossySpace(n.rawSpaceBefore, requiredSpace);

	      space += spaceBefore + _this2.lossySpace(n.spaces.after, requiredSpace && spaceBefore.length === 0);
	      rawSpace += spaceBefore + n.value + _this2.lossySpace(n.rawSpaceAfter, requiredSpace && rawSpaceBefore.length === 0);
	    });

	    if (rawSpace === space) {
	      rawSpace = undefined;
	    }

	    var result = {
	      space: space,
	      rawSpace: rawSpace
	    };
	    return result;
	  };

	  _proto.isNamedCombinator = function isNamedCombinator(position) {
	    if (position === void 0) {
	      position = this.position;
	    }

	    return this.tokens[position + 0] && this.tokens[position + 0][_tokenize.FIELDS.TYPE] === tokens.slash && this.tokens[position + 1] && this.tokens[position + 1][_tokenize.FIELDS.TYPE] === tokens.word && this.tokens[position + 2] && this.tokens[position + 2][_tokenize.FIELDS.TYPE] === tokens.slash;
	  };

	  _proto.namedCombinator = function namedCombinator() {
	    if (this.isNamedCombinator()) {
	      var nameRaw = this.content(this.tokens[this.position + 1]);
	      var name = (0, _util.unesc)(nameRaw).toLowerCase();
	      var raws = {};

	      if (name !== nameRaw) {
	        raws.value = "/" + nameRaw + "/";
	      }

	      var node = new _combinator["default"]({
	        value: "/" + name + "/",
	        source: getSource(this.currToken[_tokenize.FIELDS.START_LINE], this.currToken[_tokenize.FIELDS.START_COL], this.tokens[this.position + 2][_tokenize.FIELDS.END_LINE], this.tokens[this.position + 2][_tokenize.FIELDS.END_COL]),
	        sourceIndex: this.currToken[_tokenize.FIELDS.START_POS],
	        raws: raws
	      });
	      this.position = this.position + 3;
	      return node;
	    } else {
	      this.unexpected();
	    }
	  };

	  _proto.combinator = function combinator() {
	    var _this3 = this;

	    if (this.content() === '|') {
	      return this.namespace();
	    } // We need to decide between a space that's a descendant combinator and meaningless whitespace at the end of a selector.


	    var nextSigTokenPos = this.locateNextMeaningfulToken(this.position);

	    if (nextSigTokenPos < 0 || this.tokens[nextSigTokenPos][_tokenize.FIELDS.TYPE] === tokens.comma) {
	      var nodes = this.parseWhitespaceEquivalentTokens(nextSigTokenPos);

	      if (nodes.length > 0) {
	        var last = this.current.last;

	        if (last) {
	          var _this$convertWhitespa = this.convertWhitespaceNodesToSpace(nodes),
	              space = _this$convertWhitespa.space,
	              rawSpace = _this$convertWhitespa.rawSpace;

	          if (rawSpace !== undefined) {
	            last.rawSpaceAfter += rawSpace;
	          }

	          last.spaces.after += space;
	        } else {
	          nodes.forEach(function (n) {
	            return _this3.newNode(n);
	          });
	        }
	      }

	      return;
	    }

	    var firstToken = this.currToken;
	    var spaceOrDescendantSelectorNodes = undefined;

	    if (nextSigTokenPos > this.position) {
	      spaceOrDescendantSelectorNodes = this.parseWhitespaceEquivalentTokens(nextSigTokenPos);
	    }

	    var node;

	    if (this.isNamedCombinator()) {
	      node = this.namedCombinator();
	    } else if (this.currToken[_tokenize.FIELDS.TYPE] === tokens.combinator) {
	      node = new _combinator["default"]({
	        value: this.content(),
	        source: getTokenSource(this.currToken),
	        sourceIndex: this.currToken[_tokenize.FIELDS.START_POS]
	      });
	      this.position++;
	    } else if (WHITESPACE_TOKENS[this.currToken[_tokenize.FIELDS.TYPE]]) ; else if (!spaceOrDescendantSelectorNodes) {
	      this.unexpected();
	    }

	    if (node) {
	      if (spaceOrDescendantSelectorNodes) {
	        var _this$convertWhitespa2 = this.convertWhitespaceNodesToSpace(spaceOrDescendantSelectorNodes),
	            _space = _this$convertWhitespa2.space,
	            _rawSpace = _this$convertWhitespa2.rawSpace;

	        node.spaces.before = _space;
	        node.rawSpaceBefore = _rawSpace;
	      }
	    } else {
	      // descendant combinator
	      var _this$convertWhitespa3 = this.convertWhitespaceNodesToSpace(spaceOrDescendantSelectorNodes, true),
	          _space2 = _this$convertWhitespa3.space,
	          _rawSpace2 = _this$convertWhitespa3.rawSpace;

	      if (!_rawSpace2) {
	        _rawSpace2 = _space2;
	      }

	      var spaces = {};
	      var raws = {
	        spaces: {}
	      };

	      if (_space2.endsWith(' ') && _rawSpace2.endsWith(' ')) {
	        spaces.before = _space2.slice(0, _space2.length - 1);
	        raws.spaces.before = _rawSpace2.slice(0, _rawSpace2.length - 1);
	      } else if (_space2.startsWith(' ') && _rawSpace2.startsWith(' ')) {
	        spaces.after = _space2.slice(1);
	        raws.spaces.after = _rawSpace2.slice(1);
	      } else {
	        raws.value = _rawSpace2;
	      }

	      node = new _combinator["default"]({
	        value: ' ',
	        source: getTokenSourceSpan(firstToken, this.tokens[this.position - 1]),
	        sourceIndex: firstToken[_tokenize.FIELDS.START_POS],
	        spaces: spaces,
	        raws: raws
	      });
	    }

	    if (this.currToken && this.currToken[_tokenize.FIELDS.TYPE] === tokens.space) {
	      node.spaces.after = this.optionalSpace(this.content());
	      this.position++;
	    }

	    return this.newNode(node);
	  };

	  _proto.comma = function comma() {
	    if (this.position === this.tokens.length - 1) {
	      this.root.trailingComma = true;
	      this.position++;
	      return;
	    }

	    this.current._inferEndPosition();

	    var selector = new _selector["default"]({
	      source: {
	        start: tokenStart(this.tokens[this.position + 1])
	      }
	    });
	    this.current.parent.append(selector);
	    this.current = selector;
	    this.position++;
	  };

	  _proto.comment = function comment() {
	    var current = this.currToken;
	    this.newNode(new _comment["default"]({
	      value: this.content(),
	      source: getTokenSource(current),
	      sourceIndex: current[_tokenize.FIELDS.START_POS]
	    }));
	    this.position++;
	  };

	  _proto.error = function error(message, opts) {
	    throw this.root.error(message, opts);
	  };

	  _proto.missingBackslash = function missingBackslash() {
	    return this.error('Expected a backslash preceding the semicolon.', {
	      index: this.currToken[_tokenize.FIELDS.START_POS]
	    });
	  };

	  _proto.missingParenthesis = function missingParenthesis() {
	    return this.expected('opening parenthesis', this.currToken[_tokenize.FIELDS.START_POS]);
	  };

	  _proto.missingSquareBracket = function missingSquareBracket() {
	    return this.expected('opening square bracket', this.currToken[_tokenize.FIELDS.START_POS]);
	  };

	  _proto.unexpected = function unexpected() {
	    return this.error("Unexpected '" + this.content() + "'. Escaping special characters with \\ may help.", this.currToken[_tokenize.FIELDS.START_POS]);
	  };

	  _proto.namespace = function namespace() {
	    var before = this.prevToken && this.content(this.prevToken) || true;

	    if (this.nextToken[_tokenize.FIELDS.TYPE] === tokens.word) {
	      this.position++;
	      return this.word(before);
	    } else if (this.nextToken[_tokenize.FIELDS.TYPE] === tokens.asterisk) {
	      this.position++;
	      return this.universal(before);
	    }
	  };

	  _proto.nesting = function nesting() {
	    if (this.nextToken) {
	      var nextContent = this.content(this.nextToken);

	      if (nextContent === "|") {
	        this.position++;
	        return;
	      }
	    }

	    var current = this.currToken;
	    this.newNode(new _nesting["default"]({
	      value: this.content(),
	      source: getTokenSource(current),
	      sourceIndex: current[_tokenize.FIELDS.START_POS]
	    }));
	    this.position++;
	  };

	  _proto.parentheses = function parentheses() {
	    var last = this.current.last;
	    var unbalanced = 1;
	    this.position++;

	    if (last && last.type === types$1.PSEUDO) {
	      var selector = new _selector["default"]({
	        source: {
	          start: tokenStart(this.tokens[this.position - 1])
	        }
	      });
	      var cache = this.current;
	      last.append(selector);
	      this.current = selector;

	      while (this.position < this.tokens.length && unbalanced) {
	        if (this.currToken[_tokenize.FIELDS.TYPE] === tokens.openParenthesis) {
	          unbalanced++;
	        }

	        if (this.currToken[_tokenize.FIELDS.TYPE] === tokens.closeParenthesis) {
	          unbalanced--;
	        }

	        if (unbalanced) {
	          this.parse();
	        } else {
	          this.current.source.end = tokenEnd(this.currToken);
	          this.current.parent.source.end = tokenEnd(this.currToken);
	          this.position++;
	        }
	      }

	      this.current = cache;
	    } else {
	      // I think this case should be an error. It's used to implement a basic parse of media queries
	      // but I don't think it's a good idea.
	      var parenStart = this.currToken;
	      var parenValue = "(";
	      var parenEnd;

	      while (this.position < this.tokens.length && unbalanced) {
	        if (this.currToken[_tokenize.FIELDS.TYPE] === tokens.openParenthesis) {
	          unbalanced++;
	        }

	        if (this.currToken[_tokenize.FIELDS.TYPE] === tokens.closeParenthesis) {
	          unbalanced--;
	        }

	        parenEnd = this.currToken;
	        parenValue += this.parseParenthesisToken(this.currToken);
	        this.position++;
	      }

	      if (last) {
	        last.appendToPropertyAndEscape("value", parenValue, parenValue);
	      } else {
	        this.newNode(new _string["default"]({
	          value: parenValue,
	          source: getSource(parenStart[_tokenize.FIELDS.START_LINE], parenStart[_tokenize.FIELDS.START_COL], parenEnd[_tokenize.FIELDS.END_LINE], parenEnd[_tokenize.FIELDS.END_COL]),
	          sourceIndex: parenStart[_tokenize.FIELDS.START_POS]
	        }));
	      }
	    }

	    if (unbalanced) {
	      return this.expected('closing parenthesis', this.currToken[_tokenize.FIELDS.START_POS]);
	    }
	  };

	  _proto.pseudo = function pseudo() {
	    var _this4 = this;

	    var pseudoStr = '';
	    var startingToken = this.currToken;

	    while (this.currToken && this.currToken[_tokenize.FIELDS.TYPE] === tokens.colon) {
	      pseudoStr += this.content();
	      this.position++;
	    }

	    if (!this.currToken) {
	      return this.expected(['pseudo-class', 'pseudo-element'], this.position - 1);
	    }

	    if (this.currToken[_tokenize.FIELDS.TYPE] === tokens.word) {
	      this.splitWord(false, function (first, length) {
	        pseudoStr += first;

	        _this4.newNode(new _pseudo["default"]({
	          value: pseudoStr,
	          source: getTokenSourceSpan(startingToken, _this4.currToken),
	          sourceIndex: startingToken[_tokenize.FIELDS.START_POS]
	        }));

	        if (length > 1 && _this4.nextToken && _this4.nextToken[_tokenize.FIELDS.TYPE] === tokens.openParenthesis) {
	          _this4.error('Misplaced parenthesis.', {
	            index: _this4.nextToken[_tokenize.FIELDS.START_POS]
	          });
	        }
	      });
	    } else {
	      return this.expected(['pseudo-class', 'pseudo-element'], this.currToken[_tokenize.FIELDS.START_POS]);
	    }
	  };

	  _proto.space = function space() {
	    var content = this.content(); // Handle space before and after the selector

	    if (this.position === 0 || this.prevToken[_tokenize.FIELDS.TYPE] === tokens.comma || this.prevToken[_tokenize.FIELDS.TYPE] === tokens.openParenthesis || this.current.nodes.every(function (node) {
	      return node.type === 'comment';
	    })) {
	      this.spaces = this.optionalSpace(content);
	      this.position++;
	    } else if (this.position === this.tokens.length - 1 || this.nextToken[_tokenize.FIELDS.TYPE] === tokens.comma || this.nextToken[_tokenize.FIELDS.TYPE] === tokens.closeParenthesis) {
	      this.current.last.spaces.after = this.optionalSpace(content);
	      this.position++;
	    } else {
	      this.combinator();
	    }
	  };

	  _proto.string = function string() {
	    var current = this.currToken;
	    this.newNode(new _string["default"]({
	      value: this.content(),
	      source: getTokenSource(current),
	      sourceIndex: current[_tokenize.FIELDS.START_POS]
	    }));
	    this.position++;
	  };

	  _proto.universal = function universal(namespace) {
	    var nextToken = this.nextToken;

	    if (nextToken && this.content(nextToken) === '|') {
	      this.position++;
	      return this.namespace();
	    }

	    var current = this.currToken;
	    this.newNode(new _universal["default"]({
	      value: this.content(),
	      source: getTokenSource(current),
	      sourceIndex: current[_tokenize.FIELDS.START_POS]
	    }), namespace);
	    this.position++;
	  };

	  _proto.splitWord = function splitWord(namespace, firstCallback) {
	    var _this5 = this;

	    var nextToken = this.nextToken;
	    var word = this.content();

	    while (nextToken && ~[tokens.dollar, tokens.caret, tokens.equals, tokens.word].indexOf(nextToken[_tokenize.FIELDS.TYPE])) {
	      this.position++;
	      var current = this.content();
	      word += current;

	      if (current.lastIndexOf('\\') === current.length - 1) {
	        var next = this.nextToken;

	        if (next && next[_tokenize.FIELDS.TYPE] === tokens.space) {
	          word += this.requiredSpace(this.content(next));
	          this.position++;
	        }
	      }

	      nextToken = this.nextToken;
	    }

	    var hasClass = indexesOf(word, '.').filter(function (i) {
	      // Allow escaped dot within class name
	      var escapedDot = word[i - 1] === '\\'; // Allow decimal numbers percent in @keyframes

	      var isKeyframesPercent = /^\d+\.\d+%$/.test(word);
	      return !escapedDot && !isKeyframesPercent;
	    });
	    var hasId = indexesOf(word, '#').filter(function (i) {
	      return word[i - 1] !== '\\';
	    }); // Eliminate Sass interpolations from the list of id indexes

	    var interpolations = indexesOf(word, '#{');

	    if (interpolations.length) {
	      hasId = hasId.filter(function (hashIndex) {
	        return !~interpolations.indexOf(hashIndex);
	      });
	    }

	    var indices = (0, _sortAscending["default"])(uniqs([0].concat(hasClass, hasId)));
	    indices.forEach(function (ind, i) {
	      var index = indices[i + 1] || word.length;
	      var value = word.slice(ind, index);

	      if (i === 0 && firstCallback) {
	        return firstCallback.call(_this5, value, indices.length);
	      }

	      var node;
	      var current = _this5.currToken;
	      var sourceIndex = current[_tokenize.FIELDS.START_POS] + indices[i];
	      var source = getSource(current[1], current[2] + ind, current[3], current[2] + (index - 1));

	      if (~hasClass.indexOf(ind)) {
	        var classNameOpts = {
	          value: value.slice(1),
	          source: source,
	          sourceIndex: sourceIndex
	        };
	        node = new _className["default"](unescapeProp(classNameOpts, "value"));
	      } else if (~hasId.indexOf(ind)) {
	        var idOpts = {
	          value: value.slice(1),
	          source: source,
	          sourceIndex: sourceIndex
	        };
	        node = new _id["default"](unescapeProp(idOpts, "value"));
	      } else {
	        var tagOpts = {
	          value: value,
	          source: source,
	          sourceIndex: sourceIndex
	        };
	        unescapeProp(tagOpts, "value");
	        node = new _tag["default"](tagOpts);
	      }

	      _this5.newNode(node, namespace); // Ensure that the namespace is used only once


	      namespace = null;
	    });
	    this.position++;
	  };

	  _proto.word = function word(namespace) {
	    var nextToken = this.nextToken;

	    if (nextToken && this.content(nextToken) === '|') {
	      this.position++;
	      return this.namespace();
	    }

	    return this.splitWord(namespace);
	  };

	  _proto.loop = function loop() {
	    while (this.position < this.tokens.length) {
	      this.parse(true);
	    }

	    this.current._inferEndPosition();

	    return this.root;
	  };

	  _proto.parse = function parse(throwOnParenthesis) {
	    switch (this.currToken[_tokenize.FIELDS.TYPE]) {
	      case tokens.space:
	        this.space();
	        break;

	      case tokens.comment:
	        this.comment();
	        break;

	      case tokens.openParenthesis:
	        this.parentheses();
	        break;

	      case tokens.closeParenthesis:
	        if (throwOnParenthesis) {
	          this.missingParenthesis();
	        }

	        break;

	      case tokens.openSquare:
	        this.attribute();
	        break;

	      case tokens.dollar:
	      case tokens.caret:
	      case tokens.equals:
	      case tokens.word:
	        this.word();
	        break;

	      case tokens.colon:
	        this.pseudo();
	        break;

	      case tokens.comma:
	        this.comma();
	        break;

	      case tokens.asterisk:
	        this.universal();
	        break;

	      case tokens.ampersand:
	        this.nesting();
	        break;

	      case tokens.slash:
	      case tokens.combinator:
	        this.combinator();
	        break;

	      case tokens.str:
	        this.string();
	        break;
	      // These cases throw; no break needed.

	      case tokens.closeSquare:
	        this.missingSquareBracket();

	      case tokens.semicolon:
	        this.missingBackslash();

	      default:
	        this.unexpected();
	    }
	  }
	  /**
	   * Helpers
	   */
	  ;

	  _proto.expected = function expected(description, index, found) {
	    if (Array.isArray(description)) {
	      var last = description.pop();
	      description = description.join(', ') + " or " + last;
	    }

	    var an = /^[aeiou]/.test(description[0]) ? 'an' : 'a';

	    if (!found) {
	      return this.error("Expected " + an + " " + description + ".", {
	        index: index
	      });
	    }

	    return this.error("Expected " + an + " " + description + ", found \"" + found + "\" instead.", {
	      index: index
	    });
	  };

	  _proto.requiredSpace = function requiredSpace(space) {
	    return this.options.lossy ? ' ' : space;
	  };

	  _proto.optionalSpace = function optionalSpace(space) {
	    return this.options.lossy ? '' : space;
	  };

	  _proto.lossySpace = function lossySpace(space, required) {
	    if (this.options.lossy) {
	      return required ? ' ' : '';
	    } else {
	      return space;
	    }
	  };

	  _proto.parseParenthesisToken = function parseParenthesisToken(token) {
	    var content = this.content(token);

	    if (token[_tokenize.FIELDS.TYPE] === tokens.space) {
	      return this.requiredSpace(content);
	    } else {
	      return content;
	    }
	  };

	  _proto.newNode = function newNode(node, namespace) {
	    if (namespace) {
	      if (/^ +$/.test(namespace)) {
	        if (!this.options.lossy) {
	          this.spaces = (this.spaces || '') + namespace;
	        }

	        namespace = true;
	      }

	      node.namespace = namespace;
	      unescapeProp(node, "namespace");
	    }

	    if (this.spaces) {
	      node.spaces.before = this.spaces;
	      this.spaces = '';
	    }

	    return this.current.append(node);
	  };

	  _proto.content = function content(token) {
	    if (token === void 0) {
	      token = this.currToken;
	    }

	    return this.css.slice(token[_tokenize.FIELDS.START_POS], token[_tokenize.FIELDS.END_POS]);
	  };

	  /**
	   * returns the index of the next non-whitespace, non-comment token.
	   * returns -1 if no meaningful token is found.
	   */
	  _proto.locateNextMeaningfulToken = function locateNextMeaningfulToken(startPosition) {
	    if (startPosition === void 0) {
	      startPosition = this.position + 1;
	    }

	    var searchPosition = startPosition;

	    while (searchPosition < this.tokens.length) {
	      if (WHITESPACE_EQUIV_TOKENS[this.tokens[searchPosition][_tokenize.FIELDS.TYPE]]) {
	        searchPosition++;
	        continue;
	      } else {
	        return searchPosition;
	      }
	    }

	    return -1;
	  };

	  _createClass(Parser, [{
	    key: "currToken",
	    get: function get() {
	      return this.tokens[this.position];
	    }
	  }, {
	    key: "nextToken",
	    get: function get() {
	      return this.tokens[this.position + 1];
	    }
	  }, {
	    key: "prevToken",
	    get: function get() {
	      return this.tokens[this.position - 1];
	    }
	  }]);

	  return Parser;
	}();

	exports["default"] = Parser;
	module.exports = exports.default;
} (parser, parser.exports));

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _parser = _interopRequireDefault(parser.exports);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var Processor = /*#__PURE__*/function () {
	  function Processor(func, options) {
	    this.func = func || function noop() {};

	    this.funcRes = null;
	    this.options = options;
	  }

	  var _proto = Processor.prototype;

	  _proto._shouldUpdateSelector = function _shouldUpdateSelector(rule, options) {
	    if (options === void 0) {
	      options = {};
	    }

	    var merged = Object.assign({}, this.options, options);

	    if (merged.updateSelector === false) {
	      return false;
	    } else {
	      return typeof rule !== "string";
	    }
	  };

	  _proto._isLossy = function _isLossy(options) {
	    if (options === void 0) {
	      options = {};
	    }

	    var merged = Object.assign({}, this.options, options);

	    if (merged.lossless === false) {
	      return true;
	    } else {
	      return false;
	    }
	  };

	  _proto._root = function _root(rule, options) {
	    if (options === void 0) {
	      options = {};
	    }

	    var parser = new _parser["default"](rule, this._parseOptions(options));
	    return parser.root;
	  };

	  _proto._parseOptions = function _parseOptions(options) {
	    return {
	      lossy: this._isLossy(options)
	    };
	  };

	  _proto._run = function _run(rule, options) {
	    var _this = this;

	    if (options === void 0) {
	      options = {};
	    }

	    return new Promise(function (resolve, reject) {
	      try {
	        var root = _this._root(rule, options);

	        Promise.resolve(_this.func(root)).then(function (transform) {
	          var string = undefined;

	          if (_this._shouldUpdateSelector(rule, options)) {
	            string = root.toString();
	            rule.selector = string;
	          }

	          return {
	            transform: transform,
	            root: root,
	            string: string
	          };
	        }).then(resolve, reject);
	      } catch (e) {
	        reject(e);
	        return;
	      }
	    });
	  };

	  _proto._runSync = function _runSync(rule, options) {
	    if (options === void 0) {
	      options = {};
	    }

	    var root = this._root(rule, options);

	    var transform = this.func(root);

	    if (transform && typeof transform.then === "function") {
	      throw new Error("Selector processor returned a promise to a synchronous call.");
	    }

	    var string = undefined;

	    if (options.updateSelector && typeof rule !== "string") {
	      string = root.toString();
	      rule.selector = string;
	    }

	    return {
	      transform: transform,
	      root: root,
	      string: string
	    };
	  }
	  /**
	   * Process rule into a selector AST.
	   *
	   * @param rule {postcss.Rule | string} The css selector to be processed
	   * @param options The options for processing
	   * @returns {Promise<parser.Root>} The AST of the selector after processing it.
	   */
	  ;

	  _proto.ast = function ast(rule, options) {
	    return this._run(rule, options).then(function (result) {
	      return result.root;
	    });
	  }
	  /**
	   * Process rule into a selector AST synchronously.
	   *
	   * @param rule {postcss.Rule | string} The css selector to be processed
	   * @param options The options for processing
	   * @returns {parser.Root} The AST of the selector after processing it.
	   */
	  ;

	  _proto.astSync = function astSync(rule, options) {
	    return this._runSync(rule, options).root;
	  }
	  /**
	   * Process a selector into a transformed value asynchronously
	   *
	   * @param rule {postcss.Rule | string} The css selector to be processed
	   * @param options The options for processing
	   * @returns {Promise<any>} The value returned by the processor.
	   */
	  ;

	  _proto.transform = function transform(rule, options) {
	    return this._run(rule, options).then(function (result) {
	      return result.transform;
	    });
	  }
	  /**
	   * Process a selector into a transformed value synchronously.
	   *
	   * @param rule {postcss.Rule | string} The css selector to be processed
	   * @param options The options for processing
	   * @returns {any} The value returned by the processor.
	   */
	  ;

	  _proto.transformSync = function transformSync(rule, options) {
	    return this._runSync(rule, options).transform;
	  }
	  /**
	   * Process a selector into a new selector string asynchronously.
	   *
	   * @param rule {postcss.Rule | string} The css selector to be processed
	   * @param options The options for processing
	   * @returns {string} the selector after processing.
	   */
	  ;

	  _proto.process = function process(rule, options) {
	    return this._run(rule, options).then(function (result) {
	      return result.string || result.root.toString();
	    });
	  }
	  /**
	   * Process a selector into a new selector string synchronously.
	   *
	   * @param rule {postcss.Rule | string} The css selector to be processed
	   * @param options The options for processing
	   * @returns {string} the selector after processing.
	   */
	  ;

	  _proto.processSync = function processSync(rule, options) {
	    var result = this._runSync(rule, options);

	    return result.string || result.root.toString();
	  };

	  return Processor;
	}();

	exports["default"] = Processor;
	module.exports = exports.default;
} (processor, processor.exports));

var selectors = {};

var constructors = {};

constructors.__esModule = true;
constructors.universal = constructors.tag = constructors.string = constructors.selector = constructors.root = constructors.pseudo = constructors.nesting = constructors.id = constructors.comment = constructors.combinator = constructors.className = constructors.attribute = void 0;

var _attribute = _interopRequireDefault(attribute$1);

var _className = _interopRequireDefault(className$1.exports);

var _combinator = _interopRequireDefault(combinator$2.exports);

var _comment = _interopRequireDefault(comment$2.exports);

var _id = _interopRequireDefault(id$1.exports);

var _nesting = _interopRequireDefault(nesting$1.exports);

var _pseudo = _interopRequireDefault(pseudo$1.exports);

var _root = _interopRequireDefault(root$1.exports);

var _selector = _interopRequireDefault(selector$1.exports);

var _string = _interopRequireDefault(string$1.exports);

var _tag = _interopRequireDefault(tag$1.exports);

var _universal = _interopRequireDefault(universal$1.exports);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var attribute = function attribute(opts) {
  return new _attribute["default"](opts);
};

constructors.attribute = attribute;

var className = function className(opts) {
  return new _className["default"](opts);
};

constructors.className = className;

var combinator = function combinator(opts) {
  return new _combinator["default"](opts);
};

constructors.combinator = combinator;

var comment = function comment(opts) {
  return new _comment["default"](opts);
};

constructors.comment = comment;

var id = function id(opts) {
  return new _id["default"](opts);
};

constructors.id = id;

var nesting = function nesting(opts) {
  return new _nesting["default"](opts);
};

constructors.nesting = nesting;

var pseudo = function pseudo(opts) {
  return new _pseudo["default"](opts);
};

constructors.pseudo = pseudo;

var root = function root(opts) {
  return new _root["default"](opts);
};

constructors.root = root;

var selector = function selector(opts) {
  return new _selector["default"](opts);
};

constructors.selector = selector;

var string = function string(opts) {
  return new _string["default"](opts);
};

constructors.string = string;

var tag = function tag(opts) {
  return new _tag["default"](opts);
};

constructors.tag = tag;

var universal = function universal(opts) {
  return new _universal["default"](opts);
};

constructors.universal = universal;

var guards = {};

guards.__esModule = true;
guards.isNode = isNode;
guards.isPseudoElement = isPseudoElement;
guards.isPseudoClass = isPseudoClass;
guards.isContainer = isContainer;
guards.isNamespace = isNamespace;
guards.isUniversal = guards.isTag = guards.isString = guards.isSelector = guards.isRoot = guards.isPseudo = guards.isNesting = guards.isIdentifier = guards.isComment = guards.isCombinator = guards.isClassName = guards.isAttribute = void 0;

var _types = types;

var _IS_TYPE;

var IS_TYPE = (_IS_TYPE = {}, _IS_TYPE[_types.ATTRIBUTE] = true, _IS_TYPE[_types.CLASS] = true, _IS_TYPE[_types.COMBINATOR] = true, _IS_TYPE[_types.COMMENT] = true, _IS_TYPE[_types.ID] = true, _IS_TYPE[_types.NESTING] = true, _IS_TYPE[_types.PSEUDO] = true, _IS_TYPE[_types.ROOT] = true, _IS_TYPE[_types.SELECTOR] = true, _IS_TYPE[_types.STRING] = true, _IS_TYPE[_types.TAG] = true, _IS_TYPE[_types.UNIVERSAL] = true, _IS_TYPE);

function isNode(node) {
  return typeof node === "object" && IS_TYPE[node.type];
}

function isNodeType(type, node) {
  return isNode(node) && node.type === type;
}

var isAttribute = isNodeType.bind(null, _types.ATTRIBUTE);
guards.isAttribute = isAttribute;
var isClassName = isNodeType.bind(null, _types.CLASS);
guards.isClassName = isClassName;
var isCombinator = isNodeType.bind(null, _types.COMBINATOR);
guards.isCombinator = isCombinator;
var isComment = isNodeType.bind(null, _types.COMMENT);
guards.isComment = isComment;
var isIdentifier = isNodeType.bind(null, _types.ID);
guards.isIdentifier = isIdentifier;
var isNesting = isNodeType.bind(null, _types.NESTING);
guards.isNesting = isNesting;
var isPseudo = isNodeType.bind(null, _types.PSEUDO);
guards.isPseudo = isPseudo;
var isRoot = isNodeType.bind(null, _types.ROOT);
guards.isRoot = isRoot;
var isSelector = isNodeType.bind(null, _types.SELECTOR);
guards.isSelector = isSelector;
var isString = isNodeType.bind(null, _types.STRING);
guards.isString = isString;
var isTag = isNodeType.bind(null, _types.TAG);
guards.isTag = isTag;
var isUniversal = isNodeType.bind(null, _types.UNIVERSAL);
guards.isUniversal = isUniversal;

function isPseudoElement(node) {
  return isPseudo(node) && node.value && (node.value.startsWith("::") || node.value.toLowerCase() === ":before" || node.value.toLowerCase() === ":after" || node.value.toLowerCase() === ":first-letter" || node.value.toLowerCase() === ":first-line");
}

function isPseudoClass(node) {
  return isPseudo(node) && !isPseudoElement(node);
}

function isContainer(node) {
  return !!(isNode(node) && node.walk);
}

function isNamespace(node) {
  return isAttribute(node) || isTag(node);
}

(function (exports) {

	exports.__esModule = true;

	var _types = types;

	Object.keys(_types).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  if (key in exports && exports[key] === _types[key]) return;
	  exports[key] = _types[key];
	});

	var _constructors = constructors;

	Object.keys(_constructors).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  if (key in exports && exports[key] === _constructors[key]) return;
	  exports[key] = _constructors[key];
	});

	var _guards = guards;

	Object.keys(_guards).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  if (key in exports && exports[key] === _guards[key]) return;
	  exports[key] = _guards[key];
	});
} (selectors));

(function (module, exports) {

	exports.__esModule = true;
	exports["default"] = void 0;

	var _processor = _interopRequireDefault(processor.exports);

	var selectors$1 = _interopRequireWildcard(selectors);

	function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var parser = function parser(processor) {
	  return new _processor["default"](processor);
	};

	Object.assign(parser, selectors$1);
	delete parser.__esModule;
	var _default = parser;
	exports["default"] = _default;
	module.exports = exports.default;
} (dist, dist.exports));

var selectorParser = /*@__PURE__*/getDefaultExportFromCjs(dist.exports);

// via https://github.com/vuejs/core/blob/9c304bfe7942a20264235865b4bb5f6e53fdee0d/packages/compiler-sfc/src/stylePluginScoped.ts

const animationNameRE = /^(-\w+-)?animation-name$/;
const animationRE = /^(-\w+-)?animation$/;

const warn = console.warn.bind(console);

const scopedPlugin = (id = '') => {
  const keyframes = Object.create(null);
  const shortId = id.replace(/^data-v-/, '');
  return {
    postcssPlugin: 'vue-sfc-scoped',
    Rule(rule) {
      processRule(id, rule);
    },
    AtRule(node) {
      if (/-?keyframes$/.test(node.name) &&
        !node.params.endsWith(`-${shortId}`)) {
        // register keyframes
        keyframes[node.params] = node.params = node.params + '-' + shortId;
      }
    },
    OnceExit(root) {
      if (Object.keys(keyframes).length) {
        // If keyframes are found in this <style>, find and rewrite animation names
        // in declarations.
        // Caveat: this only works for keyframes and animation rules in the same
        // <style> element.
        // individual animation-name declaration
        root.walkDecls(decl => {
          if (animationNameRE.test(decl.prop)) {
            decl.value = decl.value
              .split(',')
              .map(v => keyframes[v.trim()] || v.trim())
              .join(',');
          }
          // shorthand
          if (animationRE.test(decl.prop)) {
            decl.value = decl.value
              .split(',')
              .map(v => {
                const vals = v.trim().split(/\s+/);
                const i = vals.findIndex(val => keyframes[val]);
                if (i !== -1) {
                  vals.splice(i, 1, keyframes[vals[i]]);
                  return vals.join(' ');
                }
                else {
                  return v;
                }
              })
              .join(',');
          }
        });
      }
    }
  };
};
const processedRules = new WeakSet();
function processRule(id, rule) {
  if (processedRules.has(rule) ||
    (rule.parent &&
      rule.parent.type === 'atrule' &&
      /-?keyframes$/.test(rule.parent.name))) {
    return;
  }
  processedRules.add(rule);
  rule.selector = selectorParser(selectorRoot => {
    selectorRoot.each(selector => {
      rewriteSelector(id, selector, selectorRoot);
    });
  }).processSync(rule.selector);
}
function rewriteSelector(id, selector, selectorRoot, slotted = false) {
  let node = null;
  let shouldInject = true;
  // find the last child node to insert attribute selector
  selector.each(n => {
    // DEPRECATED ">>>" and "/deep/" combinator
    if (n.type === 'combinator' &&
      (n.value === '>>>' || n.value === '/deep/')) {
      n.value = ' ';
      n.spaces.before = n.spaces.after = '';
      warn(`the >>> and /deep/ combinators have been deprecated. ` +
        `Use :deep() instead.`);
      return false;
    }
    if (n.type === 'pseudo') {
      const { value } = n;
      // deep: inject [id] attribute at the node before the ::v-deep
      // combinator.
      if (value === ':deep' || value === '::v-deep') {
        if (n.nodes.length) {
          // .foo ::v-deep(.bar) -> .foo[xxxxxxx] .bar
          // replace the current node with ::v-deep's inner selector
          let last = n;
          n.nodes[0].each(ss => {
            selector.insertAfter(last, ss);
            last = ss;
          });
          // insert a space combinator before if it doesn't already have one
          const prev = selector.at(selector.index(n) - 1);
          if (!prev || !isSpaceCombinator(prev)) {
            selector.insertAfter(n, selectorParser.combinator({
              value: ' '
            }));
          }
          selector.removeChild(n);
        }
        else {
          // DEPRECATED usage
          // .foo ::v-deep .bar -> .foo[xxxxxxx] .bar
          warn(`::v-deep usage as a combinator has ` +
            `been deprecated. Use :deep(<inner-selector>) instead.`);
          const prev = selector.at(selector.index(n) - 1);
          if (prev && isSpaceCombinator(prev)) {
            selector.removeChild(prev);
          }
          selector.removeChild(n);
        }
        return false;
      }
      // slot: use selector inside `::v-slotted` and inject [id + '-s']
      // instead.
      // ::v-slotted(.foo) -> .foo[xxxxxxx-s]
      if (value === ':slotted' || value === '::v-slotted') {
        rewriteSelector(id, n.nodes[0], selectorRoot, true /* slotted */);
        let last = n;
        n.nodes[0].each(ss => {
          selector.insertAfter(last, ss);
          last = ss;
        });
        // selector.insertAfter(n, n.nodes[0])
        selector.removeChild(n);
        // since slotted attribute already scopes the selector there's no
        // need for the non-slot attribute.
        shouldInject = false;
        return false;
      }
      // global: replace with inner selector and do not inject [id].
      // ::v-global(.foo) -> .foo
      if (value === ':global' || value === '::v-global') {
        selectorRoot.insertAfter(selector, n.nodes[0]);
        selectorRoot.removeChild(selector);
        return false;
      }
    }
    if (n.type !== 'pseudo' && n.type !== 'combinator') {
      node = n;
    }
  });
  if (node) {
    node.spaces.after = '';
  }
  else {
    // For deep selectors & standalone pseudo selectors,
    // the attribute selectors are prepended rather than appended.
    // So all leading spaces must be eliminated to avoid problems.
    selector.first.spaces.before = '';
  }
  if (shouldInject) {
    const idToAdd = slotted ? id + '-s' : id;
    selector.insertAfter(
      // If node is null it means we need to inject [id] at the start
      // insertAfter can handle `null` here
      node, selectorParser.attribute({
        attribute: idToAdd,
        value: idToAdd,
        raws: {},
        quoteMark: `"`
      }));
  }
}
function isSpaceCombinator(node) {
  return node.type === 'combinator' && /^\s+$/.test(node.value);
}
scopedPlugin.postcss = true;

async function scopeStyle(inputCss, token) {
  const plugins = [
    scopedPlugin(token)
  ];
  const { css } = await postcss_1(plugins).process(inputCss, {
    from: 'src/app.css',
    to: 'dist/app.css',
  });
  return css
}

console.log(scopeStyle('div { color: blue; }', 'foo'));
