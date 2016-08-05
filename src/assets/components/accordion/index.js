/**
 * Created by r9luox on 2016/7/14.
 */

;(function(){

    var root = this,
        empty = function(){},
        defaults = {
            clickActive: true,
            hoverActive: false,
            autoPlay: false,
            direction: 'vertical',
            duration: 3,
            index: null,
            switchWidth: 0,
            onSelect: empty,
            onSwitchStart: empty,
            onSwitchEnd: empty
        };
    var Accordion = function(id, options){
        this.options = $.extend({}, defaults, options);
        this.box = $('#' + (id || this.options.id).replace(/^#*/i, ''));
        this.listBox = this.box.find('li');
        this.contentBoxs = this.box.find('li>.accordion-content');
        this.index = this.options.index;
        this._isActive = false;
        this._init();
    };

    Accordion.prototype = {
        _init: function(){
            (this.index && this.index != 0) && this.switch(this.index);
            this.options.autoPlay && this._play();
            this._addEvent();
        },
        _addEvent: function(){
            this.options.clickActive && this.box.find('li>a').on('click', $.proxy(this, '_clickHandler'));
            this.options.hoverActive && this.box.find('li>a').on('mouseover', $.proxy(this, '_clickHandler'));
        },
        _clickHandler: function(evt){
            //if(this._isActive) return;
            //this._isActive = true;
            this._currentTarget = evt.currentTarget || evt.target;
            this.index = this._getIndex() + 1;
            this.options.onSelect.call(this);
            this._stop().switch();
        },
        _play: function(){
            var self = this;
            (!this._isActive && this.options.autoPlay) && (this._stin = window.setInterval(function(){
                self.index++;
                self.index > self.listBox.length && (self.index = 1);
                //console.log(self.index);
                self._getCurrentTarget().switch();
            }, this.options.duration * 1000));
            return this;
        },
        _stop: function(){
            this._isActive = false;
            window.clearInterval(this._stin); return this;
        },
        _getCurrentTarget: function(){
            this._currentTarget = this.listBox.eq(this.index - 1).find('a')[0];
            return this;
        },
        _getIndex: function(){
            return this.listBox.index($(this._currentTarget).parent());
        },
        switch: function(index){
            var self = this;
            if(index){
                this.index = index;
                this._getCurrentTarget();
            }
            var $target = $(this._currentTarget);
            if($target.parent().hasClass('active')) return;
            var showPanel = $target.siblings('.accordion-content');
            if(!showPanel[0]){
                this._stop().switch(++this.index);
                return;
            }
            this.listBox.removeClass('active');
            //切换之前调用，如果函数返回 false，则不进行切换
            var _start = this.options.onSwitchStart.call(this);
            if(_start === false)    return;
            $target.parent().addClass('active');

            if(this.options.direction === 'vertical'){
                this.contentBoxs.slideUp(200);
                showPanel.slideDown(300, _end);
            }else{
                this.contentBoxs.stop().animate({ width: 0, padding: 0 }, 200);
                showPanel.css({
                    display: 'block'
                }).stop().animate({width: this.options.switchWidth}, 300, _end);
            }

            function _end(){
                self._isActive = false;
                self.options.onSwitchEnd.call(self);
                self._stop()._play();
            }
            return this;
        }
    };

    root.Accordion = Accordion;

}).call(this);
