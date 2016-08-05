/**
 * Created by R9luox on 2016/7/19.
 */

;(function(){

    var defaults = {
        onSelect: function(){}
    },
    rid = (new Date()).getTime();
    var AutoComplate = function(id, options){
        var self = this;
        this.options = $.extend({}, defaults, options);
        this.input = $('#' + (id || this.options.id).replace(/^#*/i, ''));
        var box = $('#autocomplate-box');
        this.box = box[0] ? box : (function(){
            var div = document.createElement('div');
            div.setAttribute('id', 'autocomplate-box');
            div.setAttribute('class', 'autocomplate-box');
            div.style.display = 'none';
            self.input.after(div);
            return $(div);
        })();
        this.options.data && Object.prototype.toString.call(this.options.data) == '[object Array]' && this._init();
    };
    AutoComplate.prototype = {
        _init: function(){
            this._createList();
        },
        _createList: function(value){
            var data = this.options.data,
                i = 0,
                len = data.length,
                ps = '';
            for(; i < len; ++i){
                ps += '<p>' + (value || '') + '<span>' + data[i] + '</span></p>';
            }
            this.box.html(ps);
            this._addEvent();
        },
        _addEvent: function(){
            var self = this;
            this.input.off().on('input', $.proxy(this, '_inputHandler'));
            this.box.find('p').off().on('click', function(evt){
                var v = $(this).html().replace(/<[^>]*?>/gi, '');
                self.input.val(v);
                self.box.hide();
                self.options.onSelect.call(self, v);
            });
        },
        _inputHandler: function(evt){
            var target = evt.currentTarget || evt.target;
            this._replaceValues(target.value);
        },
        _replaceValues: function(value){
            if(!value || '' == value){
                this.box.hide();
            }else{
                this._createList(value);
                this.box.show();
            }
        }

    };

    this.AutoComplate = AutoComplate;

}).call(this);
