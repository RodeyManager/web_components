/**
 * Created by r9luox on 2016/8/4.
 */

;(function(){
    'use strict';
    var root = this,
        empty = function(){},
        effects = { 'fade': ['fadeIn', 'fadeOut'], 'slide': ['slideDown', 'slideUp'] },
        defaults = {
            multiple: false,
            itemTemplate: '<li data-value="{@id}" title="{@name}">{@name}</li>',
            duration: 'fast',
            onChange: empty
        },
        boxHtml = '<div class="ui-selector"><ul class="ui-s-body"></ul></div>';

    var UISelector = function(id, options){
        this.options = $.extend({}, defaults, options);
        this.options.id = id.replace(/^#/i, '');
        this.input = $('#' + this.options.id);
        this.selected = [];
        this._init();
    };
    UISelector.prototype = {
        _init: function(){
            this._insertBox();
            this.options.multiple && this.box.addClass('ui-multiple');
            this._setPosition();
            this.render();
            this._addEvent();
        },
        _insertBox: function(){
            var boxId = 'ui-selector-' + this.options.id;
            this.box = $('#' + boxId);
            if(!this.box[0]){
                this.box = $(boxHtml).attr('id', boxId);
                $('body').append(this.box);
                this.body = this.box.find('.ui-s-body');
            }
        },
        //初始值
        _insertDefaults: function(){
            var vs = (this._getValue() || '').split(/[_，,\\|-]/gi);
            if(vs.length === 0) return;
            var items = this.body.find('li'), $item;
            $.each(items, function(index, item){
                $item = items.eq(index);
                (vs.indexOf($item.text()) !== -1) && $item.addClass('ui-s-active');
            });

        },
        _setPosition: function(){
            var offset = this.input[0].getBoundingClientRect() || this.input.offset();
            this.box.css({
                'left': offset.left,
                'top': offset.top + this.input.height()
            });
        },
        _addEvent: function(){
            var self = this;
            this.box.undelegate('li', 'click', $.proxy(this, '_onChangeHandler'))
                .delegate('li', 'click', $.proxy(this, '_onChangeHandler'));
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
        _getValue: function(){
            if(/INPUT|TEXTAREA/gi.test(this.input[0].tagName)){
                return this.input.val();
            }else{
                return this.input.text();
            }
        },
        _setValue: function(value, attr){
            if(/INPUT|TEXTAREA/gi.test(this.input[0].tagName)){
                this.input.val(value);
            }else{
                this.input.text(value);
            }
            this.input.attr('data-value', attr);
        },
        _updates: function(){
            var items = this.body.find('.ui-s-active'), item;
            var ts = '', vs = '';
            for(var i = 0, len = items.length; i < len; ++i){
                item = items[i];
                this.selected.indexOf(item) === -1 && this.selected.push(item);
                ts += '，' + item.getAttribute('data-value');
                vs += '，' + item.textContent;
            }
            this._setValue(vs.substr(1), ts.substr(1));

        },
        _definedMethods: function(obj){
            var self = this, method = '';
            for(var k in obj){
                method = 'getItemFor' + k[0].toUpperCase() + k.substr(1);
                self.__proto__[method] = (function(k){
                    return function(v){
                        return _get(k, v);
                    }
                })(k);
            }
            function _get(k, v){
                for(var i = 0, len = self.options.data.length; i < len; ++i){
                    if(self.options.data[i][k] == v){
                        return self.options.data[i];
                    }
                }
            }

        },
        _show: function(){
            var effect = 'show';
            if(this.options.animate && effects[this.options.animate]){
                effect = effects[this.options.animate][0];
                this.box[effect](this.options.duration);
            }else{
                this.box[effect]();
            }
        },
        _hide: function(){
            this.selected = [];
            this._mouseover = false;
            var effect = 'hide';
            if(this.options.animate && effects[this.options.animate]){
                effect = effects[this.options.animate][1];
                this.box[effect](this.options.duration);
            }else{
                this.box[effect]();
            }
        },
        _onChangeHandler: function(evt){
            evt.preventDefault();
            evt.stopPropagation();
            var $target = $(evt.currentTarget || evt.target),
                attr = $target.attr('data-value'),
                name = $target.text();
            //是否多选
            if(this.options.multiple){
                //this.body.find('li').removeClass('ui-s-active');
                $target.toggleClass('ui-s-active');
                this._updates();
                return false;
            }
            this._setValue(name, attr);
            this.options.onChange.call(this, $target[0]);
            !this.options.multiple && this._hide();
        },
        open: function(){
            $('.ui-selector').hide();
            this._show();
        },
        close: function(){
            this._hide();
        },
        render: function(data){
            data = data || this.options.data;
            if(!$.isArray(data) || data.length === 0)   return;
            //根据对象属性自动生成方法
            this._definedMethods(data[0]);
            var li = '', item;
            for(var i = 0, len = data.length; i < len; ++i){
                item = data[i];
                li = this.options.itemTemplate.replace(/\{@([\w\d_]+?)\}/gi, function(match, attr){
                    return item[attr];
                });
                if(i === len - 1){
                    li = $(li).addClass('bd-none');
                }
                this.body.append(li);
            }
            this.box.html(this.body);
            //处理默认
            (this.options.multiple && this._getValue()) && this._insertDefaults();
        }
    };

    root.UISelector = UISelector;

}).call(this);