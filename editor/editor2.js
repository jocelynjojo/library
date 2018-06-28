var Editor = {
    elestr: '',
    $cont: null,
    init: function (elestr) {
        this.elestr = elestr;
        this.$cont = $(this.elestr + ' .cmb_editor_panel')
        this.$numwp = $(this.elestr + ' .cmb_gutter');
        this.$divarr = []; //最后一次调用getDomFromJson返回的domarr
        this.addHandler();
    },
    addJson: function (json) {
        if (json) {
            // this.$cont.html(json);
            // this.doWhenNotEqual(json);
            var html = this.getDomFromJson(json);
            this.$cont.html(html);
            this.matchHeight();
            this.setNumWp();
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
        regs.reg8 = /^("\w+?"):(.*?)(,|\]|\})/ //匹配后面跟着(,|\]|\})的 "name":value
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
        this.$divarr = [];
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
            this.$divarr.push(a[0]);
            domstr += '<div class="cmb_edit_div" style=" margin-left: ' + left + 'px">' + inStr + '</div>';
        }
        return domstr;
    },
    getJsonFromDom: function(){
        var str = '';
        var reg = /^(.*?)<(\/)?\w+.*?>/;
        var s = this.$cont.html();
        while (s){
            if(a = reg.exec(s)){
                str += a[1];
                s = s.replace(a[0],'');
            }else{
                str = s;
                s = '';
            }
        }
        return str;
    },
    getWrongLine: function(){
        var json = this.getJsonFromDom();
        this.getDomFromJson(json);
        var regs = this.regs || this.getRegs(),last = -1, index= -1;
        for(var i = 0, len = this.$divarr.length; i < len; i++){
            var str = this.$divarr[i], a = null;
            for(var key in regs){
                if(key == 'reg14'){
                    break;
                }else if(a = regs[key].exec(str) || (a = /^("\w+?"):(".*?[^\\]")$/.exec(str))){
                    if(i>0 && /^(\[|\{)/.test(str) && /[^\b|,|\[|\{]$/.test(this.$divarr[i-1])){
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
        console.log(e);
        var self =this;
        setTimeout(function(){
            var json = '';
            json = self.getJsonFromDom()
            console.log(json)
            self.addJson(json);
        },100)
       
    },
    keyUpFn: function(){
        var line = this.getWrongLine();
        this.doWhenNotEqual(line);
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
        
        var len1 = this.$cont.children('div').length;
        var len2 = this.$numwp.children('div').length;
        var before = this.getFirstLine();
        if (len1 != len2) {
            this.setNumWp(line + before);
            this.matchHeight();
        }else{
            this.setNumWp(line + before);
        }
    },
    setNumWp: function (line) {
        var len = this.$cont.children('div').length;
        var str = '',cls='';
        for (var i = 0; i < len; i++) {
            cls='';
            if(line != -1 && (i >= line || len == i+1)){
                console.log(i,len, line)
                cls = 'wrong';
            }
            str += '<div class="cmb_gutter-cell '+ cls +'">' + (i + 1) + '</div>';
        }
        this.$numwp.html(str);
    },
    matchHeight: function () {
        var eh = $(this.elestr).height();
        var nh = this.$cont.height();
        var sh = nh > eh ? nh : eh;
        this.$numwp.height(sh);
        if(sh != nh){
            this.$cont.height(sh);
        }
    }
}