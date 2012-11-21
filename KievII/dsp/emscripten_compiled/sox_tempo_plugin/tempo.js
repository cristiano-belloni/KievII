var arguments = [];
// LLVM_STYLE: old

// Capture the output of this into a variable, if you want
//(function(Module, args) {
//  Module = Module || {};
//  args = args || [];

// Runs much faster, for some reason
this['Module'] = {};
var args = arguments;
    // === Auto-generated preamble library stuff ===
  
  //========================================
  // Runtime code shared with compiler
  //========================================
  
  Runtime = {
    stackAlloc: function stackAlloc(size) { var ret = STACKTOP; assert(size > 0); for (var i = 0; i < size; i++) HEAP[STACKTOP+i] = 0; STACKTOP += size;STACKTOP = Math.ceil(STACKTOP/4)*4;; assert(STACKTOP < STACK_ROOT + STACK_MAX); return ret; },
    staticAlloc: function staticAlloc(size) { var ret = STATICTOP; assert(size > 0); for (var i = 0; i < size; i++) HEAP[STATICTOP+i] = 0; STATICTOP += size;STATICTOP = Math.ceil(STATICTOP/4)*4;; return ret; },
    alignMemory: function alignMemory(size,quantum) { var ret = size = Math.ceil(size/(quantum ? quantum : 4))*(quantum ? quantum : 4);; return ret; },
    getFunctionIndex: function getFunctionIndex(func, ident) {
      var key = FUNCTION_TABLE.length;
      FUNCTION_TABLE[key] = func;
      FUNCTION_TABLE[key+1] = null; // Need to have keys be even numbers, see |polymorph| test
      Module[ident] = func; // Export using full name, for Closure Compiler
      return key;
    },
    isNumberType: function (type) {
      return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
    },
    isPointerType: function isPointerType(type) {
    return pointingLevels(type) > 0;
  },
    isStructType: function isStructType(type) {
    if (isPointerType(type)) return false;
    if (new RegExp(/^\[\d+\ x\ (.*)\]/g).test(type)) return true; // [15 x ?] blocks. Like structs
    // See comment in isStructPointerType()
    return !Runtime.isNumberType(type) && type[0] == '%';
  },
    INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
    FLOAT_TYPES: {"float":0,"double":0},
    getNativeFieldSize: function getNativeFieldSize(field, alone) {
    if (4 == 1) return 1;
    var size = {
      'i1': 1,
      'i8': 1,
      'i16': 2,
      'i32': 4,
      'i64': 8,
      'float': 4,
      'double':8
    }[field];
    if (!size) {
      size = 4; // A pointer
    }
    if (!alone) size = Math.max(size, 4);
    return size;
  },
    dedup: function dedup(items, ident) {
    var seen = {};
    if (ident) {
      return items.filter(function(item) {
        if (seen[item[ident]]) return false;
        seen[item[ident]] = true;
        return true;
      });
    } else {
      return items.filter(function(item) {
        if (seen[item]) return false;
        seen[item] = true;
        return true;
      });
    }
  },
    set: function set() {
    if (typeof arguments[0] === 'object') arguments = arguments[0];
    var ret = {};
    for (var i = 0; i < arguments.length; i++) {
      ret[arguments[i]] = 0;
    }
    return ret;
  },
    calculateStructAlignment: function calculateStructAlignment(type, otherTypes) {
      type.flatSize = 0;
      var diffs = [];
      var prev = -1, maxSize = -1;
      type.flatIndexes = type.fields.map(function(field) {
        var size;
        if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
          size = Runtime.getNativeFieldSize(field, true); // pack char; char; in structs, also char[X]s.
          maxSize = Math.max(maxSize, size);
        } else if (Runtime.isStructType(field)) {
          size = otherTypes[field].flatSize;
          maxSize = Math.max(maxSize, 4);
        } else {
          dprint('Unclear type in struct: ' + field + ', in ' + type.name_);
          assert(0);
        }
        var curr = Runtime.alignMemory(type.flatSize, Math.min(4, size)); // if necessary, place this on aligned memory
        type.flatSize = curr + size;
        if (prev >= 0) {
          diffs.push(curr-prev);
        }
        prev = curr;
        return curr;
      });
      type.flatSize = Runtime.alignMemory(type.flatSize, maxSize);
      if (diffs.length == 0) {
        type.flatFactor = type.flatSize;
      } else if (Runtime.dedup(diffs).length == 1) {
        type.flatFactor = diffs[0];
      }
      type.needsFlattening = (type.flatFactor != 1);
      return type.flatIndexes;
    },
    __dummy__: 0
  }
  
  
  
  
  
  
  //========================================
  // Runtime essentials
  //========================================
  
  function __globalConstructor__() {
  }
  
  // Maps ints ==> functions. This lets us pass around ints, which are
  // actually pointers to functions, and we convert at call()time
  var FUNCTION_TABLE = [];
  
  var __THREW__ = false; // Used in checking for thrown exceptions.
  
  var __ATEXIT__ = [];
  
  var ABORT = false;
  
  var undef = 0;
  
  function abort(text) {
    print(text + ':\n' + (new Error).stack);
    ABORT = true;
    throw "Assertion: " + text;
  }
  
  function assert(condition, text) {
    if (!condition) {
      abort('Assertion failed: ' + text);
    }
  }
  
  // Creates a pointer for a certain slab and a certain address in that slab.
  // If just a slab is given, will allocate room for it and copy it there. In
  // other words, do whatever is necessary in order to return a pointer, that
  // points to the slab (and possibly position) we are given.
  
  var ALLOC_NORMAL = 0; // Tries to use _malloc()
  var ALLOC_STACK = 1; // Lives for the duration of the current function call
  var ALLOC_STATIC = 2; // Cannot be freed
  
  function Pointer_make(slab, pos, allocator) {
    pos = pos ? pos : 0;
    assert(pos === 0); // TODO: remove 'pos'
    if (slab === HEAP) return pos;
    var size = slab.length;
  
    var i;
    for (i = 0; i < size; i++) {
      if (slab[i] === undefined) {
        throw 'Invalid element in slab at ' + new Error().stack; // This can be caught, and you can try again to allocate later, see globalFuncs in run()
      }
    }
  
    // Finalize
    var ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc][allocator ? allocator : ALLOC_STATIC](Math.max(size, 1));
  
    for (i = 0; i < size; i++) {
      var curr = slab[i];
  
      if (typeof curr === 'function') {
        curr = Runtime.getFunctionIndex(curr);
      }
  
      HEAP[ret+i] = curr;
    }
  
    return ret;
  }
  Module['Pointer_make'] = Pointer_make;
  
  function Pointer_stringify(ptr) {
    var ret = "";
    var i = 0;
    var t;
    while (1) {
      t = String.fromCharCode(HEAP[ptr+i]);
      if (t == "\0") { break; } else {}
      ret += t;
      i += 1;
    }
    return ret;
  }
  
  // Memory management
  
  var PAGE_SIZE = 4096;
  function alignMemoryPage(x) {
    return Math.ceil(x/PAGE_SIZE)*PAGE_SIZE;
  }
  
  var HEAP, IHEAP, FHEAP;
  var STACK_ROOT, STACKTOP, STACK_MAX;
  var STATICTOP;
  
  // Mangled |new| and |free| (various manglings, for int, long params; new and new[], etc.
  var _malloc, _calloc, _free, __Znwj, __Znaj, __Znam, __Znwm, __ZdlPv, __ZdaPv;
  
  var HAS_TYPED_ARRAYS = false;
  var TOTAL_MEMORY = 50*1024*1024;
  
  function __initializeRuntime__() {
    // If we don't have malloc/free implemented, use a simple implementation.
    Module['_malloc'] = _malloc = __Znwj = __Znaj = __Znam = __Znwm = Module['_malloc'] ? Module['_malloc'] : Runtime.staticAlloc;
    Module['_calloc'] = _calloc                                     = Module['_calloc'] ? Module['_calloc'] : function(n, s) { return _malloc(n*s) };
    Module['_free']   = _free = __ZdlPv = __ZdaPv                   = Module['_free']   ? Module['_free']   : function() { };
  
    {
      // Without this optimization, Chrome is slow. Sadly, the constant here needs to be tweaked depending on the code being run...
      var FAST_MEMORY = TOTAL_MEMORY/32;
      IHEAP = FHEAP = HEAP = new Array(FAST_MEMORY);
      for (var i = 0; i < FAST_MEMORY; i++) {
        IHEAP[i] = FHEAP[i] = 0; // We do *not* use HEAP[i] = 0; here, since this is done just to optimize runtime speed
      }
    }
  
    var base = intArrayFromString('(null)').concat(0); // So printing %s of NULL gives '(null)'
                                                       // Also this ensures we leave 0 as an invalid address, 'NULL'
    for (var i = 0; i < base.length; i++) {
      HEAP[i] = base[i];
    }
  
    Module['HEAP'] = HEAP;
    Module['IHEAP'] = IHEAP;
    Module['FHEAP'] = FHEAP;
  
    STACK_ROOT = STACKTOP = alignMemoryPage(10);
    if (!this['TOTAL_STACK']) TOTAL_STACK = 1024*1024; // Reserved room for stack
    STACK_MAX = STACK_ROOT + TOTAL_STACK;
  
    STATICTOP = alignMemoryPage(STACK_MAX);
  }
  
  function __shutdownRuntime__() {
    while( __ATEXIT__.length > 0) {
      var func = __ATEXIT__.pop();
      if (typeof func === 'number') {
        func = FUNCTION_TABLE[func];
      }
      func();
    }
  }
  
  // stdio.h
  
  
  // Copies a list of num items on the HEAP into a
  // a normal JavaScript array of numbers
  function Array_copy(ptr, num) {
    // TODO: In the SAFE_HEAP case, do some reading here, for debugging purposes - currently this is an 'unnoticed read'.
    return IHEAP.slice(ptr, ptr+num);
  }
  
  function String_len(ptr) {
    var i = 0;
    while (HEAP[ptr+i]) i++; // Note: should be |!= 0|, technically. But this helps catch bugs with undefineds
    return i;
  }
  
  // Copies a C-style string, terminated by a zero, from the HEAP into
  // a normal JavaScript array of numbers
  function String_copy(ptr, addZero) {
    return Array_copy(ptr, String_len(ptr)).concat(addZero ? [0] : []);
  }
  
  // Tools
  
  PRINTBUFFER = '';
  function __print__(text) {
    if (text === null) {
      // Flush
      print(PRINTBUFFER);
      PRINTBUFFER = '';
      return;
    }
    // We print only when we see a '\n', as console JS engines always add
    // one anyhow.
    PRINTBUFFER = PRINTBUFFER + text;
    var endIndex;
    while ((endIndex = PRINTBUFFER.indexOf('\n')) != -1) {
      print(PRINTBUFFER.substr(0, endIndex));
      PRINTBUFFER = PRINTBUFFER.substr(endIndex + 1);
    }
  }
  
  function jrint(label, obj) { // XXX manual debugging
    if (!obj) {
      obj = label;
      label = '';
    } else
      label = label + ' : ';
    print(label + JSON.stringify(obj));
  }
  
  // This processes a 'normal' string into a C-line array of numbers.
  // For LLVM-originating strings, see parser.js:parseLLVMString function
  function intArrayFromString(stringy) {
    var ret = [];
    var t;
    var i = 0;
    while (i < stringy.length) {
      ret.push(stringy.charCodeAt(i));
      i = i + 1;
    }
    ret.push(0);
    return ret;
  }
  Module['intArrayFromString'] = intArrayFromString;
  
  function intArrayToString(array) {
    var ret = '';
    for (var i = 0; i < array.length; i++) {
      ret += String.fromCharCode(array[i]);
    }
    return ret;
  }
  
  // Converts a value we have as signed, into an unsigned value. For
  // example, -1 in int32 would be a very large number as unsigned.
  function unSign(value, bits) {
    if (value >= 0) return value;
    return 2*Math.abs(1 << (bits-1)) + value;
  }
  
  // === Body ===
  
  var $struct_fifo_t___SIZE = 20; // %struct.fifo_t
  
  var $struct_tempo_t___SIZE = 96; // %struct.tempo_t
  var $struct_tempo_t___FLATTENER = [0,4,8,16,20,24,28,32,52,56,76,80,84,88];
  
  _llvm_memmove_p0i8_p0i8_i32 = function (dest, src, num, idunno) {
      // not optimized!
      if (num === 0) return; // will confuse malloc if 0
      var tmp = _malloc(num);
      _memcpy(tmp, src, num);
      _memcpy(dest, tmp, num);
      _free(tmp);
    }
  _realloc = function (ptr, size) {
      // Very simple, inefficient implementation - if you use a real malloc, best to use
      // a real realloc with it
      if (!size) {
        if (ptr) _free(ptr);
        return 0;
      }
      var ret = _malloc(size);
      if (ptr) {
        _memcpy(ret, ptr, size); // might be some invalid reads
        _free(ptr);
      }
      return ret;
    }
  _memcpy = function (dest, src, num, idunno) {
      var curr;
      for (var i = 0; i < num; i++) {
        // TODO: optimize for the typed arrays case
        // || 0, since memcpy sometimes copies uninitialized areas XXX: Investigate why initializing alloc'ed memory does not fix that too
        IHEAP[dest+i] = IHEAP[src+i]; FHEAP[dest+i] = FHEAP[src+i]; ;
      }
    }
  _llvm_memcpy_p0i8_p0i8_i32 = function (dest, src, num, idunno) {
      var curr;
      for (var i = 0; i < num; i++) {
        // TODO: optimize for the typed arrays case
        // || 0, since memcpy sometimes copies uninitialized areas XXX: Investigate why initializing alloc'ed memory does not fix that too
        IHEAP[dest+i] = IHEAP[src+i]; FHEAP[dest+i] = FHEAP[src+i]; ;
      }
    }
  // stub for _free
  // stub for _malloc
  // stub for _calloc
  _ceil = Math.ceil
  _llvm_memset_p0i8_i32 = function (ptr, value, num) {
      for (var i = 0; i < num; i++) {
        HEAP[ptr+i] = value;
      }
    }
  
  
  function _fifo_clear($f) {
    var __stackBase__  = STACKTOP; STACKTOP += 4; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $f_addr = __stackBase__;
        var $_alloca_point_ = 0;
        HEAP[$f_addr] = $f;;
        var $0 = HEAP[$f_addr];
        var $1 = $0+12;
        HEAP[$1] = 0;;
        var $2 = HEAP[$f_addr];
        var $3 = $2+12;
        var $4 = HEAP[$3];
        var $5 = HEAP[$f_addr];
        var $6 = $5+16;
        HEAP[$6] = $4;;
        __label__ = 0; /* $return */ break;
      case 0: // $return
        STACKTOP = __stackBase__;
        return;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _fifo_clear.__index__ = Runtime.getFunctionIndex(_fifo_clear, "_fifo_clear");
  
  
  function _fifo_reserve($f, $n) {
    var __stackBase__  = STACKTOP; STACKTOP += 20; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $f_addr = __stackBase__;
        var $n_addr = __stackBase__+4;
        var $retval = __stackBase__+8;
        var $0 = __stackBase__+12;
        var $p = __stackBase__+16;
        var $_alloca_point_ = 0;
        HEAP[$f_addr] = $f;;
        HEAP[$n_addr] = $n;;
        var $1 = HEAP[$f_addr];
        var $2 = $1+8;
        var $3 = HEAP[$2];
        var $4 = HEAP[$n_addr];
        var $5 = ($3 * $4)&4294967295;
        HEAP[$n_addr] = $5;;
        var $6 = HEAP[$f_addr];
        var $7 = $6+12;
        var $8 = HEAP[$7];
        var $9 = HEAP[$f_addr];
        var $10 = $9+16;
        var $11 = HEAP[$10];
        var $12 = $8 == $11;
        if ($12) { __label__ = 0; /* $bb */ break; } else { __label__ = 1; /* $bb1 */ break; }
      case 0: // $bb
        var $13 = HEAP[$f_addr];
        _fifo_clear($13);
        __label__ = 1; /* $bb1 */ break;
      case 1: // $bb1
        var $14 = HEAP[$f_addr];
        var $15 = $14+16;
        var $16 = HEAP[$15];
        var $17 = HEAP[$n_addr];
        var $18 = ($16 + $17)&4294967295;
        var $19 = HEAP[$f_addr];
        var $20 = $19+4;
        var $21 = HEAP[$20];
        var $22 = unSign($18, 32) <= unSign($21, 32);
        if ($22) { __label__ = 2; /* $bb2 */ break; } else { __label__ = 3; /* $bb3 */ break; }
      case 2: // $bb2
        var $23 = HEAP[$f_addr];
        var $24 = $23;
        var $25 = HEAP[$24];
        var $26 = HEAP[$f_addr];
        var $27 = $26+16;
        var $28 = HEAP[$27];
        var $29 = $25+$28;
        HEAP[$p] = $29;;
        var $30 = HEAP[$f_addr];
        var $31 = $30+16;
        var $32 = HEAP[$31];
        var $33 = HEAP[$n_addr];
        var $34 = ($32 + $33)&4294967295;
        var $35 = HEAP[$f_addr];
        var $36 = $35+16;
        HEAP[$36] = $34;;
        var $37 = HEAP[$p];
        HEAP[$0] = $37;;
        var $38 = HEAP[$0];
        HEAP[$retval] = $38;;
        __label__ = 4; /* $return */ break;
      case 3: // $bb3
        var $39 = HEAP[$f_addr];
        var $40 = $39+12;
        var $41 = HEAP[$40];
        var $42 = unSign($41, 32) > unSign(16384, 32);
        if ($42) { __label__ = 5; /* $bb4 */ break; } else { __label__ = 6; /* $bb5 */ break; }
      case 5: // $bb4
        var $43 = HEAP[$f_addr];
        var $44 = $43+16;
        var $45 = HEAP[$44];
        var $46 = HEAP[$f_addr];
        var $47 = $46+12;
        var $48 = HEAP[$47];
        var $49 = ($45 - $48)&4294967295;
        var $50 = HEAP[$f_addr];
        var $51 = $50;
        var $52 = HEAP[$51];
        var $53 = HEAP[$f_addr];
        var $54 = $53+12;
        var $55 = HEAP[$54];
        var $56 = $52+$55;
        var $57 = HEAP[$f_addr];
        var $58 = $57;
        var $59 = HEAP[$58];
        _llvm_memmove_p0i8_p0i8_i32($59, $56, $49, 1, 0);
        var $60 = HEAP[$f_addr];
        var $61 = $60+16;
        var $62 = HEAP[$61];
        var $63 = HEAP[$f_addr];
        var $64 = $63+12;
        var $65 = HEAP[$64];
        var $66 = ($62 - $65)&4294967295;
        var $67 = HEAP[$f_addr];
        var $68 = $67+16;
        HEAP[$68] = $66;;
        var $69 = HEAP[$f_addr];
        var $70 = $69+12;
        HEAP[$70] = 0;;
        __label__ = 7; /* $bb6 */ break;
      case 6: // $bb5
        var $71 = HEAP[$f_addr];
        var $72 = $71+4;
        var $73 = HEAP[$72];
        var $74 = HEAP[$n_addr];
        var $75 = ($73 + $74)&4294967295;
        var $76 = HEAP[$f_addr];
        var $77 = $76+4;
        HEAP[$77] = $75;;
        var $78 = HEAP[$f_addr];
        var $79 = $78+4;
        var $80 = HEAP[$79];
        var $81 = HEAP[$f_addr];
        var $82 = $81;
        var $83 = HEAP[$82];
        var $84 = _realloc($83, $80);
        var $85 = HEAP[$f_addr];
        var $86 = $85;
        HEAP[$86] = $84;;
        __label__ = 7; /* $bb6 */ break;
      case 7: // $bb6
        __label__ = 1; /* $bb1 */ break;
      case 4: // $return
        var $retval7 = HEAP[$retval];
        STACKTOP = __stackBase__;
        return $retval7;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _fifo_reserve.__index__ = Runtime.getFunctionIndex(_fifo_reserve, "_fifo_reserve");
  
  
  function _fifo_write($f, $n, $data) {
    var __stackBase__  = STACKTOP; STACKTOP += 24; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $f_addr = __stackBase__;
        var $n_addr = __stackBase__+4;
        var $data_addr = __stackBase__+8;
        var $retval = __stackBase__+12;
        var $0 = __stackBase__+16;
        var $s = __stackBase__+20;
        var $_alloca_point_ = 0;
        HEAP[$f_addr] = $f;;
        HEAP[$n_addr] = $n;;
        HEAP[$data_addr] = $data;;
        var $1 = HEAP[$f_addr];
        var $2 = HEAP[$n_addr];
        var $3 = _fifo_reserve($1, $2);
        HEAP[$s] = $3;;
        var $4 = HEAP[$data_addr];
        var $5 = $4 != 0;
        if ($5) { __label__ = 0; /* $bb */ break; } else { __label__ = 1; /* $bb1 */ break; }
      case 0: // $bb
        var $6 = HEAP[$f_addr];
        var $7 = $6+8;
        var $8 = HEAP[$7];
        var $9 = HEAP[$n_addr];
        var $10 = ($8 * $9)&4294967295;
        var $11 = HEAP[$s];
        var $12 = HEAP[$data_addr];
        _llvm_memcpy_p0i8_p0i8_i32($11, $12, $10, 1, 0);
        __label__ = 1; /* $bb1 */ break;
      case 1: // $bb1
        var $13 = HEAP[$s];
        HEAP[$0] = $13;;
        var $14 = HEAP[$0];
        HEAP[$retval] = $14;;
        __label__ = 2; /* $return */ break;
      case 2: // $return
        var $retval2 = HEAP[$retval];
        STACKTOP = __stackBase__;
        return $retval2;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _fifo_write.__index__ = Runtime.getFunctionIndex(_fifo_write, "_fifo_write");
  
  
  function _fifo_trim_to($f, $n) {
    var __stackBase__  = STACKTOP; STACKTOP += 8; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $f_addr = __stackBase__;
        var $n_addr = __stackBase__+4;
        var $_alloca_point_ = 0;
        HEAP[$f_addr] = $f;;
        HEAP[$n_addr] = $n;;
        var $0 = HEAP[$f_addr];
        var $1 = $0+8;
        var $2 = HEAP[$1];
        var $3 = HEAP[$n_addr];
        var $4 = ($2 * $3)&4294967295;
        HEAP[$n_addr] = $4;;
        var $5 = HEAP[$f_addr];
        var $6 = $5+12;
        var $7 = HEAP[$6];
        var $8 = HEAP[$n_addr];
        var $9 = ($7 + $8)&4294967295;
        var $10 = HEAP[$f_addr];
        var $11 = $10+16;
        HEAP[$11] = $9;;
        __label__ = 0; /* $return */ break;
      case 0: // $return
        STACKTOP = __stackBase__;
        return;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _fifo_trim_to.__index__ = Runtime.getFunctionIndex(_fifo_trim_to, "_fifo_trim_to");
  
  
  function _fifo_trim_by($f, $n) {
    var __stackBase__  = STACKTOP; STACKTOP += 8; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $f_addr = __stackBase__;
        var $n_addr = __stackBase__+4;
        var $_alloca_point_ = 0;
        HEAP[$f_addr] = $f;;
        HEAP[$n_addr] = $n;;
        var $0 = HEAP[$f_addr];
        var $1 = $0+8;
        var $2 = HEAP[$1];
        var $3 = HEAP[$n_addr];
        var $4 = ($2 * $3)&4294967295;
        HEAP[$n_addr] = $4;;
        var $5 = HEAP[$f_addr];
        var $6 = $5+16;
        var $7 = HEAP[$6];
        var $8 = HEAP[$n_addr];
        var $9 = ($7 - $8)&4294967295;
        var $10 = HEAP[$f_addr];
        var $11 = $10+16;
        HEAP[$11] = $9;;
        __label__ = 0; /* $return */ break;
      case 0: // $return
        STACKTOP = __stackBase__;
        return;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _fifo_trim_by.__index__ = Runtime.getFunctionIndex(_fifo_trim_by, "_fifo_trim_by");
  
  
  function _fifo_occupancy($f) {
    var __stackBase__  = STACKTOP; STACKTOP += 12; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $f_addr = __stackBase__;
        var $retval = __stackBase__+4;
        var $0 = __stackBase__+8;
        var $_alloca_point_ = 0;
        HEAP[$f_addr] = $f;;
        var $1 = HEAP[$f_addr];
        var $2 = $1+16;
        var $3 = HEAP[$2];
        var $4 = HEAP[$f_addr];
        var $5 = $4+12;
        var $6 = HEAP[$5];
        var $7 = ($3 - $6)&4294967295;
        var $8 = HEAP[$f_addr];
        var $9 = $8+8;
        var $10 = HEAP[$9];
        var $11 = Math.floor(unSign($7, 32) / unSign($10, 32));
        HEAP[$0] = $11;;
        var $12 = HEAP[$0];
        HEAP[$retval] = $12;;
        __label__ = 0; /* $return */ break;
      case 0: // $return
        var $retval1 = HEAP[$retval];
        STACKTOP = __stackBase__;
        return $retval1;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _fifo_occupancy.__index__ = Runtime.getFunctionIndex(_fifo_occupancy, "_fifo_occupancy");
  
  
  function _fifo_read($f, $n, $data) {
    var __stackBase__  = STACKTOP; STACKTOP += 24; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $f_addr = __stackBase__;
        var $n_addr = __stackBase__+4;
        var $data_addr = __stackBase__+8;
        var $retval = __stackBase__+12;
        var $0 = __stackBase__+16;
        var $ret = __stackBase__+20;
        var $_alloca_point_ = 0;
        HEAP[$f_addr] = $f;;
        HEAP[$n_addr] = $n;;
        HEAP[$data_addr] = $data;;
        var $1 = HEAP[$f_addr];
        var $2 = $1;
        var $3 = HEAP[$2];
        var $4 = HEAP[$f_addr];
        var $5 = $4+12;
        var $6 = HEAP[$5];
        var $7 = $3+$6;
        HEAP[$ret] = $7;;
        var $8 = HEAP[$f_addr];
        var $9 = $8+8;
        var $10 = HEAP[$9];
        var $11 = HEAP[$n_addr];
        var $12 = ($10 * $11)&4294967295;
        HEAP[$n_addr] = $12;;
        var $13 = HEAP[$f_addr];
        var $14 = $13+16;
        var $15 = HEAP[$14];
        var $16 = HEAP[$f_addr];
        var $17 = $16+12;
        var $18 = HEAP[$17];
        var $19 = ($15 - $18)&4294967295;
        var $20 = HEAP[$n_addr];
        var $21 = unSign($19, 32) < unSign($20, 32);
        if ($21) { __label__ = 0; /* $bb */ break; } else { __label__ = 1; /* $bb1 */ break; }
      case 0: // $bb
        HEAP[$0] = 0;;
        __label__ = 2; /* $bb4 */ break;
      case 1: // $bb1
        var $22 = HEAP[$data_addr];
        var $23 = $22 != 0;
        if ($23) { __label__ = 3; /* $bb2 */ break; } else { __label__ = 4; /* $bb3 */ break; }
      case 3: // $bb2
        var $24 = HEAP[$data_addr];
        var $25 = HEAP[$ret];
        var $26 = HEAP[$n_addr];
        _llvm_memcpy_p0i8_p0i8_i32($24, $25, $26, 1, 0);
        __label__ = 4; /* $bb3 */ break;
      case 4: // $bb3
        var $27 = HEAP[$f_addr];
        var $28 = $27+12;
        var $29 = HEAP[$28];
        var $30 = HEAP[$n_addr];
        var $31 = ($29 + $30)&4294967295;
        var $32 = HEAP[$f_addr];
        var $33 = $32+12;
        HEAP[$33] = $31;;
        var $34 = HEAP[$ret];
        HEAP[$0] = $34;;
        __label__ = 2; /* $bb4 */ break;
      case 2: // $bb4
        var $35 = HEAP[$0];
        HEAP[$retval] = $35;;
        __label__ = 5; /* $return */ break;
      case 5: // $return
        var $retval5 = HEAP[$retval];
        STACKTOP = __stackBase__;
        return $retval5;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _fifo_read.__index__ = Runtime.getFunctionIndex(_fifo_read, "_fifo_read");
  
  
  function _fifo_delete($f) {
    var __stackBase__  = STACKTOP; STACKTOP += 4; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $f_addr = __stackBase__;
        var $_alloca_point_ = 0;
        HEAP[$f_addr] = $f;;
        var $0 = HEAP[$f_addr];
        var $1 = $0;
        var $2 = HEAP[$1];
        _free($2);
        __label__ = 0; /* $return */ break;
      case 0: // $return
        STACKTOP = __stackBase__;
        return;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _fifo_delete.__index__ = Runtime.getFunctionIndex(_fifo_delete, "_fifo_delete");
  
  
  function _fifo_create($f, $item_size) {
    var __stackBase__  = STACKTOP; STACKTOP += 8; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $f_addr = __stackBase__;
        var $item_size_addr = __stackBase__+4;
        var $_alloca_point_ = 0;
        HEAP[$f_addr] = $f;;
        HEAP[$item_size_addr] = $item_size;;
        var $0 = HEAP[$f_addr];
        var $1 = $0+8;
        var $2 = HEAP[$item_size_addr];
        HEAP[$1] = $2;;
        var $3 = HEAP[$f_addr];
        var $4 = $3+4;
        HEAP[$4] = 16384;;
        var $5 = HEAP[$f_addr];
        var $6 = $5+4;
        var $7 = HEAP[$6];
        var $8 = _malloc($7);
        var $9 = HEAP[$f_addr];
        var $10 = $9;
        HEAP[$10] = $8;;
        var $11 = HEAP[$f_addr];
        _fifo_clear($11);
        __label__ = 0; /* $return */ break;
      case 0: // $return
        STACKTOP = __stackBase__;
        return;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _fifo_create.__index__ = Runtime.getFunctionIndex(_fifo_create, "_fifo_create");
  
  
  function _difference($a, $b, $length) {
    var __stackBase__  = STACKTOP; STACKTOP += 28; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $a_addr = __stackBase__;
        var $b_addr = __stackBase__+4;
        var $length_addr = __stackBase__+8;
        var $retval = __stackBase__+12;
        var $0 = __stackBase__+16;
        var $diff = __stackBase__+20;
        var $i = __stackBase__+24;
        var $_alloca_point_ = 0;
        HEAP[$a_addr] = $a;;
        HEAP[$b_addr] = $b;;
        HEAP[$length_addr] = $length;;
        HEAP[$diff] = 0;;
        HEAP[$i] = 0;;
        __label__ = 0; /* $bb */ break;
      case 0: // $bb
        var $1 = HEAP[$a_addr];
        var $2 = HEAP[$i];
        var $3 = $1+4*$2;
        var $4 = HEAP[$3];
        var $5 = HEAP[$b_addr];
        var $6 = HEAP[$i];
        var $7 = $5+4*$6;
        var $8 = HEAP[$7];
        var $9 = $4 - $8;
        var $10 = HEAP[$a_addr];
        var $11 = HEAP[$i];
        var $12 = $10+4*$11;
        var $13 = HEAP[$12];
        var $14 = HEAP[$b_addr];
        var $15 = HEAP[$i];
        var $16 = $14+4*$15;
        var $17 = HEAP[$16];
        var $18 = $13 - $17;
        var $19 = $9 * $18;
        var $20 = HEAP[$diff];
        var $21 = $19 + $20;
        HEAP[$diff] = $21;;
        var $22 = HEAP[$i];
        var $23 = ($22 + 1)&4294967295;
        HEAP[$i] = $23;;
        var $24 = HEAP[$a_addr];
        var $25 = HEAP[$i];
        var $26 = $24+4*$25;
        var $27 = HEAP[$26];
        var $28 = HEAP[$b_addr];
        var $29 = HEAP[$i];
        var $30 = $28+4*$29;
        var $31 = HEAP[$30];
        var $32 = $27 - $31;
        var $33 = HEAP[$a_addr];
        var $34 = HEAP[$i];
        var $35 = $33+4*$34;
        var $36 = HEAP[$35];
        var $37 = HEAP[$b_addr];
        var $38 = HEAP[$i];
        var $39 = $37+4*$38;
        var $40 = HEAP[$39];
        var $41 = $36 - $40;
        var $42 = $32 * $41;
        var $43 = HEAP[$diff];
        var $44 = $42 + $43;
        HEAP[$diff] = $44;;
        var $45 = HEAP[$i];
        var $46 = ($45 + 1)&4294967295;
        HEAP[$i] = $46;;
        var $47 = HEAP[$a_addr];
        var $48 = HEAP[$i];
        var $49 = $47+4*$48;
        var $50 = HEAP[$49];
        var $51 = HEAP[$b_addr];
        var $52 = HEAP[$i];
        var $53 = $51+4*$52;
        var $54 = HEAP[$53];
        var $55 = $50 - $54;
        var $56 = HEAP[$a_addr];
        var $57 = HEAP[$i];
        var $58 = $56+4*$57;
        var $59 = HEAP[$58];
        var $60 = HEAP[$b_addr];
        var $61 = HEAP[$i];
        var $62 = $60+4*$61;
        var $63 = HEAP[$62];
        var $64 = $59 - $63;
        var $65 = $55 * $64;
        var $66 = HEAP[$diff];
        var $67 = $65 + $66;
        HEAP[$diff] = $67;;
        var $68 = HEAP[$i];
        var $69 = ($68 + 1)&4294967295;
        HEAP[$i] = $69;;
        var $70 = HEAP[$a_addr];
        var $71 = HEAP[$i];
        var $72 = $70+4*$71;
        var $73 = HEAP[$72];
        var $74 = HEAP[$b_addr];
        var $75 = HEAP[$i];
        var $76 = $74+4*$75;
        var $77 = HEAP[$76];
        var $78 = $73 - $77;
        var $79 = HEAP[$a_addr];
        var $80 = HEAP[$i];
        var $81 = $79+4*$80;
        var $82 = HEAP[$81];
        var $83 = HEAP[$b_addr];
        var $84 = HEAP[$i];
        var $85 = $83+4*$84;
        var $86 = HEAP[$85];
        var $87 = $82 - $86;
        var $88 = $78 * $87;
        var $89 = HEAP[$diff];
        var $90 = $88 + $89;
        HEAP[$diff] = $90;;
        var $91 = HEAP[$i];
        var $92 = ($91 + 1)&4294967295;
        HEAP[$i] = $92;;
        var $93 = HEAP[$a_addr];
        var $94 = HEAP[$i];
        var $95 = $93+4*$94;
        var $96 = HEAP[$95];
        var $97 = HEAP[$b_addr];
        var $98 = HEAP[$i];
        var $99 = $97+4*$98;
        var $100 = HEAP[$99];
        var $101 = $96 - $100;
        var $102 = HEAP[$a_addr];
        var $103 = HEAP[$i];
        var $104 = $102+4*$103;
        var $105 = HEAP[$104];
        var $106 = HEAP[$b_addr];
        var $107 = HEAP[$i];
        var $108 = $106+4*$107;
        var $109 = HEAP[$108];
        var $110 = $105 - $109;
        var $111 = $101 * $110;
        var $112 = HEAP[$diff];
        var $113 = $111 + $112;
        HEAP[$diff] = $113;;
        var $114 = HEAP[$i];
        var $115 = ($114 + 1)&4294967295;
        HEAP[$i] = $115;;
        var $116 = HEAP[$a_addr];
        var $117 = HEAP[$i];
        var $118 = $116+4*$117;
        var $119 = HEAP[$118];
        var $120 = HEAP[$b_addr];
        var $121 = HEAP[$i];
        var $122 = $120+4*$121;
        var $123 = HEAP[$122];
        var $124 = $119 - $123;
        var $125 = HEAP[$a_addr];
        var $126 = HEAP[$i];
        var $127 = $125+4*$126;
        var $128 = HEAP[$127];
        var $129 = HEAP[$b_addr];
        var $130 = HEAP[$i];
        var $131 = $129+4*$130;
        var $132 = HEAP[$131];
        var $133 = $128 - $132;
        var $134 = $124 * $133;
        var $135 = HEAP[$diff];
        var $136 = $134 + $135;
        HEAP[$diff] = $136;;
        var $137 = HEAP[$i];
        var $138 = ($137 + 1)&4294967295;
        HEAP[$i] = $138;;
        var $139 = HEAP[$a_addr];
        var $140 = HEAP[$i];
        var $141 = $139+4*$140;
        var $142 = HEAP[$141];
        var $143 = HEAP[$b_addr];
        var $144 = HEAP[$i];
        var $145 = $143+4*$144;
        var $146 = HEAP[$145];
        var $147 = $142 - $146;
        var $148 = HEAP[$a_addr];
        var $149 = HEAP[$i];
        var $150 = $148+4*$149;
        var $151 = HEAP[$150];
        var $152 = HEAP[$b_addr];
        var $153 = HEAP[$i];
        var $154 = $152+4*$153;
        var $155 = HEAP[$154];
        var $156 = $151 - $155;
        var $157 = $147 * $156;
        var $158 = HEAP[$diff];
        var $159 = $157 + $158;
        HEAP[$diff] = $159;;
        var $160 = HEAP[$i];
        var $161 = ($160 + 1)&4294967295;
        HEAP[$i] = $161;;
        var $162 = HEAP[$a_addr];
        var $163 = HEAP[$i];
        var $164 = $162+4*$163;
        var $165 = HEAP[$164];
        var $166 = HEAP[$b_addr];
        var $167 = HEAP[$i];
        var $168 = $166+4*$167;
        var $169 = HEAP[$168];
        var $170 = $165 - $169;
        var $171 = HEAP[$a_addr];
        var $172 = HEAP[$i];
        var $173 = $171+4*$172;
        var $174 = HEAP[$173];
        var $175 = HEAP[$b_addr];
        var $176 = HEAP[$i];
        var $177 = $175+4*$176;
        var $178 = HEAP[$177];
        var $179 = $174 - $178;
        var $180 = $170 * $179;
        var $181 = HEAP[$diff];
        var $182 = $180 + $181;
        HEAP[$diff] = $182;;
        var $183 = HEAP[$i];
        var $184 = ($183 + 1)&4294967295;
        HEAP[$i] = $184;;
        var $185 = HEAP[$i];
        var $186 = HEAP[$length_addr];
        var $187 = unSign($185, 32) < unSign($186, 32);
        if ($187) { __label__ = 0; /* $bb */ break; } else { __label__ = 1; /* $bb1 */ break; }
      case 1: // $bb1
        var $188 = HEAP[$diff];
        HEAP[$0] = $188;;
        var $189 = HEAP[$0];
        HEAP[$retval] = $189;;
        __label__ = 2; /* $return */ break;
      case 2: // $return
        var $retval2 = HEAP[$retval];
        STACKTOP = __stackBase__;
        return $retval2;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _difference.__index__ = Runtime.getFunctionIndex(_difference, "_difference");
  
  
  function _tempo_best_overlap_position($t, $new_win) {
    var __stackBase__  = STACKTOP; STACKTOP += 56; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $t_addr = __stackBase__;
        var $new_win_addr = __stackBase__+4;
        var $retval = __stackBase__+8;
        var $0 = __stackBase__+12;
        var $iftmp_0 = __stackBase__+16;
        var $f = __stackBase__+20;
        var $j = __stackBase__+24;
        var $best_pos = __stackBase__+28;
        var $prev_best_pos = __stackBase__+32;
        var $step = __stackBase__+36;
        var $i = __stackBase__+40;
        var $diff = __stackBase__+44;
        var $least_diff = __stackBase__+48;
        var $k = __stackBase__+52;
        var $_alloca_point_ = 0;
        HEAP[$t_addr] = $t;;
        HEAP[$new_win_addr] = $new_win;;
        var $1 = HEAP[$t_addr];
        var $2 = $1+52;
        var $3 = HEAP[$2];
        HEAP[$f] = $3;;
        var $4 = HEAP[$t_addr];
        var $5 = $4+16;
        var $6 = HEAP[$5];
        var $7 = ($6 + 1)&4294967295;
        var $8 = $7 >>> 1;
        HEAP[$prev_best_pos] = $8;;
        HEAP[$step] = 64;;
        var $9 = HEAP[$t_addr];
        var $10 = $9+4;
        var $11 = HEAP[$10];
        var $12 = $11 != 0;
        if ($12) { __label__ = 0; /* $bb */ break; } else { __label__ = 1; /* $bb1 */ break; }
      case 0: // $bb
        var $13 = HEAP[$prev_best_pos];
        HEAP[$iftmp_0] = $13;;
        __label__ = 2; /* $bb2 */ break;
      case 1: // $bb1
        HEAP[$iftmp_0] = 0;;
        __label__ = 2; /* $bb2 */ break;
      case 2: // $bb2
        var $14 = HEAP[$iftmp_0];
        HEAP[$best_pos] = $14;;
        var $15 = HEAP[$best_pos];
        HEAP[$i] = $15;;
        var $16 = HEAP[$t_addr];
        var $17 = $16;
        var $18 = HEAP[$17];
        var $19 = HEAP[$t_addr];
        var $20 = $19+24;
        var $21 = HEAP[$20];
        var $22 = ($18 * $21)&4294967295;
        var $23 = HEAP[$t_addr];
        var $24 = $23;
        var $25 = HEAP[$24];
        var $26 = HEAP[$i];
        var $27 = ($25 * $26)&4294967295;
        var $28 = HEAP[$new_win_addr];
        var $29 = $28+4*$27;
        var $30 = HEAP[$f];
        var $31 = _difference($29, $30, $22);
        HEAP[$least_diff] = $31;;
        HEAP[$k] = 0;;
        var $32 = HEAP[$t_addr];
        var $33 = $32+4;
        var $34 = HEAP[$33];
        var $35 = $34 != 0;
        if ($35) { __label__ = 3; /* $bb3 */ break; } else { __label__ = 4; /* $bb16 */ break; }
      case 3: // $bb3
        HEAP[$k] = -1;;
        __label__ = 5; /* $bb13 */ break;
      case 14: // $bb4
        HEAP[$j] = 1;;
        __label__ = 6; /* $bb10 */ break;
      case 12: // $bb5
        var $36 = HEAP[$k];
        var $37 = HEAP[$j];
        var $38 = ($36 * $37)&4294967295;
        var $39 = HEAP[$step];
        var $40 = ($38 * $39)&4294967295;
        var $41 = HEAP[$prev_best_pos];
        var $42 = ($40 + $41)&4294967295;
        HEAP[$i] = $42;;
        var $43 = HEAP[$i];
        var $44 = $43 < 0;
        if ($44) { __label__ = 7; /* $bb12 */ break; } else { __label__ = 8; /* $bb6 */ break; }
      case 8: // $bb6
        var $45 = HEAP[$t_addr];
        var $46 = $45+16;
        var $47 = HEAP[$46];
        var $48 = HEAP[$i];
        var $49 = unSign($47, 32) <= unSign($48, 32);
        if ($49) { __label__ = 7; /* $bb12 */ break; } else { __label__ = 9; /* $bb7 */ break; }
      case 9: // $bb7
        var $50 = HEAP[$t_addr];
        var $51 = $50;
        var $52 = HEAP[$51];
        var $53 = HEAP[$t_addr];
        var $54 = $53+24;
        var $55 = HEAP[$54];
        var $56 = ($52 * $55)&4294967295;
        var $57 = HEAP[$t_addr];
        var $58 = $57;
        var $59 = HEAP[$58];
        var $60 = HEAP[$i];
        var $61 = ($59 * $60)&4294967295;
        var $62 = HEAP[$new_win_addr];
        var $63 = $62+4*$61;
        var $64 = HEAP[$f];
        var $65 = _difference($63, $64, $56);
        HEAP[$diff] = $65;;
        var $66 = HEAP[$diff];
        var $67 = HEAP[$least_diff];
        var $68 = $66 < $67;
        if ($68) { __label__ = 10; /* $bb8 */ break; } else { __label__ = 11; /* $bb9 */ break; }
      case 10: // $bb8
        var $69 = HEAP[$diff];
        HEAP[$least_diff] = $69;;
        var $70 = HEAP[$i];
        HEAP[$best_pos] = $70;;
        __label__ = 11; /* $bb9 */ break;
      case 11: // $bb9
        var $71 = HEAP[$j];
        var $72 = ($71 + 1)&4294967295;
        HEAP[$j] = $72;;
        __label__ = 6; /* $bb10 */ break;
      case 6: // $bb10
        var $73 = HEAP[$j];
        var $74 = unSign($73, 32) <= unSign(3, 32);
        if ($74) { __label__ = 12; /* $bb5 */ break; } else { __label__ = 13; /* $bb11 */ break; }
      case 13: // $bb11
        var $75 = HEAP[$step];
        var $76 = $75 == 64;
        if ($76) { __label__ = 12; /* $bb5 */ break; } else { __label__ = 7; /* $bb12 */ break; }
      case 7: // $bb12
        var $77 = HEAP[$k];
        var $78 = ($77 + 2)&4294967295;
        HEAP[$k] = $78;;
        __label__ = 5; /* $bb13 */ break;
      case 5: // $bb13
        var $79 = HEAP[$k];
        var $80 = $79 <= 1;
        if ($80) { __label__ = 14; /* $bb4 */ break; } else { __label__ = 15; /* $bb14 */ break; }
      case 15: // $bb14
        var $81 = HEAP[$best_pos];
        HEAP[$prev_best_pos] = $81;;
        var $82 = HEAP[$step];
        var $83 = $82 >>> 2;
        HEAP[$step] = $83;;
        var $84 = HEAP[$step];
        var $85 = $84 != 0;
        if ($85) { __label__ = 3; /* $bb3 */ break; } else { __label__ = 16; /* $bb15 */ break; }
      case 16: // $bb15
        __label__ = 17; /* $bb21 */ break;
      case 4: // $bb16
        HEAP[$i] = 1;;
        __label__ = 18; /* $bb20 */ break;
      case 21: // $bb17
        var $86 = HEAP[$t_addr];
        var $87 = $86;
        var $88 = HEAP[$87];
        var $89 = HEAP[$t_addr];
        var $90 = $89+24;
        var $91 = HEAP[$90];
        var $92 = ($88 * $91)&4294967295;
        var $93 = HEAP[$t_addr];
        var $94 = $93;
        var $95 = HEAP[$94];
        var $96 = HEAP[$i];
        var $97 = ($95 * $96)&4294967295;
        var $98 = HEAP[$new_win_addr];
        var $99 = $98+4*$97;
        var $100 = HEAP[$f];
        var $101 = _difference($99, $100, $92);
        HEAP[$diff] = $101;;
        var $102 = HEAP[$diff];
        var $103 = HEAP[$least_diff];
        var $104 = $102 < $103;
        if ($104) { __label__ = 19; /* $bb18 */ break; } else { __label__ = 20; /* $bb19 */ break; }
      case 19: // $bb18
        var $105 = HEAP[$diff];
        HEAP[$least_diff] = $105;;
        var $106 = HEAP[$i];
        HEAP[$best_pos] = $106;;
        __label__ = 20; /* $bb19 */ break;
      case 20: // $bb19
        var $107 = HEAP[$i];
        var $108 = ($107 + 1)&4294967295;
        HEAP[$i] = $108;;
        __label__ = 18; /* $bb20 */ break;
      case 18: // $bb20
        var $109 = HEAP[$t_addr];
        var $110 = $109+16;
        var $111 = HEAP[$110];
        var $112 = HEAP[$i];
        var $113 = unSign($111, 32) > unSign($112, 32);
        if ($113) { __label__ = 21; /* $bb17 */ break; } else { __label__ = 17; /* $bb21 */ break; }
      case 17: // $bb21
        var $114 = HEAP[$best_pos];
        HEAP[$0] = $114;;
        var $115 = HEAP[$0];
        HEAP[$retval] = $115;;
        __label__ = 22; /* $return */ break;
      case 22: // $return
        var $retval22 = HEAP[$retval];
        STACKTOP = __stackBase__;
        return $retval22;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _tempo_best_overlap_position.__index__ = Runtime.getFunctionIndex(_tempo_best_overlap_position, "_tempo_best_overlap_position");
  
  
  function _tempo_overlap($t, $in1, $in2, $output) {
    var __stackBase__  = STACKTOP; STACKTOP += 40; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $t_addr = __stackBase__;
        var $in1_addr = __stackBase__+4;
        var $in2_addr = __stackBase__+8;
        var $output_addr = __stackBase__+12;
        var $i = __stackBase__+16;
        var $j = __stackBase__+20;
        var $k = __stackBase__+24;
        var $fade_step = __stackBase__+28;
        var $fade_in = __stackBase__+32;
        var $fade_out = __stackBase__+36;
        var $_alloca_point_ = 0;
        HEAP[$t_addr] = $t;;
        HEAP[$in1_addr] = $in1;;
        HEAP[$in2_addr] = $in2;;
        HEAP[$output_addr] = $output;;
        HEAP[$k] = 0;;
        var $0 = HEAP[$t_addr];
        var $1 = $0+24;
        var $2 = HEAP[$1];
        var $3 = unSign($2, 32);
        var $4 = 1 / $3;
        HEAP[$fade_step] = $4;;
        HEAP[$i] = 0;;
        __label__ = 0; /* $bb4 */ break;
      case 4: // $bb
        var $5 = HEAP[$i];
        var $6 = unSign($5, 32);
        var $7 = HEAP[$fade_step];
        var $8 = $6 * $7;
        HEAP[$fade_in] = $8;;
        var $9 = HEAP[$fade_in];
        var $10 = 1 - $9;
        HEAP[$fade_out] = $10;;
        HEAP[$j] = 0;;
        __label__ = 1; /* $bb2 */ break;
      case 2: // $bb1
        var $11 = HEAP[$in1_addr];
        var $12 = HEAP[$k];
        var $13 = $11+4*$12;
        var $14 = HEAP[$13];
        var $15 = HEAP[$fade_out];
        var $16 = $14 * $15;
        var $17 = HEAP[$in2_addr];
        var $18 = HEAP[$k];
        var $19 = $17+4*$18;
        var $20 = HEAP[$19];
        var $21 = HEAP[$fade_in];
        var $22 = $20 * $21;
        var $23 = $16 + $22;
        var $24 = HEAP[$output_addr];
        var $25 = HEAP[$k];
        var $26 = $24+4*$25;
        HEAP[$26] = $23;;
        var $27 = HEAP[$j];
        var $28 = ($27 + 1)&4294967295;
        HEAP[$j] = $28;;
        var $29 = HEAP[$k];
        var $30 = ($29 + 1)&4294967295;
        HEAP[$k] = $30;;
        __label__ = 1; /* $bb2 */ break;
      case 1: // $bb2
        var $31 = HEAP[$t_addr];
        var $32 = $31;
        var $33 = HEAP[$32];
        var $34 = HEAP[$j];
        var $35 = unSign($33, 32) > unSign($34, 32);
        if ($35) { __label__ = 2; /* $bb1 */ break; } else { __label__ = 3; /* $bb3 */ break; }
      case 3: // $bb3
        var $36 = HEAP[$i];
        var $37 = ($36 + 1)&4294967295;
        HEAP[$i] = $37;;
        __label__ = 0; /* $bb4 */ break;
      case 0: // $bb4
        var $38 = HEAP[$t_addr];
        var $39 = $38+24;
        var $40 = HEAP[$39];
        var $41 = HEAP[$i];
        var $42 = unSign($40, 32) > unSign($41, 32);
        if ($42) { __label__ = 4; /* $bb */ break; } else { __label__ = 5; /* $bb5 */ break; }
      case 5: // $bb5
        __label__ = 6; /* $return */ break;
      case 6: // $return
        STACKTOP = __stackBase__;
        return;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _tempo_overlap.__index__ = Runtime.getFunctionIndex(_tempo_overlap, "_tempo_overlap");
  
  
  function _tempo_process($t) {
    var __stackBase__  = STACKTOP; STACKTOP += 12; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $t_addr = __stackBase__;
        var $skip = __stackBase__+4;
        var $offset = __stackBase__+8;
        var $_alloca_point_ = 0;
        HEAP[$t_addr] = $t;;
        __label__ = 0; /* $bb4 */ break;
      case 4: // $bb
        var $0 = HEAP[$t_addr];
        var $1 = $0+84;
        var $2 = HEAP[$1];
        var $3 = $2 == 0;
        if ($3) { __label__ = 1; /* $bb1 */ break; } else { __label__ = 2; /* $bb2 */ break; }
      case 1: // $bb1
        var $4 = HEAP[$t_addr];
        var $5 = $4+16;
        var $6 = HEAP[$5];
        var $7 = Math.floor(unSign($6, 32) / unSign(2, 32));
        HEAP[$offset] = $7;;
        var $8 = HEAP[$t_addr];
        var $9 = $8+32;
        var $10 = _fifo_read($9, 0, 0);
        var $11 = $10;
        var $12 = HEAP[$t_addr];
        var $13 = $12;
        var $14 = HEAP[$13];
        var $15 = HEAP[$offset];
        var $16 = ($14 * $15)&4294967295;
        var $17 = $11+4*$16;
        var $18 = HEAP[$t_addr];
        var $19 = $18+24;
        var $20 = HEAP[$19];
        var $21 = HEAP[$t_addr];
        var $22 = $21+56;
        var $23 = $17;
        var $24 = _fifo_write($22, $20, $23);
        __label__ = 3; /* $bb3 */ break;
      case 2: // $bb2
        var $25 = HEAP[$t_addr];
        var $26 = $25+32;
        var $27 = _fifo_read($26, 0, 0);
        var $28 = $27;
        var $29 = HEAP[$t_addr];
        var $30 = _tempo_best_overlap_position($29, $28);
        HEAP[$offset] = $30;;
        var $31 = HEAP[$t_addr];
        var $32 = $31+24;
        var $33 = HEAP[$32];
        var $34 = HEAP[$t_addr];
        var $35 = $34+56;
        var $36 = _fifo_write($35, $33, 0);
        var $37 = $36;
        var $38 = HEAP[$t_addr];
        var $39 = $38+32;
        var $40 = _fifo_read($39, 0, 0);
        var $41 = $40;
        var $42 = HEAP[$t_addr];
        var $43 = $42;
        var $44 = HEAP[$43];
        var $45 = HEAP[$offset];
        var $46 = ($44 * $45)&4294967295;
        var $47 = $41+4*$46;
        var $48 = HEAP[$t_addr];
        var $49 = $48+52;
        var $50 = HEAP[$49];
        var $51 = HEAP[$t_addr];
        _tempo_overlap($51, $50, $47, $37);
        __label__ = 3; /* $bb3 */ break;
      case 3: // $bb3
        var $52 = HEAP[$t_addr];
        var $53 = $52+32;
        var $54 = _fifo_read($53, 0, 0);
        var $55 = $54;
        var $56 = HEAP[$t_addr];
        var $57 = $56;
        var $58 = HEAP[$57];
        var $59 = HEAP[$t_addr];
        var $60 = $59+24;
        var $61 = HEAP[$60];
        var $62 = HEAP[$offset];
        var $63 = ($61 + $62)&4294967295;
        var $64 = ($58 * $63)&4294967295;
        var $65 = $55+4*$64;
        var $66 = HEAP[$t_addr];
        var $67 = $66+20;
        var $68 = HEAP[$67];
        var $69 = HEAP[$t_addr];
        var $70 = $69+24;
        var $71 = HEAP[$70];
        var $72 = ($71 * 2)&4294967295;
        var $73 = ($68 - $72)&4294967295;
        var $74 = HEAP[$t_addr];
        var $75 = $74+56;
        var $76 = $65;
        var $77 = _fifo_write($75, $73, $76);
        var $78 = HEAP[$t_addr];
        var $79 = $78;
        var $80 = HEAP[$79];
        var $81 = HEAP[$t_addr];
        var $82 = $81+24;
        var $83 = HEAP[$82];
        var $84 = ($80 * $83)&4294967295;
        var $85 = ($84 * 4)&4294967295;
        var $86 = HEAP[$t_addr];
        var $87 = $86+32;
        var $88 = _fifo_read($87, 0, 0);
        var $89 = $88;
        var $90 = HEAP[$t_addr];
        var $91 = $90;
        var $92 = HEAP[$91];
        var $93 = HEAP[$t_addr];
        var $94 = $93+20;
        var $95 = HEAP[$94];
        var $96 = HEAP[$offset];
        var $97 = ($95 + $96)&4294967295;
        var $98 = HEAP[$t_addr];
        var $99 = $98+24;
        var $100 = HEAP[$99];
        var $101 = ($97 - $100)&4294967295;
        var $102 = ($92 * $101)&4294967295;
        var $103 = $89+4*$102;
        var $104 = HEAP[$t_addr];
        var $105 = $104+52;
        var $106 = HEAP[$105];
        var $107 = $106;
        var $108 = $103;
        _llvm_memcpy_p0i8_p0i8_i32($107, $108, $85, 1, 0);
        var $109 = HEAP[$t_addr];
        var $110 = $109+8;
        var $111 = HEAP[$110];
        var $112 = HEAP[$t_addr];
        var $113 = $112+84;
        var $114 = HEAP[$113];
        var $115 = ($114 + 1)&4294967295;
        var $116 = HEAP[$t_addr];
        var $117 = $116+84;
        HEAP[$117] = $115;;
        var $118 = HEAP[$t_addr];
        var $119 = $118+84;
        var $120 = HEAP[$119];
        var $121 = HEAP[$t_addr];
        var $122 = $121+20;
        var $123 = HEAP[$122];
        var $124 = HEAP[$t_addr];
        var $125 = $124+24;
        var $126 = HEAP[$125];
        var $127 = ($123 - $126)&4294967295;
        var $128 = ($120 * $127)&4294967295;
        var $129 = unSign($128, 32);
        var $130 = $111 * $129;
        var $131 = $130 + 0.5;
        var $132 = Math.floor($131);
        HEAP[$skip] = $132;;
        var $133 = HEAP[$t_addr];
        var $134 = $133+88;
        var $135 = HEAP[$134];
        var $136 = HEAP[$t_addr];
        var $137 = $136+88;
        var $138 = HEAP[$137];
        var $139 = HEAP[$skip];
        var $140 = ($139 - $138)&4294967295;
        HEAP[$skip] = $140;;
        var $141 = HEAP[$skip];
        var $142 = ($135 + $141)&4294967295;
        var $143 = HEAP[$t_addr];
        var $144 = $143+88;
        HEAP[$144] = $142;;
        var $145 = HEAP[$t_addr];
        var $146 = $145+32;
        var $147 = HEAP[$skip];
        var $148 = _fifo_read($146, $147, 0);
        __label__ = 0; /* $bb4 */ break;
      case 0: // $bb4
        var $149 = HEAP[$t_addr];
        var $150 = $149+32;
        var $151 = _fifo_occupancy($150);
        var $152 = HEAP[$t_addr];
        var $153 = $152+28;
        var $154 = HEAP[$153];
        var $155 = unSign($151, 32) >= unSign($154, 32);
        if ($155) { __label__ = 4; /* $bb */ break; } else { __label__ = 5; /* $bb5 */ break; }
      case 5: // $bb5
        __label__ = 6; /* $return */ break;
      case 6: // $return
        STACKTOP = __stackBase__;
        return;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _tempo_process.__index__ = Runtime.getFunctionIndex(_tempo_process, "_tempo_process");
  
  
  function _tempo_input($t, $samples, $n) {
    var __stackBase__  = STACKTOP; STACKTOP += 20; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $t_addr = __stackBase__;
        var $samples_addr = __stackBase__+4;
        var $n_addr = __stackBase__+8;
        var $retval = __stackBase__+12;
        var $0 = __stackBase__+16;
        var $_alloca_point_ = 0;
        HEAP[$t_addr] = $t;;
        HEAP[$samples_addr] = $samples;;
        HEAP[$n_addr] = $n;;
        var $1 = HEAP[$t_addr];
        var $2 = $1+76;
        var $3 = HEAP[$2];
        var $4 = HEAP[$n_addr];
        var $5 = ($3 + $4)&4294967295;
        var $6 = HEAP[$t_addr];
        var $7 = $6+76;
        HEAP[$7] = $5;;
        var $8 = HEAP[$t_addr];
        var $9 = $8+32;
        var $10 = HEAP[$n_addr];
        var $11 = HEAP[$samples_addr];
        var $12 = $11;
        var $13 = _fifo_write($9, $10, $12);
        var $14 = $13;
        HEAP[$0] = $14;;
        var $15 = HEAP[$0];
        HEAP[$retval] = $15;;
        __label__ = 0; /* $return */ break;
      case 0: // $return
        var $retval1 = HEAP[$retval];
        STACKTOP = __stackBase__;
        return $retval1;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _tempo_input.__index__ = Runtime.getFunctionIndex(_tempo_input, "_tempo_input");
  
  
  function _tempo_output($t, $samples, $n) {
    var __stackBase__  = STACKTOP; STACKTOP += 24; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $t_addr = __stackBase__;
        var $samples_addr = __stackBase__+4;
        var $n_addr = __stackBase__+8;
        var $retval = __stackBase__+12;
        var $0 = __stackBase__+16;
        var $iftmp_3 = __stackBase__+20;
        var $_alloca_point_ = 0;
        HEAP[$t_addr] = $t;;
        HEAP[$samples_addr] = $samples;;
        HEAP[$n_addr] = $n;;
        var $1 = HEAP[$t_addr];
        var $2 = $1+80;
        var $3 = HEAP[$2];
        var $4 = HEAP[$n_addr];
        var $5 = HEAP[$4];
        var $6 = HEAP[$t_addr];
        var $7 = $6+56;
        var $8 = _fifo_occupancy($7);
        var $9 = unSign($5, 32) <= unSign($8, 32);
        if ($9) { __label__ = 0; /* $bb */ break; } else { __label__ = 1; /* $bb1 */ break; }
      case 0: // $bb
        var $10 = HEAP[$n_addr];
        var $11 = HEAP[$10];
        HEAP[$iftmp_3] = $11;;
        __label__ = 2; /* $bb2 */ break;
      case 1: // $bb1
        var $12 = HEAP[$t_addr];
        var $13 = $12+56;
        var $14 = _fifo_occupancy($13);
        HEAP[$iftmp_3] = $14;;
        __label__ = 2; /* $bb2 */ break;
      case 2: // $bb2
        var $15 = HEAP[$n_addr];
        var $16 = HEAP[$iftmp_3];
        HEAP[$15] = $16;;
        var $17 = HEAP[$n_addr];
        var $18 = HEAP[$17];
        var $19 = ($3 + $18)&4294967295;
        var $20 = HEAP[$t_addr];
        var $21 = $20+80;
        HEAP[$21] = $19;;
        var $22 = HEAP[$n_addr];
        var $23 = HEAP[$22];
        var $24 = HEAP[$t_addr];
        var $25 = $24+56;
        var $26 = HEAP[$samples_addr];
        var $27 = $26;
        var $28 = _fifo_read($25, $23, $27);
        var $29 = $28;
        HEAP[$0] = $29;;
        var $30 = HEAP[$0];
        HEAP[$retval] = $30;;
        __label__ = 3; /* $return */ break;
      case 3: // $return
        var $retval3 = HEAP[$retval];
        STACKTOP = __stackBase__;
        return $retval3;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _tempo_output.__index__ = Runtime.getFunctionIndex(_tempo_output, "_tempo_output");
  
  
  function _tempo_flush($t) {
    var __stackBase__  = STACKTOP; STACKTOP += 16; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $t_addr = __stackBase__;
        var $samples_out = __stackBase__+4;
        var $remaining = __stackBase__+8;
        var $buff = __stackBase__+12;
        var $_alloca_point_ = 0;
        HEAP[$t_addr] = $t;;
        var $0 = HEAP[$t_addr];
        var $1 = $0+76;
        var $2 = HEAP[$1];
        var $3 = unSign($2, 32);
        var $4 = HEAP[$t_addr];
        var $5 = $4+8;
        var $6 = HEAP[$5];
        var $7 = $3 / $6;
        var $8 = $7 + 0.5;
        var $9 = Math.floor($8);
        HEAP[$samples_out] = $9;;
        var $10 = HEAP[$t_addr];
        var $11 = $10+80;
        var $12 = HEAP[$11];
        var $13 = HEAP[$samples_out];
        var $14 = ($13 - $12)&4294967295;
        HEAP[$remaining] = $14;;
        var $15 = HEAP[$t_addr];
        var $16 = $15;
        var $17 = HEAP[$16];
        var $18 = ($17 * 128)&4294967295;
        var $19 = _calloc($18, 4);
        var $20 = $19;
        HEAP[$buff] = $20;;
        var $21 = HEAP[$remaining];
        var $22 = $21 > 0;
        if ($22) { __label__ = 0; /* $bb */ break; } else { __label__ = 1; /* $bb4 */ break; }
      case 0: // $bb
        __label__ = 2; /* $bb2 */ break;
      case 3: // $bb1
        var $23 = HEAP[$t_addr];
        var $24 = HEAP[$buff];
        var $25 = _tempo_input($23, $24, 128);
        var $26 = HEAP[$t_addr];
        _tempo_process($26);
        __label__ = 2; /* $bb2 */ break;
      case 2: // $bb2
        var $27 = HEAP[$t_addr];
        var $28 = $27+56;
        var $29 = _fifo_occupancy($28);
        var $30 = HEAP[$remaining];
        var $31 = unSign($29, 32) < unSign($30, 32);
        if ($31) { __label__ = 3; /* $bb1 */ break; } else { __label__ = 4; /* $bb3 */ break; }
      case 4: // $bb3
        var $32 = HEAP[$t_addr];
        var $33 = $32+56;
        var $34 = HEAP[$remaining];
        _fifo_trim_to($33, $34);
        var $35 = HEAP[$t_addr];
        var $36 = $35+76;
        HEAP[$36] = 0;;
        __label__ = 1; /* $bb4 */ break;
      case 1: // $bb4
        var $37 = HEAP[$buff];
        var $38 = $37;
        _free($38);
        __label__ = 5; /* $return */ break;
      case 5: // $return
        STACKTOP = __stackBase__;
        return;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _tempo_flush.__index__ = Runtime.getFunctionIndex(_tempo_flush, "_tempo_flush");
  
  
  function _tempo_setup($t, $sample_rate, $quick_search, $factor, $segment_ms, $search_ms, $overlap_ms) {
    var __stackBase__  = STACKTOP; STACKTOP += 56; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $t_addr = __stackBase__;
        var $sample_rate_addr = __stackBase__+4;
        var $quick_search_addr = __stackBase__+12;
        var $factor_addr = __stackBase__+16;
        var $segment_ms_addr = __stackBase__+24;
        var $search_ms_addr = __stackBase__+32;
        var $overlap_ms_addr = __stackBase__+40;
        var $iftmp_5 = __stackBase__+48;
        var $max_skip = __stackBase__+52;
        var $_alloca_point_ = 0;
        HEAP[$t_addr] = $t;;
        HEAP[$sample_rate_addr] = $sample_rate;;
        HEAP[$quick_search_addr] = $quick_search;;
        HEAP[$factor_addr] = $factor;;
        HEAP[$segment_ms_addr] = $segment_ms;;
        HEAP[$search_ms_addr] = $search_ms;;
        HEAP[$overlap_ms_addr] = $overlap_ms;;
        var $0 = HEAP[$t_addr];
        var $1 = $0+4;
        var $2 = HEAP[$quick_search_addr];
        HEAP[$1] = $2;;
        var $3 = HEAP[$t_addr];
        var $4 = $3+8;
        var $5 = HEAP[$factor_addr];
        HEAP[$4] = $5;;
        var $6 = HEAP[$sample_rate_addr];
        var $7 = HEAP[$segment_ms_addr];
        var $8 = $6 * $7;
        var $9 = $8 / 1000;
        var $10 = $9 + 0.5;
        var $11 = Math.floor($10);
        var $12 = HEAP[$t_addr];
        var $13 = $12+20;
        HEAP[$13] = $11;;
        var $14 = HEAP[$sample_rate_addr];
        var $15 = HEAP[$search_ms_addr];
        var $16 = $14 * $15;
        var $17 = $16 / 1000;
        var $18 = $17 + 0.5;
        var $19 = Math.floor($18);
        var $20 = HEAP[$t_addr];
        var $21 = $20+16;
        HEAP[$21] = $19;;
        var $22 = HEAP[$sample_rate_addr];
        var $23 = HEAP[$overlap_ms_addr];
        var $24 = $22 * $23;
        var $25 = $24 / 1000;
        var $26 = $25 + 4.5;
        var $27 = $26 >= 16;
        if ($27) { __label__ = 0; /* $bb */ break; } else { __label__ = 1; /* $bb1 */ break; }
      case 0: // $bb
        var $28 = HEAP[$sample_rate_addr];
        var $29 = HEAP[$overlap_ms_addr];
        var $30 = $28 * $29;
        var $31 = $30 / 1000;
        var $32 = $31 + 4.5;
        var $33 = Math.floor($32);
        HEAP[$iftmp_5] = $33;;
        __label__ = 2; /* $bb2 */ break;
      case 1: // $bb1
        HEAP[$iftmp_5] = 16;;
        __label__ = 2; /* $bb2 */ break;
      case 2: // $bb2
        var $34 = HEAP[$t_addr];
        var $35 = $34+24;
        var $36 = HEAP[$iftmp_5];
        HEAP[$35] = $36;;
        var $37 = HEAP[$t_addr];
        var $38 = $37+24;
        var $39 = HEAP[$38];
        var $40 = $39 & -8;
        var $41 = HEAP[$t_addr];
        var $42 = $41+24;
        HEAP[$42] = $40;;
        var $43 = HEAP[$t_addr];
        var $44 = $43+24;
        var $45 = HEAP[$44];
        var $46 = ($45 * 2)&4294967295;
        var $47 = HEAP[$t_addr];
        var $48 = $47+20;
        var $49 = HEAP[$48];
        var $50 = unSign($46, 32) > unSign($49, 32);
        if ($50) { __label__ = 3; /* $bb3 */ break; } else { __label__ = 4; /* $bb4 */ break; }
      case 3: // $bb3
        var $51 = HEAP[$t_addr];
        var $52 = $51+24;
        var $53 = HEAP[$52];
        var $54 = ($53 - 8)&4294967295;
        var $55 = HEAP[$t_addr];
        var $56 = $55+24;
        HEAP[$56] = $54;;
        __label__ = 4; /* $bb4 */ break;
      case 4: // $bb4
        var $57 = HEAP[$t_addr];
        var $58 = $57+24;
        var $59 = HEAP[$58];
        var $60 = HEAP[$t_addr];
        var $61 = $60;
        var $62 = HEAP[$61];
        var $63 = ($59 * $62)&4294967295;
        var $64 = ($63 * 4)&4294967295;
        var $65 = _malloc($64);
        var $66 = $65;
        var $67 = HEAP[$t_addr];
        var $68 = $67+52;
        HEAP[$68] = $66;;
        var $69 = HEAP[$t_addr];
        var $70 = $69+20;
        var $71 = HEAP[$70];
        var $72 = HEAP[$t_addr];
        var $73 = $72+24;
        var $74 = HEAP[$73];
        var $75 = ($71 - $74)&4294967295;
        var $76 = unSign($75, 32);
        var $77 = HEAP[$factor_addr];
        var $78 = $76 * $77;
        var $79 = _ceil($78);
        var $80 = Math.floor($79);
        HEAP[$max_skip] = $80;;
        var $81 = HEAP[$t_addr];
        var $82 = $81+24;
        var $83 = HEAP[$82];
        var $84 = HEAP[$max_skip];
        var $85 = ($83 + $84)&4294967295;
        var $86 = HEAP[$t_addr];
        var $87 = $86+20;
        var $88 = HEAP[$87];
        var $89 = unSign($85, 32) >= unSign($88, 32);
        var $max = $89 ? $85 : $88;
        var $90 = HEAP[$t_addr];
        var $91 = $90+16;
        var $92 = HEAP[$91];
        var $93 = ($max + $92)&4294967295;
        var $94 = HEAP[$t_addr];
        var $95 = $94+28;
        HEAP[$95] = $93;;
        var $96 = HEAP[$t_addr];
        var $97 = $96+16;
        var $98 = HEAP[$97];
        var $99 = Math.floor(unSign($98, 32) / unSign(2, 32));
        var $100 = HEAP[$t_addr];
        var $101 = $100;
        var $102 = HEAP[$101];
        var $103 = ($99 * $102)&4294967295;
        var $104 = ($103 * 4)&4294967295;
        var $105 = HEAP[$t_addr];
        var $106 = $105+16;
        var $107 = HEAP[$106];
        var $108 = Math.floor(unSign($107, 32) / unSign(2, 32));
        var $109 = HEAP[$t_addr];
        var $110 = $109+32;
        var $111 = _fifo_reserve($110, $108);
        _llvm_memset_p0i8_i32($111, 0, $104, 1, 0);
        __label__ = 5; /* $return */ break;
      case 5: // $return
        STACKTOP = __stackBase__;
        return;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _tempo_setup.__index__ = Runtime.getFunctionIndex(_tempo_setup, "_tempo_setup");
  
  
  function _tempo_delete($t) {
    var __stackBase__  = STACKTOP; STACKTOP += 4; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $t_addr = __stackBase__;
        var $_alloca_point_ = 0;
        HEAP[$t_addr] = $t;;
        var $0 = HEAP[$t_addr];
        var $1 = $0+52;
        var $2 = HEAP[$1];
        var $3 = $2;
        _free($3);
        var $4 = HEAP[$t_addr];
        var $5 = $4+56;
        _fifo_delete($5);
        var $6 = HEAP[$t_addr];
        var $7 = $6+32;
        _fifo_delete($7);
        var $8 = HEAP[$t_addr];
        var $9 = $8;
        _free($9);
        __label__ = 0; /* $return */ break;
      case 0: // $return
        STACKTOP = __stackBase__;
        return;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _tempo_delete.__index__ = Runtime.getFunctionIndex(_tempo_delete, "_tempo_delete");
  
  
  function _tempo_create($channels) {
    var __stackBase__  = STACKTOP; STACKTOP += 16; assert(STACKTOP < STACK_MAX); for (var i = __stackBase__; i < STACKTOP; i++) {HEAP[i] = 0 };
    var __label__;
    __label__ = -1; /* $entry */
    while(1) switch(__label__) {
      case -1: // $entry
        var $channels_addr = __stackBase__;
        var $retval = __stackBase__+4;
        var $0 = __stackBase__+8;
        var $t = __stackBase__+12;
        var $_alloca_point_ = 0;
        HEAP[$channels_addr] = $channels;;
        var $1 = _calloc(1, 92);
        var $2 = $1;
        HEAP[$t] = $2;;
        var $3 = HEAP[$t];
        var $4 = $3;
        var $5 = HEAP[$channels_addr];
        HEAP[$4] = $5;;
        var $6 = HEAP[$t];
        var $7 = $6;
        var $8 = HEAP[$7];
        var $9 = ($8 * 4)&4294967295;
        var $10 = HEAP[$t];
        var $11 = $10+32;
        _fifo_create($11, $9);
        var $12 = HEAP[$t];
        var $13 = $12;
        var $14 = HEAP[$13];
        var $15 = ($14 * 4)&4294967295;
        var $16 = HEAP[$t];
        var $17 = $16+56;
        _fifo_create($17, $15);
        var $18 = HEAP[$t];
        HEAP[$0] = $18;;
        var $19 = HEAP[$0];
        HEAP[$retval] = $19;;
        __label__ = 0; /* $return */ break;
      case 0: // $return
        var $retval1 = HEAP[$retval];
        STACKTOP = __stackBase__;
        return $retval1;
      default: assert(0, "bad label: " + __label__);
    }
  }
  _tempo_create.__index__ = Runtime.getFunctionIndex(_tempo_create, "_tempo_create");
  
  // === Auto-generated postamble setup entry stuff ===
  
  function run(args) {
    __initializeRuntime__();
  
    var globalFuncs = [];
  
      
    
    
    
  
    var argc = args.length+1;
    function pad() {
      for (var i = 0; i < 4-1; i++) {
        argv.push(0);
      }
    }
    var argv = [Pointer_make(intArrayFromString("/bin/this.program"), null) ];
    pad();
    for (var i = 0; i < argc-1; i = i + 1) {
      argv.push(Pointer_make(intArrayFromString(args[i]), null));
      pad();
    }
    argv.push(0);
    argv = Pointer_make(argv, null);
  
    __globalConstructor__();
  
    if (Module['_main']) {
      _main(argc, argv, 0);
      __shutdownRuntime__();
    }
  }
  Module['run'] = run;
  
  // {{PRE_RUN_ADDITIONS}}
  
  run(args);
  
  
  

  // {{MODULE_ADDITIONS}}

//  return Module;
//})({}, this.arguments); // Replace parameters as needed


