function Editor(elestr) {
    this.elestr = elestr;
    this.$cont = $(this.elestr + ' .cmb_editor_panel')
    this.$numwp = $(this.elestr + ' .cmb_gutter');
    this.addHandler();
    this.setNumWp();
    this.regexps = this.setRegs();
    this.regexps2 = this.setRegs2();
}
/**
 * 设置json格式化规则
 */
Editor.prototype.setRegs = function () {
    var regs = [];
    regs[regs.length] = /^(?:("[^"]+?"):)?(\{\},?)/; //0 匹配 "name":{} 或者 "name":{}, 或者{}
    regs[regs.length] = /^(?:("[^"]+?"):)?(\[\],?)/; //1 匹配 "name":[] 或者 "name":[],或者[]
    regs[regs.length] = /^(?:("[^"]+?"):)?(\[(?:(?:true|false|null|undefined|\d+?),)*(?:true|false|null|undefined|\d+?)\],?)/; //2 匹配 "name":[] 或者 "name":[],或者[]
    regs[regs.length] = /^(?:("[^"]+?"):)?(\[\{)/; //3 匹配 "name":[{ 或者 [{
    regs[regs.length] = /^(?:("[^"]+?"):)?(\[)/; //4 匹配 "name":[ 或者 [
    regs[regs.length] = /^(?:("[^"]+?"):)?(\{)/; //5 匹配 "name"{ 或者 {
    regs[regs.length] = /^("[^"]+?"):("")(,|\]|\})/ //6 匹配后面跟着(,|\]|\})的 "name":"" 
    regs[regs.length] = /^("[^"]+?"):(".*?[^\\]")(,|\]|\})/ //7 匹配后面跟着(,|\]|\})的 "name":"value" 其中通过[^\\]" 过滤掉 value 中的"
    regs[regs.length] = /^("[^"]+?"):(true|false|null|undefined|\d+?)(,|\]|\})/ //8 匹配后面跟着(,|\]|\})的 "name":value
    regs[regs.length] = /^(".*?[^\\]")(,|\]|\})/ //9 匹配后面跟着(,|\]|\})的 "value" 其中通过[^\\]" 过滤掉 value 中的"
    regs[regs.length] = /^(\}),(\{)/ //11 匹配 },{
    regs[regs.length] = /^(\]),(\[)/ //12 匹配 ],[
    regs[regs.length] = /^(\}\])(,?)/; //13 匹配 }], 或者 }]
    regs[regs.length] = /^(])(,?)/; // 14 匹配 ] 或者 ],
    regs[regs.length] = /^(})(,?)/; // 15 匹配 } 或者 },
    regs[regs.length] = /^.+?(?=\{|\[|"|\}|\])/ //16 匹配任意 xxx{ 或者 xxx[
    return regs;
}
Editor.prototype.setRegs2 = function () {
    var regs = this.setRegs();
    regs[6] = /^("[^"]+?"):("")(,?)/ //匹配后面跟着(,|\]|\})的 "name":"" 
    regs[7] = /^("[^"]+?"):(".*?[^\\]")(,?)/ //匹配后面跟着(,|\]|\})的 "name":"value" 其中通过[^\\]" 过滤掉 value 中的"
    regs[8] = /^("[^"]+?"):(true|false|null|undefined|\d+)(,?)/ //匹配后面跟着(,|\]|\})的 "name":value
    regs[9] = /^(".*?[^\\]")(,?)/ //匹配后面跟着(,|\]|\})的 "name":value
    return regs;
}
/**
 * 传入json 字符串，格式化填充
 * @param {string} json 
 */
Editor.prototype.setCont = function (json) {
    if (json) {
        var dom = this.getDomFromJson(json);
        this.$cont.html(dom.str);
        this.doFormat(json, dom);
    }
}
/**
 * 已经存在的情况并且格式化的情况下，
 */
Editor.prototype.doFormat = function (json, dom) {
    var json = json || this.getJsonFromDom();
    var dom = dom || this.getDomFromJson(json);
    var line = this.getWrongLine(dom.arr);
    console.log(line)
    if (line == -1) {
        this.$cont.html(dom.str);
        this.setNumWp(-1);
    } else {
        var before = this.getFirstLine();
        this.setNumWp(line + before);
    }
    return line;
}
/**
 * 传入字符串数组，获取导致非json 的那个错误的arr 的index;
 * @param {array} arr 
 */
Editor.prototype.getWrongLine = function (arr) {
    var regs = this.regexps2, index = -1;
    for (var i = 0, len = arr.length; i < len; i++) {
        var str = arr[i], a = null;
        if (!str || /^\s+$/.test(str)) {
            continue;
        }
        for (var j = 0, _len = regs.length; j < _len; j++) {
            if (j == regs.length - 1) {
                break;
            } else if (a = regs[j].exec(str)) {
                if (i > 0 && /^(\[|\{|")/.test(str) && /[^\b|,|\[|\{]$/.test(arr[i - 1]) || str.replace(a[0], '')) {
                    a = null;
                }
                break;
            }
        }
        if (!a) {
            index = i;
            break;
        }
    }
    return index;
}
/**
 * 通过json 获取 dom 字符串
 * @param {*} json 
 */
Editor.prototype.getDomFromJson = function (json) {

    var setStr = function (name) {
        var str = '';
        if (name) {
            str = '<span class="name">' + name + '</span>';
            str += '<span class="punctuation">:</span>'
        }
        return str;
    }
    var changeStr = function (val) {
        return val.replace('<', '&lt;').replace('>', '&gt;');
    }
    var str = changeStr(json), ml = 24, arrlength = 0;
    var domstr = '', inStr = '', a = null, left = 0;
    var divarr = [];
    var regs = this.regexps;
    while (str != '') {
        inStr = '';
        a = null;
        for (var i = 1, len = regs.length; i < len; i++) {
            if (a = regs[i].exec(str)) {
                left = arrlength * ml;
                switch (i) {
                    case 0: case 1:
                        inStr = setStr(a[1]);
                        inStr += '<span class="brackets">' + a[2] + '</span>';
                        break;
                    case 2:
                        inStr = setStr(a[1]);
                        inStr += '<span class="brackets">' + a[2] + '</span>';
                        var _arr = a[3].split(',');
                        for (var _i = 0, _l = _arr.length; _i < _l; _i++) {
                            inStr += '<span class="value">' + _arr[_i] + '</span>';
                            if (_i != _l - 1) {
                                inStr += '<span class="punctuation">,</span>';
                            }
                        }
                        inStr += '<span class="brackets">' + a[4] + '</span>';
                        inStr += '<span class="punctuation">,</span>';
                        break;
                    case 5: case 3: case 4:
                        arrlength += a[2].length;
                        inStr = setStr(a[1]);
                        inStr += '<span class="brackets">' + a[2] + '</span>';
                        break;
                    case 8: case 6: case 7:
                        inStr = setStr(a[1]);
                        inStr += '<span class="value">' + a[2] + '</span>';
                        if (a[3] == ',') {
                            inStr += '<span class="punctuation">,</span>';
                        } else {
                            a[0] = a[0].replace(a[3], '');
                        }
                        break;
                    case 9:
                        inStr = '<span class="value">' + a[1] + '</span>';
                        if (a[2] == ',') {
                            inStr += '<span class="punctuation">,</span>';
                        } else {
                            a[0] = a[0].replace(a[2], '');
                        }
                        break;
                    case 10: case 11:
                        left = (arrlength - 1) * ml;
                        inStr = '<span class="brackets">' + a[1] + '</span>' + '<span class="punctuation">,</span>' + '<span class="brackets">' + a[2] + '</span>';
                        break;
                    case 12: case 13: case 14:
                        arrlength -= a[1].length
                        left = arrlength * ml;
                        inStr = '<span class="brackets">' + a[1] + '</span><span class="punctuation">' + a[2] + '</span>';
                        break;
                    case 15:
                        inStr = '<span>' + a[0] + '</span>'
                        break;
                }
                break;
            }
        }
        if (!a) {
            a = [str];
            inStr = str;
        }
        str = str.replace(a[0], '');
        divarr.push(a[0]);
        domstr += '<div class="cmb_edit_div" style=" margin-left: ' + left + 'px">' + inStr + '</div>';
    }
    return { str: domstr, arr: divarr };
}
/**
 * 把cont 中 的内容转换为json;
 */
Editor.prototype.getJsonFromDom = function () {
    var reg = /<(\/)?([a-zA-Z0-9]+)(\s.*?)*>/g;
    return this.$cont.html().replace(reg,'');
}
/**
 * 添加监听
 */
Editor.prototype.addHandler = function () {
    this.$cont.on('keyup', this.keyUpFn.bind(this))
    this.$cont.on('paste', this.pasteFn.bind(this))
}
Editor.prototype.pasteFn = function (e) {
    var self = this;
    setTimeout(function () {
        var json = '';
        json = self.getJsonFromDom()
        self.setCont(json);
    }, 100)
};
Editor.prototype.keyUpFn = function () {
    // this.doFormat();
    var json = this.getJsonFromDom();
    var dom = this.getDomFromJson(json);
    var line = this.getWrongLine(dom.arr);
    console.log(line)
    if (line == -1) {
        // this.$cont.html(dom.str);
        this.setNumWp(-1);
    } else {
        var before = this.getFirstLine();
        this.setNumWp(line + before);
    }
    return line;
}
Editor.prototype.getFirstLine = function () {
    var $divs1 = this.$cont.children('div');
    for (var i = 0, len = $divs1.length; i < len; i++) {
        var html = $divs1[i].innerHTML;
        html = html.replace(/<(\/)?\w+?>/g, '');
        if (html) {
            return i;
        }
    }
    return 0;
}

Editor.prototype.setNumWp = function (line) {
    if (line == undefined) {
        line = -1;
    }
    var len = this.$cont.children('div').length;
    var str = '', cls = '';
    if (!/^\s*?<.+?>/.test(this.$cont.html()) && /<.+?>/.test(this.$cont.html())) {
        len++;
    } else if (len == 0) {
        len = 1;
    }
    for (var i = 0; i < len; i++) {
        cls = '';
        if (line != -1 && (i >= line || len == i + 1)) {
            cls = 'wrong';
        }
        str += '<div class="cmb_gutter-cell ' + cls + '">' + (i + 1) + '</div>';
    }
    this.$numwp.html(str);
}
