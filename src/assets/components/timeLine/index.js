/**
 * Created by r9luox on 2016/7/4.
 */
;(function(){
    var root = this,
        isTouch = 'ontouchstart' in window,
        empty = function(){},
        defaults = {
            //开始年
            upYear: 1990,
            //结束年
            downYear: 2050,
            //选择年或者月份事件回调
            onSelect: empty,
            //选择年事件回调
            onSelectYear: empty,
            //选择月份事件回调
            onSelectMonth: empty,
            //选择日事件回调
            onSelectDate: empty,
            //滚动前触发
            onMoveStart: empty,
            //滚动中触发
            onMove: empty,
            //滚动停止后触发
            onMoveEnd: empty,
            //选中年时的样式（整个年元素样式）
            selectYearClass: null,
            //选中月份时的样式
            selectMonthClass: null,
            //刻度之间的间隙
            gap: 20
        },
        indexOf = function(val, arr){
            for(var i = 0; i < arr.length; ++i){
                if(arr[i] == val){
                    return i;
                }
            }
            return -1;
        };

    $(function(){
        var TimeLine = function(id, options){
            this.options = $.extend({}, defaults, options);
            this.box = $('#' + (id || this.options.id).replace(/^#/i, ''));
            this.boxLine = this.box.find('.box-line');
            this.boxYear = this.boxLine.find('.year-line');
            this.boxDay = this.boxLine.find('.days-line');
            this.boxYear.hide();
            this._init();
        };

        TimeLine.prototype = {
            _init: function(){
                this._render();
                this._addEvent();
            },
            _render: function(){
                var date = new Date(),
                    year = date.getFullYear(),
                    month = date.getMonth(),
                    day = date.getDate(),
                    gapTotal = 0,
                    years = '', width = 0, centerWidth = 0;
                for(var i = this.options.upYear; i < this.options.downYear + 1; ++i){
                    years += '<div data-year="'+ i +'"' + (i == year ? ' class="curr"><i class="curr">' : '<div><i>') + i + '</i>';
                    for(var j = 0; j < 12; ++j){
                        years += '<span data-month="'+ (j + 1) +'"' + ((j == month && i == year) ? ' class="curr">' : '>') + (j + 1) +'</span>';
                    }
                    years += '</div>';
                }
                this.boxYear.html(years);
                gapTotal = this.options.gap * 12;
                width = (this.options.downYear - this.options.upYear + 1) * gapTotal;
                centerWidth = (year - this.options.upYear) * gapTotal - this.boxLine.width() * 0.5;
                this.boxYear.width(width);
                this.boxYear.show();
                this._transition(0, -centerWidth);
            },
            //显示每一天
            _createDays: function($element, year, month){
                var days = 30, dayStr = '';
                if(indexOf(month, [1,3,5,7,8,10,12]) !== -1){
                    days = 31;
                }else if(2 == month){
                    days = (0 == year % 4 && (year % 100 !=0 || year % 400 == 0)) ? 29 : 28;
                }
                for(var i = 1; i < days + 1; ++i){
                    dayStr += '<span data-day="'+ i +'">' + i + '</span>';
                }
                dayStr += '';
                this.boxYear.find('span').removeClass('disabled').removeAttr('style');
                this.boxYear.width(this.boxYear.width() + days * this.options.gap);
                $element.addClass('disabled').css('width', days * this.options.gap);
                this.boxDay.html(dayStr);
                $element.append(this.boxDay);

            },
            _clearnDays: function($element){
                $element.removeClass('disabled').removeAttr('style').html($element.attr('data-month'));
            },
            _addEvent: function(){
                if(isTouch){
                    this.boxYear.on('touchstart', $.proxy(this, '_onStart'));
                }else{
                    this.boxYear.on('mousedown', $.proxy(this, '_onStart'));
                }
                this.boxYear.find('i').on('click', $.proxy(this, '_onClickYearHandler'));
                this.boxYear.find('span').on('click', $.proxy(this, '_onClickMonthHandler'));
                this.box.find('span.time-line-prev-btn').on('click', $.proxy(this, '_onPrev'));
                this.box.find('span.time-line-next-btn').on('click', $.proxy(this, '_onNext'));
                this.boxDay.delegate('span', 'click', $.proxy(this, '_onClickDayHandler'));

            },
            _onStart: function(evt){
                evt = this._getEvent(evt);
                if(isTouch){
                    this.box.on('touchmove', $.proxy(this, '_onMove'));
                    $(window).on('touchend', $.proxy(this, '_onEnd'));
                }else{
                    this.box.on('mousemove', $.proxy(this, '_onMove'));
                    $(window).on('mouseup', $.proxy(this, '_onEnd'));
                }
                this.startX = evt.clientX;
                this.offsetLeft = this.boxYear.position().left;
                this.startTime = (new Date()).getTime();
                this._transition(0, this.offsetLeft);
            },
            _onMove: function(evt){
                evt = this._getEvent(evt);
                var offset = evt.clientX - this.startX;
                this._transition(0, offset + this.offsetLeft);
            },
            _onEnd: function(evt){
                evt = this._getEvent(evt);
                var offsetTime = (new Date()).getTime() - this.startTime,
                    offset = evt.clientX - this.startX;
                if(offsetTime >= 300){
                    offsetTime = 0;
                    offset = offset + this.offsetLeft;
                }else{
                    offset = offset * 2 + this.offsetLeft;
                }
                this._transition(offsetTime, offset);
                if(isTouch){
                    this.box.off('touchmove', $.proxy(this, '_onMove'));
                    $(window).off('touchend', $.proxy(this, '_onEnd'));
                }else{
                    this.box.off('mousemove', $.proxy(this, '_onMove'));
                    $(window).off('mouseup', $.proxy(this, '_onEnd'));
                }
            },
            _transition: function(duration, left){
                var maxWidth = -(this.boxYear.width() - this.box.width());
                duration *= 2;
                left = left > 0 ? 0 : (left < maxWidth) ? maxWidth : left;
                this.boxYear.css({
                    '-webkit-transition-duration': duration + 'ms',
                    '-moz-transition-duration': duration + 'ms',
                    '-ms-transition-duration': duration + 'ms',
                    'transition-duration': duration + 'ms',
                    'left': left
                });
            },
            //MouseEvent || TouchEvent
            _getEvent: function(evt){
                return isTouch ? evt.originalEvent.changedTouches[0] : evt;
            },
            //单击年事件回调
            _onClickYearHandler: function(evt){
                var $target = $(evt.currentTarget || evt.target),
                    $parent = $target.parent(),
                    year = $target.text();
                this.options.onSelectYear.call(this, year, $target[0]);
                this.options.onSelect.call(this, year, 1, 1, $target[0]);
                //年选择添加css class
                var selectYearClass = this.options.selectYearClass;
                if(selectYearClass != null){
                    this.boxYear.find('div').removeClass(selectYearClass);
                    $target.parent().addClass(selectYearClass);
                }
                //自动靠左
                if($parent.offset().left + $parent.width() > this.box.offset().left + this.box.width()){
                    this._transition(200, this.boxYear.position().left - $parent.width());
                }
                //自动靠右
                if($parent.offset().left - 100 < this.box.offset().left){
                    this._transition(200, this.boxYear.position().left + $parent.width());
                }

            },
            //单击月份事件回调
            _onClickMonthHandler: function(evt){
                var $target = $(evt.currentTarget || evt.target),
                    $parent = $target.parent(),
                    year = $parent.attr('data-year'),
                    month = $target.attr('data-month');
                if($target.hasClass('disabled')) return;
                this.options.onSelectMonth.call(this, month, $target[0]);
                this.options.onSelect.call(this, year, month, 1, $target[0]);
                //月份选择添加css class
                var selectMonthClass = this.options.selectMonthClass;
                if(selectMonthClass != null){
                    this.boxYear.find('span').removeClass(selectMonthClass);
                    $target.addClass(selectMonthClass);
                }
                //console.log($target.offset().left, this.box.offset().left);
                //if($target.offset().left < this.box.offset().left + $target.width() * 3){
                //    this._transition(200, this.boxYear.position().left + $parent.width() *.3);
                //}
                //if($target.offset().left > this.box.offset().left + this.box.width() - $target.width()){
                //    this._transition(200, this.boxYear.position().left - $parent.width() *.3);
                //}
                //显示当月每一天
                this._createDays($target, year, month);
            },
            _onClickDayHandler: function(evt){
                evt.preventDefault();
                evt.stopPropagation();
                var $target = $(evt.currentTarget || evt.target),
                    $month = $target.parent().parent(),
                    $year = $month.parent(),
                    year = $year.attr('data-year'),
                    month = $month.attr('data-month'),
                    day = $target.text();
                this.options.onSelectDate.call(this, day, $target[0]);
                this.options.onSelect.call(this, year, month, day, $target[0]);
            },
            //上一页
            _onPrev: function(evt){
                this._transition(200, this.boxYear.position().left + this.boxLine.width());
            },
            //下一页
            _onNext: function(evt){
                this._transition(200, this.boxYear.position().left - this.boxLine.width());
            }
        };
        root.TimeLine = TimeLine;
    });

}).call(this);