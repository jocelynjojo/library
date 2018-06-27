var Editor = {
    elestr: '',
    $cont: null,
    init: function (elestr) {
        this.elestr = elestr;
        this.$cont = $(this.elestr + ' .cmb_editor_panel')
        this.$numwp = $(this.elestr + ' .cmb_gutter')
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
    getDomFromJson: function (json) {
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
        var setStr = function (name) {
            var str = '';
            if (name) {
                str = '<span class="name">' + name + '</span>';
                str += '<span class="punctuation">:</span>'
            }
            return str;
        }
        var str = json, len = 13, ml = 24, arrlength = 0;
        var domstr = '', inStr = '', a = null, left = 0;
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
                    }
                    break;
                }
            }
            if (!a) {
                a = [str];
                inStr = str;
            }
            str = str.replace(a[0], '');
            console.log(a[0])
            domstr += '<div class="cmb_edit_div" style=" margin-left: ' + left + 'px">' + inStr + '</div>';
        }
        return domstr;
    },
    getJsonFromDom: function($divs){
        var str = '';
        var reg = /<(\w+).+?>(.+?)<\/\1>/;
        for(var i = 0, len = $divs.length; i < len; i++){
            var spans = $divs.children('span');
            for(var j = 0, l = spans.length; j < l; j++){
                str += spans[i].innerHTML;
            }
        }
        return str;
    },
    addHandler: function () {
        var $cont = this.$cont;
        var _self = this;
        this.$cont.on('keydown', function (e) {
            _self.doWhenNotEqual()
        })
        this.$cont.on('keyup', function (e) {
            _self.isWrong(e)
        })
    },
    pasteFn: function(e){
        var $divs = this.$cont.children('div');
        if($divs.length == 0){
            var json = this.$cont.html();
            this.addJson(json);
        }else{
            var json = this.getJsonFromDom($divs);
            this.addJson(json);
        }
    },
    isWrong: function(e){
        console.log('d')
        
    },
    doWhenNotEqual: function () {
        var len1 = this.$cont.children('div').length;
        var len2 = this.$numwp.children('div').length;
        if (len1 != len2) {
            this.setNumWp();
            this.matchHeight();
        }
    },
    setNumWp: function (len) {
        len = len || this.$cont.children('div').length;
        console.log(len)
        var str = '';
        for (var i = 0; i < len; i++) {
            str += '<div class="cmb_gutter-cell">' + (i + 1) + '</div>'
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