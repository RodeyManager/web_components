/**
 * Created by r9luox on 2016/8/1.
 */

;(function(){

    var root = this,
        empty = function(){},
        defaults = {
            onSelectDay: empty,
            onSelectYear: empty,
            onClear: empty,
            onComplate: empty
        };
    var SYDatePicker = function(id, options){
        this.options = $.extend({}, defaults, options);
        this.id = id || this.options.id || (function(){throw new Error('No match input date element id')})();
        this.input = $('#' + this.id.replace(/^#/i, ''));
        this._inputVal = this.getInputVal();
        this._ms = [
            [1,3,5,7,8,10,11],
            [2,4,6,9,12],
            [2]
        ];
        this._init();
    };

    SYDatePicker.prototype = {
        _init: function(){
            this.box = $('#sy-date-picker');
            this.dateBox = this.box.find('.sy-date-days');
            this.header = this.box.find('.sy-date-header');
            this.footer = this.box.find('.sy-date-footer');
            this.currentElm = this.header.find('.sy-current-date');
            this.yearsBox = this.box.find('.sy-years');
            this.currentElm.width(this.box.width() - 2 * this.box.find('.sy-btn').width());
            this._render();
            this._setPosition();
            this._resize();
            this._show();
        },
        _render: function(){
            this._insertCurrentDate();
            this._createDays();
            this._addEvent();
            this.options.showTime && this._showTime();
        },
        _addEvent: function(){
            var self = this;
            this.header.find('.sy-prev').off().on('click', $.proxy(this, '_prevMonthHandler'));
            this.header.find('.sy-next').off().on('click', $.proxy(this, '_nextMonthHandler'));
            this.currentElm.off().on('click', $.proxy(this, '_openYearHandler'));
            this.footer.find('.sy-clear-btn').off().on('click', $.proxy(this, '_clearHandler'));
            this.footer.find('.sy-now-btn').off().on('click', $.proxy(this, '_nowHandler'));
            this.box.on('mouseover', function(evt){
                self._mouseover = true;
            }).on('mouseout', function(evt){
                self._mouseover = false;
            });
            $(document).on('click', function(){
                if(self._mouseover) return;
                self._hide();
            });
            $(window).on('resize scroll', function(){
                self._setPosition();
            });
        },
        //插入当前日期
        _insertCurrentDate: function(){
            //如果输入元素中已经存在值
            this._inputVal = this.getInputVal();
            var date = new Date();
            if(this._inputVal && '' != this._inputVal){
                date = this.getDate(this._inputVal.replace(/([^\d]+)/gi, function(m){ return '/'; }));
            }
            this.year = date.getFullYear();
            this.month = date.getMonth() + 1;
            this.date = date.getDate();
            this._setCurrentDate();
        },
        _setCurrentDate: function(year, month){
            this.currentElm.html((year || this.year) + '年' + (month || this.month) + '月');
        },
        //获取当月的天数
        _getDays: function(year, month){
            year = year || this.year;
            month = month || this.month;
            if(this._ms[1].indexOf(month) !== -1){
                return 30;
            }
            if(this._ms[2] == month){
                return this._isNonYear(year) ? 29 : 28;
            }
            return 31;
        },
        //创建日期表
        _createDays: function(){
            //获取1号对应的星期
            var days = this._getDays(),
                _tempDate = new Date(this.year + '/' + this.month + '/1'),
                _week = _tempDate.getDay(),
                lis = '', d = '', tmp, attrs = '';
            //上一月的余留
            var _tempDateObject = this._getDateObject(this.year, this.month - 1);
            var _monthDays = this._getDays(_tempDateObject.getFullYear(), _tempDateObject.getMonth() + 1);
            for(var i = _week - 1; i >= 0; --i){
                d = _monthDays - i;
                attrs = ' data-date="' + (_tempDateObject.getFullYear() + '-' + (_tempDateObject.getMonth() + 1) + '-' + d) + '" class="sy-none"';
                lis += '<li'+ attrs +'>' + d + '</li>';
            }
            //当前月
            for(var j = 0; j < days; ++j){
                d = j + 1;
                attrs = ' data-date="'+ (this.year + '-' + this.month + '-' + d) + '"';
                if(j == this.date - 1){
                    attrs += ' class="sy-active"';
                }else{
                    tmp = (new Date(this.year + '/' + this.month + '/' + d)).getDay();
                    if([0, 6].indexOf(tmp) !== -1){
                        attrs += ' class="sy-break"';
                    }else{
                        attrs += '';
                    }
                }
                lis += '<li'+ attrs +'>' + d + '</li>';
            }
            //下个月超出
            _tempDateObject = this._getDateObject(this.year, this.month + 1);
            for(var k = 0, len = 42 - _week - days; k < len; ++k){
                d = k + 1;
                attrs = ' data-date="' + (_tempDateObject.getFullYear() + '-' + (_tempDateObject.getMonth() + 1) + '-' + d) + '" class="sy-none"';
                lis += '<li'+ attrs +'>' + d + '</li>';
            }

            this.dateBox.html(lis);
            this.daysLis = this.dateBox.find('li');
            this.dateBox.undelegate('li', 'click', $.proxy(this, '_dayHandler'))
                        .delegate('li', 'click', $.proxy(this, '_dayHandler'));
        },
        _getDateObject: function(year, month){
            if(month > 12){
                month = 1;
                year++;
            }else if(month < 1){
                month = 1;
                year--;
            }
            return new Date(year + '/' + month);
        },
        //创建年份表
        _createYears: function(){
            if(!this._selectYear)   return;
            var lis = '', i = 0, d = 0,
                years = this.yearsBox.find('li');
            for(; i < 12; ++i){
                d = i + this.year - 12;
                if(years[0]){
                    years.eq(i).text(d);
                }else{
                    lis += '<li>'+ d +'</li>';
                }

            }
            for(i = 0; i < 13; ++i){
                d = i + this.year;
                if(years[0]){
                    years.eq(12 + i).text(d);
                }else{
                    lis += '<li'+ (i == 0 ? ' class="sy-active"' : '') +'>'+ d +'</li>';
                }
            }
            if(!years[0]){
                this.yearsBox.find('ul').html(lis);
            }else{
                this._updateActiveYear();
            }
            this.yearsBox.undelegate('li', 'click', $.proxy(this, '_selectYearHandler'))
                        .delegate('li', 'click', $.proxy(this, '_selectYearHandler'));
        },
        _updateYears: function(){
            var years = this.yearsBox.find('li'),
                first = parseInt(years.eq(0).text(), 10),
                last = parseInt(years.eq(years.length - 1).text(), 10);

            if(this.year < first + 2 || this.year > last - 2){
                this._createYears();
            }
            this._updateActiveYear();
        },
        _updateActiveYear: function(){
            var years = this.yearsBox.find('li');
            years.removeClass('sy-active');
            for(var i = 0, len = years.length; i < len; ++i){
                if(years.eq(i).text() == this.year){
                    years.eq(i).addClass('sy-active');
                    break;
                }
            }
        },
        //判断平年、润年
        _isNonYear: function(year){
            year = year || this.year;
            return (0 == year % 4 && (year % 100 != 0 || year % 400 == 0));
        },
        _fm: function(n){
            return n < 10 ? '0' + n : n;
        },
        _showTime: function(){
            var self = this,
                $time = this.footer.find('.sy-time'),
                date = new Date();
            $time.html(this._fm(date.getHours()) + ' : ' + this._fm(date.getMinutes()) + ' : ' + this._fm(date.getSeconds()));
            this._timeStin = setInterval(function(){
                date = new Date();
                $time.html(self._fm(date.getHours()) + ' : ' + self._fm(date.getMinutes()) + ' : ' + self._fm(date.getSeconds()));
            }, 1000);

        },
        _show: function(){
            this.box.show();
        },
        _hide: function(){
            clearInterval(this._timeStin);
            this._selectYear = false;
            this._timeStin = null;
            this.yearsBox.hide();
            this.box.hide();
        },
        _setPosition: function(){
            var offset = this.input[0].getBoundingClientRect() || this.input.offset();
            this.box.css({
                top: offset.top + this.input.height(),
                left: offset.left
            });
        },
        _resize: function(){
            var self = this;
            window.onresize = function(){
                self._setPosition();
            };
        },
        //选择日期回调
        _dayHandler: function(evt){
            evt.preventDefault();
            evt.stopPropagation();
            var $target = $(evt.currentTarget || evt.target),
                minDate = this.options.minDate,
                maxDate = this.options.maxDate;
            this.date = parseInt($target.text(), 10);
            var _tempDate = new Date($target.attr('data-date').replace('-', '/'));
            if((minDate && _tempDate - minDate < 0) || (maxDate && _tempDate - maxDate > 0)){
                return false;
            }
            this.daysLis.removeClass('sy-active');
            $target.addClass('sy-active');
            this.options.onSelectDay.call(this, this.date);
            this.setInputVal($target.attr('data-date'));
            this._hide();
        },
        _prevMonthHandler: function(evt){
            this.month--;
            if(this.month < 1){
                this.month = 1;
                this.year--;
                this._selectYear && this._updateYears();
            }
            this._setCurrentDate(this.year, this.month);
            this._createDays();
        },
        _nextMonthHandler: function(evt){
            this.month++;
            if(this.month > 12){
                this.month = 1;
                this.year++;
                this._selectYear && this._updateYears();
            }
            this._setCurrentDate(this.year, this.month);
            this._createDays();
        },
        _clearHandler: function(evt){
            if(/INPUT|TEXTAREA/i.test(this.input[0].tagName)){
                this.input.val('');
            }else{
                this.input.text('');
            }
            this.options.onClear.call(this);
        },
        _nowHandler: function(){
            var date = new Date();
            this.setInputVal(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
            this._hide();
            this.options.onComplate.call(this);
        },
        _openYearHandler: function(evt){
            this.yearsBox.show();
            this._selectYear = true;
            this._createYears();
        },
        _selectYearHandler: function(evt){
            this.yearsBox.find('li').removeClass('sy-active');
            target = (evt.currentTarget || evt.target);
            $(target).addClass('sy-active');
            this.year = parseInt(target.textContent);
            this.yearsBox.hide();
            this._setCurrentDate(this.year, this.month);
            this._createDays();
            this.options.onSelectYear.call(this, this.year);
        },

        //public
        getInputVal: function(){
            var _value;
            if(/INPUT|TEXTAREA/i.test(this.input[0].tagName)){
                _value = this.input.val();
            }else{
                _value = this.input.text();
            }
            return _value;
        },
        setInputVal: function(val){
            if(this.options.format){
                val = SYDatePicker.format(val.replace('-', '/'), this.options.format);
            }
            if(this.options.formatCN){
                val = SYDatePicker.formatCN(val.replace('-', '/'), this.options.formatCN);
            }
            if(/INPUT|TEXTAREA/i.test(this.input[0].tagName)){
                this.input.val(val);
            }else{
                this.input.text(val);
            }
        },
        getDate: function(date){
            if(Object.prototype.toString.call(date) === '[object Date]'){
                return date;
            }else{
                return /^\d+$/gi.test(date) ? new Date(date) : new Date(date.replace(/[-.,\/]/gi, '/'));
            }
        },
        setMinDate: function(date){
            this.options.minDate = date;
        },
        setMaxDate: function(date){
            this.options.maxDate = date;
        },
        open: function(){
            this._render();
            this._show();
            return this;
        },
        close: function(){
            this._hide();
            return this;
        }
    };

    //格式化
    SYDatePicker.format = function(date, format){
        format = format || 'yyyy-mm-dd hh:ii:ss';
        date = (/^\d+$/gi.test(date) || /\d+\/+/gi.test(date)) ? new Date(date) : Object.prototype.toString.call(date) === '[object Date]' ? date : null;
        if(!date)   return null;
        format = format.replace(/(y+)/i, function(m){
                var year = '' + date.getFullYear();
                return m.length >= 4 ? year : year.substr(m.length);
            }).replace(/(m+)/i, function(m){
                return _toFormat(m, date.getMonth() + 1);
            }).replace(/(d+)/i, function(m){
                return _toFormat(m, date.getDate());
            }).replace(/(h+)/i, function(m){
                return _toFormat(m, date.getHours());
            }).replace(/(i+)/i, function(m){
                return _toFormat(m, date.getMinutes());
            }).replace(/(s+)/i, function(m){
                return _toFormat(m, date.getSeconds());
            });

        function _toFormat(m, val){
            return m.length > 1 ? (val < 10 ? '0' + val : val) : val;
        }

        return format;
    };
    SYDatePicker.formatCN = function(date, format){
        var fs = ['年', '月', '日', '时', '分', '秒', '毫秒'],
            ds = SYDatePicker.format(date, format).split(/[-:\s]+/gi);
        if(!ds || ds.length === 0)  return '';
        for(var i = 0; i < ds.length; ++i){
            ds[i] = (i === 3 ? ' ' : '') + ds[i] + fs[i];
        }
        return ds.join('');
    };

    root.SYDatePicker = SYDatePicker;

}).call(this);
