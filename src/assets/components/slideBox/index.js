/**
 * Created by r9luox on 2016/7/1.
 */

;(function(){

    var root = this,
        isTouch = 'ontouchstart' in window,
        defaults = {
            //容器宽度
            width: 278,
            //容器高度，垂直滚动时用
            height: 0,
            //是否自动滚动
            autoPlay: true,
            //间隔时间
            delay: 3,
            //滚动动画持续时长
            duration: 350,
            //是否显示索引按钮
            showIndexBtns: true,
            //滚动方向
            direction: 'horizontal' //默认横向 vertical: 纵向
        };

    $(function(){

        var SlideBox = function(eid, opts){
            this.box = $(eid);
            this.listBox = this.box.find('.slide-list');
            this.prevBtn = this.box.find('.slide-prev');
            this.nextBtn = this.box.find('.slide-next');
            this._btns = this.box.find('.slide-btn');
            this.options = $.extend({}, defaults, opts);
            this.data = this.options.data;
            this.width = this.options.width;
            this.height = this.options.height;
            this.index = 0;
            this._stin = null;
            this._stim = null;
            this.isClick = false;
            this._init();
        };

        SlideBox.prototype = {
            _init: function(){
                //根据数据长度设置列表容器宽度
                this.setListBoxWidth();
                //渲染列表
                this.render(this.data);
                //开始播放切换
                this.options.autoPlay && this.play();
                //是否显示按钮索引
                this.options.showIndexBtns && this._createIndexBtns();
                //按钮控制
                this._addBtnEvent();
            },
            setListBoxWidth: function(){
                if(!this.data || !this.data.length || 0 === this.data.length)   return;
                this.options.direction == 'horizontal' && this.listBox.css('width', this.width * this.data.length);
                this.options.direction == 'vertical' && this.box.css({ 'width': this.width, 'height': this.height});
            },
            render: function(data){
                var html = SYST.T.render('slide-item-tpl', { data: data || this.data });
                this.listBox.html(html);
            },
            play: function(){
                var self = this;
                if(this.isClick || !this.options.autoPlay)    return;
                this._stin = setInterval(function(){
                    self.index++;
                    if(self.index >= self.data.length){
                        self.index = 0;
                    }
                    self.setDisabled();
                    self.setIndexBtns();
                    self.translate(-self.index * self.width, -self.index * self.height, 0, self.options.duration);
                }, this.options.delay * 1000);
            },
            stop: function(){
                clearInterval(this._stin);
            },
            translate: function(x, y, z, duration){
                this.options.direction == 'vertical' && (x = 0);
                this.options.direction == 'horizontal' && (y = 0);
                var translate3d = 'translate3d('+ x +'px,'+ y +'px,'+ z +'px)';
                this._transition(duration);
                this.listBox.css({
                    '-webkit-transform': translate3d,
                    '-moz-transform': translate3d,
                    '-ms-transform': translate3d,
                    'transform': translate3d
                });
            },
            _transition: function(duration){
                duration = duration + 'ms';
                this.listBox.css({
                    '-webkit-transition-duration': duration,
                    '-moz-transition-duration': duration,
                    '-ms-transition-duration': duration,
                    'transition-duration': duration
                });
            },
            _getTranslate: function(){
                var tranform = this.listBox[0].style['transform' || 'WebkitTransform' || 'MozTransform' || 'msTransform'];
                tranform = tranform.replace(/\(|\)|translate(3d)+?/gi, '').match(/(-*\d+)+?/gi);
                return tranform;
            },
            setIndexBtns: function(){
                if(this.options.showIndexBtns){
                    this.indexBtnsBox.find('li').removeClass('active');
                    this.indexBtnsBox.find('li:eq('+ this.index +')').addClass('active');
                }
            },
            _play: function(){
                var self = this;
                this.setDisabled();
                self.setIndexBtns();
                this.translate(-this.index * this.width, -this.index * this.height, 0, this.options.duration);
                this._stim = setTimeout(function(){
                    clearTimeout(self._stim);
                    self.isClick = false;
                    self.play();
                }, 350);

            },
            _addBtnEvent: function(){
                var self = this;
                this._btns.click(function(){
                    if($(this).hasClass('disabled'))    return;
                    self.stop();
                    self.isClick = true;
                    if($(this).hasClass('slide-prev')){
                        //上一页
                        self.index--;
                    }else{
                        //下一页
                        self.index++;
                    }
                    if(self.index < 0 || self.index >= self.data.length)  self.index = 0;
                    self._play();
                });
                if(isTouch){
                    this.box.on('touchstart', $.proxy(this, '_onStart'));
                }
            },
            _onStart: function(evt){
                var $target = $(evt.target);
                if($target.attr('data-index') || $target.hasClass('slide-btn')) return;
                evt = this._getEvent(evt);
                this.box.on('touchmove', $.proxy(this, '_onMove'));
                this.box.on('touchend', $.proxy(this, '_onEnd'));
                this._startPosition = {
                    x: evt.clientX,
                    y: evt.clientY
                };
                this._startTime = (new Date()).getTime();
                var transform = this._getTranslate();
                this._left = transform && parseFloat(transform[0], 10) || 0;
                this._top = transform && parseFloat(transform[1], 10) || 0;
                this.translate(this._left, this._top, 0, 0);
                this.isClick = true;
                this.stop();
            },
            _onMove: function(evt){
                evt = this._getEvent(evt);
                this.isClick = true;
                this.stop();
                var offset = {
                        x: evt.clientX - this._startPosition.x,
                        y: evt.clientY - this._startPosition.y
                    };
                this.translate(this._left + offset.x, this._top + offset.y, 0, 0);
            },
            _onEnd: function(evt){
                this.box.off('touchmove', $.proxy(this, '_onMove'));
                this.box.off('touchend', $.proxy(this, '_onEnd'));
                evt = this._getEvent(evt);
                this.isClick = true;
                this.stop();
                var offset = {
                        x: evt.clientX - this._startPosition.x,
                        y: evt.clientX - this._startPosition.y
                    },
                    offsetTime = (new Date()).getTime() - this._startTime;
                if((Math.abs(offset.x) > this.width * .5 || Math.abs(offset.y) > this.height * .5)
                    || (offsetTime > 100 && offsetTime < 300)){
                    if(offset.x < 0 || offset.y < 0)  {
                        this.index++;
                    }
                    else if(offset.x > 0 || offset.y > 0) {
                        this.index--;
                    }
                    if(this.index < 0 || this.index >= this.data.length)  this.index = 0;
                    this._play();
                }else{
                    this._play();
                }

            },
            //MouseEvent || TouchEvent
            _getEvent: function(evt){
                return isTouch ? evt.originalEvent.changedTouches[0] : evt;
            },
            setDisabled: function(){
                if(this.index <= 0){
                    this._setDisabled(this.prevBtn);
                }
                else if(this.index == this.data.length - 1){
                    this._setDisabled(this.nextBtn);
                }
                else{
                    this._setDisabled();
                }
            },
            _setDisabled: function($el){
                this._btns.removeClass('disabled');
                $el && $el.addClass('disabled');
            },
            _createIndexBtns: function(){
                var self = this, btnsStr = '';
                this.indexBtnsBox = this.box.find('.slide-index-btns');
                for(var i = 0, len = this.data.length; i < len; ++i){
                    btnsStr += '<li class="'+ (i == this.index ? 'active' : '') +'" data-index="'+ i +'"></li>';
                }
                this.indexBtnsBox.html(btnsStr);
                this.indexBtnsBox.delegate('li', 'click', function(evt){
                    evt.preventDefault();
                    evt.stopPropagation();
                    self.isClick = true;
                    self.indexBtnsBox.find('li').removeClass('active');
                    $(this).addClass('active');
                    self.index = this.getAttribute('data-index');
                    self.stop();
                    self._play();
                });
            }
        };

        root.SlideBox = SlideBox;

    });

}).call(this);
