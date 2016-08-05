/**
 * Created by r9luox on 2016/7/4.
 */

;(function(){
    var root = this,
        isTouch = 'ontouchstart' in window,
        empty = function(){},
        defaults = {
            direction: 'horizontal',    //方向 vertical 垂直
            onStart: empty,
            onMove: empty,
            onEnd: empty,
            isMark: true    //滑动时是否以刻度为单位
        };
    $(function(){

        var SeekBar = function(id, direction, options){
            this.options = $.extend(defaults, options);
            this.direction = direction || this.options.direction || 'horizontal';
            this.box = $('#' + (id || this.options.id).replace(/^#/i, ''));
            this.sliderBtn = this.box.find('.slider-btn');
            this.marks = this.box.find('ul>li');
            this.width = this.box.width();
            this.height = this.box.height();
            this._sliderBtnWidth = this.sliderBtn.width();
            this._sliderBtnHeight = this.sliderBtn.height();
            this.isMove = false;
            this._init();
        };

        SeekBar.prototype = {
            _init: function(){
                if(this.direction !== 'horizontal' && this.direction !== 'vertical'){
                    throw new Error('options direction is horizontal or vertical');
                }
                this._addEvent();
            },
            _addEvent: function(){
                this._events = {
                    down: isTouch ? 'touchstart' : 'mousedown',
                    move: isTouch ? 'touchmove' : 'mousemove',
                    up: isTouch ? 'touchend' : 'mouseup'
                };
                this.box.on(this._events.down, $.proxy(this, '_onStart'));
            },
            _onStart: function(evt){
                evt.preventDefault();
                evt.stopPropagation();
                evt = this._getEvent(evt);
                this.isMove = true;
                this._moveSlider(evt);
                $(document).on(this._events.move, $.proxy(this, '_onMove'));
                $(document).on(this._events.up, $.proxy(this, '_onEnd'));
                this._setHandler(evt, this.options.onStart);
            },
            _onMove: function(evt){
                if(!this.isMove) return;
                evt = this._getEvent(evt);
                this._moveSlider(evt);
            },
            _onEnd: function(evt){
                evt = this._getEvent(evt);
                this.isMove = false;
                $(document).off(this._events.move, $.proxy(this, '_onMove'));
                $(document).off(this._events.up, $.proxy(this, '_onEnd'));
                this._setHandler(evt, this.options.onEnd);
            },
            _getEvent: function(evt){
                return isTouch ? evt.originalEvent.changedTouches[0] : evt;
            },
            getTop: function(clientY){
                //碰撞检测
                var boxTop = this.box.offset().top,
                    top = clientY - boxTop;
                if(clientY <= boxTop){
                    top = 0;
                }
                if(clientY >= boxTop + this.height - this._sliderBtnHeight * .5){
                    top = this.height - this._sliderBtnHeight * .5;
                }
                var step = this.marks.get(0).getBoundingClientRect().height,
                    mesc = top % step;
                if(this.options.isMark){
                    top = step * Math.round(top / step) - ( Math.abs(mesc) < step ? 0 : step);
                    if(top >= this.height){
                        mesc = this.height / step;
                        top = this.height - this._sliderBtnHeight * .5;
                    }else{
                        mesc = top / step;
                    }
                }else{
                    mesc = Math.round(top / step);
                }
                return {top: top, index: mesc};
            },
            getLeft: function(clientX){
                //碰撞检测
                var boxLeft = this.box.offset().left,
                    left = clientX - boxLeft;
                if(clientX <= boxLeft){
                    left = 0;
                }
                if(clientX >= boxLeft + this.width - this._sliderBtnWidth * .5){
                    left = this.width - this._sliderBtnWidth * .5;
                }
                var step = this.marks.get(0).getBoundingClientRect().width,
                    mesc = left % step;
                if(this.options.isMark){
                    left = step * Math.round(left / step) - ( Math.abs(mesc) < step ? 0 : step);
                    if(left >= this.width){
                        mesc = this.width / step;
                        left = this.width - this._sliderBtnWidth * .5;
                    }else{
                        mesc = left / step;
                    }
                }else{
                    mesc = Math.round(left / step);
                }
                return {left: left, index: mesc};
            },
            _setHandler: function(evt, fn){
                var offset = 0;
                if(this.direction === 'horizontal'){
                    offset = this.getLeft(evt.clientX).left;
                    fn.call(this, this._current, offset, evt.clientX);
                }else{
                    offset = this.getTop(evt.clientY).top;
                    fn.call(this, this._current, offset, evt.clientY);
                }
            },
            _moveSlider: function(evt){
                if(this.direction === 'horizontal'){
                    this._setSlider(evt.clientX);
                }else{
                    this._setSlider(evt.clientY);
                }
            },
            _setSlider: function(client){
                //去除包含样式
                this.marks.removeClass('on-include on-current');
                //碰撞检测
                var obj, index;
                if(this.direction === 'horizontal'){
                    obj = this.getLeft(client);
                    index = obj.index;
                    this.sliderBtn.css('left', obj.left - 1);
                }else{
                    obj = this.getTop(client);
                    index = obj.index;
                    this.sliderBtn.css('top', obj.top - 1);
                }
                //添加包含样式
                this.box.find('ul>li:lt('+ index +')').addClass('on-include');
                $(this.marks[index - 1]).addClass('on-current');
                this._current = this.marks[index - 1];
                this.options.onMove.call(this, this._current, client);
                return this;
            },
            setTop: function(top){
                top = this.box.offset().top + top;
                this._setSlider(top);
            },
            setLeft: function(left){
                left = this.box.offset().left + left;
                this._setSlider(left);
            },
            getIndex: function(){
                return this._current;
            }
        };

        var SeekHBar = function(id, options){
            return new SeekBar(id, 'horizontal', options);
        };

        var SeekVBar = function(id, options){
            return new SeekBar(id, 'vertical', options);
        };

        root.SeekBar = SeekBar;
        root.SeekHBar = SeekHBar;
        root.SeekVBar = SeekVBar;
    });
}).call(this);
