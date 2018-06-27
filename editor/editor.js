var Editor = {
    line: 1,
    elestr: '',
    $txt: null,
    init: function (elestr, str) {
        this.elestr = elestr;
        this.$txt = $(this.elestr + ' .cmb_editor_panel')
        this.showLayer();
        this.addHandler();
        if(str){
            this.$txt.val(str);
            this.doWhenNotEqual(str);
        }
    },
    addStr: function(str){
        if(str){
            this.$txt.val(str);
            this.doWhenNotEqual(str);
        }
    },
    addHandler: function(){
        var $txt = this.$txt;
        var _self = this;
        $txt.on('keydown', function (e) {
            var v = $txt.val();
            if(e.keyCode == 9 || e.witch == 9){
                e.preventDefault();
                var str = $txt.val() + '  ';
                $txt.val(str);
            }else if(e.keyCode == 13 || e.witch == 13){
                 v = v + '\n';
            }
             _self.doWhenNotEqual(v)
        })
        $txt.on('keyup', function(e) {
            if(e.keyCode == 9 || e.witch == 9){
                e.preventDefault();
            }
            _self.doWhenNotEqual($txt.val())
        })
    },
    doWhenNotEqual: function(v){
        var app = v.split('\n');
        if(app.length != this.line && app.length != 0){
            this.line = app.length;
            this.showLayer();
            this.matchHeight();
        }
    },
    showLayer: function () {
        var $numwp = $(this.elestr + ' .cmb_layer')
        var str = '';
        for(var i = 0; i < this.line; i++){
            str += '<div class="cmb_gutter-cell">'+(i+1)+'</div>'
        }
        $numwp.html(str);
    },
    matchHeight: function(){
        var eh = $(this.elestr).height();
        var nh = $(this.elestr + ' .cmb_layer').height();
        var sh = nh > eh? nh: eh;
        $(this.elestr + ' .cmb_scroller').height(sh);
    }
}