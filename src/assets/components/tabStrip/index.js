/**
 * Created by r9luox on 2016/7/7.
 * 选项卡组件
 */

;(function(){

    var root = this,
        defaults = {
            //选项卡方向
            direction: 'horizontal',
            //hover到tab上时是否触发
            hover: false,
            onSelect: function(){}
        };
    $(function(){

        var TabStrip = function(id, options){
            this.options = $.extend({}, defaults, options);
            this.index = this.options.index || 1;
            this.box = $('#' + (id || this.options.id).replace(/^#*/i, ''));
            this._init();
        };
        TabStrip.prototype = {
            _init: function(){
                this.tabNavs = this.box.find('.tab-nav-box>span');
                this.tabContens = this.box.find('.tab-content-box>div');
                this._onActive();
                this._addEvent();
            },
            _addEvent: function(){
                this.tabNavs.on('click', $.proxy(this, '_onSelect'));
                this.options.hover && this.tabNavs.hover($.proxy(this, '_onSelect'));
            },
            _onSelect: function(evt){
                var self = this;
                var $target = $(evt.currentTarget || evt.target);
                $.each(this.tabNavs, function(index, nav){
                    if($target.html() == $(nav).html()){
                        self.index = index + 1;
                    }
                });
                this._onActive();
                this.options.onSelect.call(this, $target);
            },
            _onActive: function(){
                var index = this.index - 1;
                this.tabNavs.removeClass('active');
                this.tabNavs.eq(index).addClass('active');
                this.tabContens.hide();
                this.tabContens.eq(index).show();
            },

            //---------Public-----------------
            setIndex: function(index){
                index = isNaN(parseInt(index)) ? 0 : parseInt(index);
                this.index = index;
                this._onActive();
            }
        };

        root.TabStrip = TabStrip;
    });

}).call(this);
