var Editor = {
    elestr: '',
    $cont: null,
    init: function (elestr) {
        this.elestr = elestr;
        this.$cont = $(this.elestr + ' .cmb_editor_panel')
        this.$numwp = $(this.elestr + ' .cmb_gutter');
        this.addHandler();
    },
    addJson: function (json,line) {
        if (json) {
            var str = this.getDomFromJson(json).str;
            this.$cont.html(str);
            this.doWhenNotEqual(line);
        }
    },
    getRegs: function(){
        var regs = {};
        regs.reg1 = /^(?:("\w+?"):)?(\{\},?)/; //匹配 "name":{} 或者 "name":{}, 或者{}
        regs.reg2 = /^(?:("\w+?"):)?(\[\],?)/; // 匹配 "name":[] 或者 "name":[],或者[]
        regs.reg3 = /^(?:("\w+?"):)?(\[\{)/; //匹配 "name":[{ 或者 [{
        regs.reg4 = /^(?:("\w+?"):)?(\[)/; //匹配 "name":[ 或者 [
        regs.reg5 = /^(?:("\w+?"):)?(\{)/; //匹配 "name"{ 或者 {
        regs.reg6 = /^("\w+?"):("")(,|\]|\})/ //匹配后面跟着(,|\]|\})的 "name":"" 
        regs.reg7 = /^("\w+?"):(".*?[^\\]")(,|\]|\})/ //匹配后面跟着(,|\]|\})的 "name":"value" 其中通过[^\\]" 过滤掉 value 中的"
        regs.reg8 = /^("\w+?"):(true|false|\d+?)(,|\]|\})/ //匹配后面跟着(,|\]|\})的 "name":value
        regs.reg9 = /^(\}),(\{)/ //匹配 },{
        regs.reg10 = /^(\]),(\[)/ //匹配 ],[
        regs.reg11 = /^(\}\])(,?)/; //匹配 }], 或者 }]
        regs.reg12 = /^(])(,?)/; // 匹配 ] 或者 ],
        regs.reg13 = /^(})(,?)/; // 匹配 } 或者 },
        regs.reg14 = /^.+?(?=\{|\[|"|\}|\])/ // 匹配任意 xxx{ 或者 xxx[
        this.regs = regs;
        return this.regs;
    },
    getDomFromJson: function (json) {
        var regs = this.regs || this.getRegs();
        var setStr = function (name) {
            var str = '';
            if (name) {
                str = '<span class="name">' + name + '</span>';
                str += '<span class="punctuation">:</span>'
            }
            return str;
        }
        var str = json, len = 14, ml = 24, arrlength = 0;
        var domstr = '', inStr = '', a = null, left = 0;
        var divarr = [];
        while (str != '') {
            inStr = '';
            a = null;
            for (var i = 1; i <= len; i++) {
                if (a = regs['reg' + i].exec(str)) {
                    left = arrlength * ml;
                    switch (i) {
                        case 1: case 2:
                            inStr = setStr(a[1]);
                            inStr += '<span class="brackets">' + a[2] + '</span>';
                            break;
                        case 3: case 4: case 5:
                            arrlength += a[2].length;
                            inStr = setStr(a[1]);
                            inStr += '<span class="brackets">' + a[2] + '</span>';
                            break;
                        case 6: case 7: case 8: 
                            inStr = setStr(a[1]);
                            inStr += '<span class="value">' + a[2] + '</span>';
                            if (a[3] == ',') {
                                inStr += '<span class="punctuation">,</span>';
                            } else {
                                a[0] = a[0].replace(a[3], '');
                            }
                            break;
                        case 9: case 10:
                            left = (arrlength - 1) * ml;
                            inStr = '<span class="brackets">' + a[1] + '</span>' + '<span class="punctuation">:</span>' + '<span class="brackets">' + a[2] + '</span>';
                            break;
                        case 13: case 11: case 12:
                            arrlength -= a[1].length
                            left = arrlength * ml;
                            inStr = '<span class="brackets">' + a[1] + '</span><span class="punctuation">' + a[2] + '</span>';
                            break;
                        case 14:
                            inStr = '<span>'+a[0]+'</span>'
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
        return {str:domstr, arr:divarr};
    },
    getJsonFromDom: function(){
        var str = '';
        var reg = /^(.*?)<(\/)?\w+.*?>/;
        var s = this.$cont.html();
        var i = 0;
        while (s){
            if(a = reg.exec(s)){
                a[1] = a[1].replace(/&nbsp;/g,'').replace(/^\s+/,'').replace(/\s+$/,'');
                str += a[1];
                s = s.replace(a[0],'');
            }else{
                str = s.replace(/^\s+/,'').replace(/\s+$/,'');
                s = '';
            }
        }
        return str;
    },
    getWrongLine: function(arr){
        var regs = this.regs || this.getRegs(),last = -1, index= -1;
        for(var i = 0, len = arr.length; i < len; i++){
            var str = arr[i], a = null;
            if(!str){
                i--;
                continue;
            }
            for(var key in regs){
                if(key == 'reg14'){
                    break;
                }else if(a = regs[key].exec(str) || (a = /^("\w+?"):(".*?[^\\]")$/.exec(str)) || (a=/^("\w+?"):(true|false|\d+?)$/.exec(str)) || (a=/^("\w+?"):("")$/.exec(str))){
                    if(i>0 && /^(\[|\{)/.test(str) && /[^\b|,|\[|\{]$/.test(arr[i-1])){
                        a = null;
                    }
                    break;
                }
            }
            if(!a){
                index = i;
                break;
            }
        }
        return index;
    },
    addHandler: function () {
        var _self = this;
        this.$cont.on('keyup', this.keyUpFn.bind(this))
        this.$cont.on('paste', this.pasteFn.bind(this))
    },
    pasteFn: function(e){
        var self =this;
        setTimeout(function(){
            var json = '';
            json = self.getJsonFromDom()
            self.addJson(json);
        },100)
       
    },
    keyUpFn: function(){
        var json = this.getJsonFromDom();
        var dom = this.getDomFromJson(json);
        var line = this.getWrongLine(dom.arr);
        if(this.line != -1 && line == -1){
            this.addJson(json)
        }else{
            this.doWhenNotEqual(line);
        }
        this.line = line;
    },
    getFirstLine: function(){
        var $divs1 = this.$cont.children('div');
        for(var i = 0, len = $divs1.length; i < len; i++){
            var html = $divs1[i].innerHTML;
            html = html.replace(/<(\/)?\w+?>/g,'');
            if(html){
                return i;
            }
        }
        return 0;
    },
    doWhenNotEqual: function (line) {
        line = (line == undefined)? -1 : line;
        var len1 = this.$cont.children('div').length;
        var len2 = this.$numwp.children('div').length;
        var before = this.getFirstLine();
        this.setNumWp(line + before);
    },
    setNumWp: function (line) {
        var len = this.$cont.children('div').length;
        var str = '',cls='';
        for (var i = 0; i < len; i++) {
            cls='';
            if(line != -1 && (i >= line || len == i+1)){
                cls = 'wrong';
            }
            str += '<div class="cmb_gutter-cell '+ cls +'">' + (i + 1) + '</div>';
        }
        this.$numwp.html(str);
    },
}