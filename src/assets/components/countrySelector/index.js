/**
 * Created by r9luox on 2016/8/3.
 */

;(function(){
    'use strict';

    var root = this,
        empty = function(){},
        defaults = {
            pageSize: 10,
            page: 1,
            showSelectedBox: true,
            showSearchBox: false,
            realSearch: true,
            showHots: true,
            onClose: empty,
            onOpen: empty,
            onChange: empty,
            onRemove: empty,
            onChangeTab: empty,
            onChangePage: empty,
            onClear: empty
        },
        arrRemove = function(arr, item){
            var index = arr.indexOf(item);
            if(index !== -1){
                arr.splice(index, 1);
            }
            return arr;
        };


    var CountrySelector = function(id, options){
        this.options = $.extend({}, defaults, options);
        this.input = $('#' + (id || this.options.id).replace(/^#/i, ''));
        this.box = $('#select-contry');
        this.selected = [];
        this._init();
    };
    CountrySelector.prototype = {
        _init: function(){
            this.titleElm = this.box.find('.cts-title');
            this.closeBtn = this.box.find('.cts-close-btn');
            this.clearBtn = this.box.find('.cts-clear-btn');
            this.tabs = this.box.find('.cts-tabs>li');
            this.selectedBox = this.box.find('.cts-selected');
            this.searchBox = this.box.find('.cts-search');
            this.searchInput = this.searchBox.find('.cts-search-input');
            this.listBox = this.box.find('.cts-list');
            this.pageBox = this.box.find('.cts-footer');
            this._render();
            this._addEvent();
        },
        _render: function(){
            this._reset();
            this.options.title && this.titleElm.html(this.options.title);
            this.options.showSelectedBox && this.selectedBox.show();
            this.options.showSearchBox && this.searchBox.show();
            this._setPosition();
            this._insertVals();
            this.tabs.removeClass('cts-active');
            this.tabs.eq(0).addClass('cts-active');
            var list = this._getList(this.options.showHots ? 'HOT' : this.tabs.eq(0).attr('data-scope'));
            this._insertList(list);
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
            //选择标签 按照拼音
            this.tabs.on('click', $.proxy(this, '_selectTabHandler'));
            //分页
            this.pageBox.undelegate('a', 'click', $.proxy(this, '_selectPageHandler'))
                .delegate('a', 'click', $.proxy(this, '_selectPageHandler'));
            //选择每个项
            this.listBox.undelegate('input', 'change', $.proxy(this, '_selectCountryHandler'))
                .delegate('input', 'change', $.proxy(this, '_selectCountryHandler'));
            //删除已选择项
            if(this.options.showSelectedBox){
                this.selectedBox.undelegate('.cts-s-item>i', 'click', $.proxy(this, '_removeSelectedHandler'))
                    .delegate('.cts-s-item>i', 'click', $.proxy(this, '_removeSelectedHandler'));
                //全部清除已选项
                this.clearBtn.on('click', $.proxy(this, '_clearSelectedHandler'));
            }
            //搜索
            if(this.options.showSearchBox){
                this.searchBox.find('input').on('keyup', $.proxy(this, '_searchInputHandler'));
                this.searchBox.find('button').on('click', $.proxy(this, '_searchInputHandler'));
            }
            //关闭面板
            this.closeBtn.on('click', $.proxy(this, 'close'));
            this.options.onClick && this.input.on('click', function(evt){
                evt.stopPropagation();
                self.options.onClick.call(this, evt);
                self.open();
            });
            this.box.on('mouseover', function(evt){
                self._mouseover = true;
            }).on('mouseout', function(evt){
                self._mouseover = false;
            });
            $(document).on('click', function(){
                if(self._mouseover) return;
                self.close();
            });
            $(window).on('resize scroll', function(){
                self._setPosition();
            });

        },
        //根据已有值填充
        _insertVals: function(){
            var vs = this._getValue() ? this._getValue().split(/[,，\|-]+\s*/i) : null,
                items = '',
                country;
            this.clearBtn.siblings().remove();
            if('[object Array]' !== Object.prototype.toString.call(vs) || vs.length === 0)
                return;
            for(var i = 0, len = vs.length; i < len; ++i){
                country = CountrySelector.getCountryForName(vs[i]);
                this.selected.push(country);
                items += '<div class="cts-s-item" data-code="'+ country['code'] +'">'+ vs[i] +' <i>X</i></div>';
            }
            this.options.showSelectedBox && this.clearBtn.before(items);
        },
        _insertList: function(list, regx){
            if(!list || !list.length || list.length === 0)  return;
            var item, lis = '',
                i = 0, d = 0,
                len = list.length,
                pageTotal = Math.ceil(len / this.options.pageSize);
            this.options.pageTotal = pageTotal;

            for(; i < len; ++i){
                item = list[i];
                var code = item.code,
                    checked = '',
                    name = item.name,
                    ename = item.ename;
                if(this.selected.indexOf(item) !== -1){
                    checked =  ' checked="checked"';
                }
                if(regx){
                    if(regx.test(name)){
                        name = name.replace(regx, function(match, keyword){
                            return '<em>'+ keyword +'</em>';
                        });
                    }else if(regx.test(ename)){
                        ename = ename.replace(regx, function(match, keyword){
                            return '<em>'+ keyword +'</em>';
                        });
                    }

                }
                lis += '<li><input type="checkbox" id="'+ code +'" name="'+ code +'" data-code="'+ code +'"'+ checked +'/>\n' +
                    '<label for="'+ code +'">'+ name +'('+ ename +')</label></li>';

            }
            this.listBox.html(lis);
            this._showPageList();
            //生产页码
            lis = '';
            for(i = 0; i < pageTotal; ++i){
                d = i + 1;
                lis += '<a href="javascript:void(0)" data-page="'+ d +'" '+ (i === 0 ? 'class="cts-active"' : '') +'>'+ d +'</a>';
            }
            this.pageBox.html(lis);

        },
        _showPageList: function(){
            var lis = this.listBox.find('li');
            lis.hide();
            var prevs = this.options.pageSize * (this.options.page - 1),
                limit = this.options.pageSize * this.options.page;
            //this.listBox.find('li:lt('+ limit +')').css('display', 'inline-block');
            for(var i = 0, len = lis.length; i < len; ++i){
                if(i >= prevs && i < limit){
                    $(lis[i]).css('display', 'inline-block');
                }
            }
        },
        _getValue: function(){
            if(/(INPUT|TEXTAREA)/i.test(this.input[0].tagName)){
                return this.input.val();
            }else{
                return this.text();
            }
        },
        _setValue: function(value){
            var vals;
            if(value != null){
                vals = value;
            }else{
                vals = [];
                for(var i = 0, len = this.selected.length; i < len; ++i){
                    vals.push(this.selected[i]['name']);
                }
                vals = vals.join('，');
            }

            if(/(INPUT|TEXTAREA)/i.test(this.input[0].tagName)){
                this.input.val(vals);
            }else{
                this.text(vals);
            }
        },
        //更新
        _updateSelecteds: function(country, checked){
            if(checked){
                if(this.selected.indexOf(country) === -1){
                    this.options.showSelectedBox && this.clearBtn.before('<div class="cts-s-item" data-code="'+ country.code +'">'+ country.name +' <i>X</i></div>');
                    this.selected.push(country);
                }
            }else{
                if(this.selected.indexOf(country) !== -1){
                    this.options.showSelectedBox && this.selectedBox.find('[data-code="'+ country.code +'"]').remove();
                    this.selected = arrRemove(this.selected, country);
                }
            }
            //console.log(this.selected);
        },
        _updateList: function(country){
            var lists = this.listBox.find('input:checked'),
                input;
            for(var i = 0, len = lists.length; i < len; ++i){
                input = lists[i];
                if(country.code == input.getAttribute('data-code')){
                    input.removeAttribute('checked');
                    input.checked = false;
                    break;
                }
            }
        },
        _getList: function(scope){
            var list = [];
            if(scope == 'HOT'){
                list = CountrySelector.getHots();
            }else{
                list = CountrySelector.getCountries(scope);
            }
            return list;
        },
        _reset: function(){
            this.options.page = 1;
            this.selected = [];
        },
        //handlers
        _selectTabHandler: function(evt){
            var target = evt.currentTarget || evt.target,
                scope = target.getAttribute('data-scope');
            this.tabs.removeClass('cts-active');
            $(target).addClass('cts-active');
            this.options.page = 1;
            this.options.pageTotal = 0;
            this._insertList(this._getList(scope));
            this.options.onChangeTab.call(this, target);
        },
        _selectPageHandler: function(evt){
            this.pageBox.find('a').removeClass('cts-active');
            var target = evt.currentTarget || evt.target;
            $(target).addClass('cts-active');
            this.options.page = parseInt(target.getAttribute('data-page'), 10);
            this._showPageList();
            this.options.onChangePage.call(this, this.options.page);
        },
        _selectCountryHandler: function(evt){
            var target = evt.currentTarget || evt.target;
            var code = target.getAttribute('data-code');
            var country = CountrySelector.getCountryForCode(code);
            this._updateSelecteds(country, target.checked);
            this._setValue();
            this.options.onChange.call(this, country, target);
        },
        _removeSelectedHandler: function(evt){
            var target = evt.currentTarget || evt.target,
                parent = target.parentNode;
            var code = parent.getAttribute('data-code');
            var country = CountrySelector.getCountryForCode(code);
            this._updateSelecteds(country, false);
            this._setValue();
            this._updateList(country);
            this.options.onRemove.call(this, country, target);
        },
        _clearSelectedHandler: function(evt){
            this.selected = [];
            this._setValue('');
            this.clearBtn.siblings().remove();
            this.listBox.find('input').removeAttr('checked').prop('checked', false);
            this.options.onClear.call(this);
        },
        //search
        _searchInputHandler: function(evt){
            if(!this.options.showSearchBox) return;
            var val = this.searchInput.val();
            //Enter key
            if(!this.options.realSearch && evt.type === 'keyup' && evt.keyCode !== 13)  return;
            if(!val || /^[^\w\u4E00-\u9FA5]/gi.test(val))   return;
            var countries = CountrySelector.getCountryIndexOfName(val);
            if(countries.length === 0) return;
            //console.log(countries);

            var len = countries.length;
            this.options.page = 1;
            this.options.pageTotal = Math.ceil(len / this.options.pageSize);
            //console.log(this.options.pageTotal);

            this.tabs.removeClass('cts-active');
            this._insertList(countries, new RegExp('('+ val +')+?', 'i'));

        },
        open: function(){
            if(this.box.css('display') == 'none'){
                this._render();
                this.box.show();
                this.options.onOpen.call(this);
            }
        },
        close: function(){
            this.box.hide();
            this.options.onClose.call(this);
        }

    };
    CountrySelector.countries = _countries_;
    CountrySelector.getCountryForName = function(name){
        for(var i = 0, len = CountrySelector.countries.length; i < len; ++i){
            if(CountrySelector.countries[i].name == name){
                return CountrySelector.countries[i];
            }
        }
    };
    //模糊查找
    CountrySelector.getCountryIndexOfName = function(name){
        var ns = (name || '').split(''), rs = [], country, i = 0, ctsLen = CountrySelector.countries.length;
        if(ns.length === 0) return;

        for(i = 0; i < ctsLen; ++i){
            country = CountrySelector.countries[i];
            //单字符
            if(ns.length === 1){
                for(var j = 0; j < ns.length; ++j){
                    //英文
                    if(/^[a-zA-Z]/gi.test(ns[j]) && country.ename[0] == ns[j] && rs.indexOf(country) === -1){
                        rs.push(country);
                    }
                    //中文
                    else if(/^[\u4E00-\u9FA5]/gi.test(ns[j]) && country.name.indexOf(ns[j]) !== -1 && rs.indexOf(country) === -1){
                        rs.push(country);
                    }
                }
            }
            //多个字符
            else{
                //英文
                if(/^[a-zA-Z]+/gi.test(name) && country.ename.indexOf(name) !== -1 && rs.indexOf(country) === -1){
                    rs.push(country);
                }
                //中文
                else if(/^[\u4E00-\u9FA5]+/gi.test(name) && country.name.indexOf(name) !== -1 && rs.indexOf(country) === -1){
                    rs.push(country);
                }
            }

        }

        return rs;
    };
    CountrySelector.getCountryForCode = function(code){
        for(var i = 0, len = CountrySelector.countries.length; i < len; ++i){
            if(CountrySelector.countries[i].code == code){
                return CountrySelector.countries[i];
            }
        }
    };
    CountrySelector.getHots = function(){
        var hots = [];
        for(var i = 0, len = CountrySelector.countries.length; i < len; ++i){
            if(CountrySelector.countries[i].hot == 'Y'){
                hots.push(CountrySelector.countries[i]);
            }
        }
        return hots;
    };
    //根据指定的firstChar查找
    CountrySelector.getCountries = function(scope){
        var cs = [];
        //scope = scope.toLowerCase().split('-');
        var regx = new RegExp('^['+ scope.toLowerCase() +']');
        for(var i = 0, len = CountrySelector.countries.length; i < len; ++i){
            regx.test(CountrySelector.countries[i].firstChar) && cs.push(CountrySelector.countries[i]);
        }
        return cs;
    };

    root.CountrySelector = CountrySelector;


}).call(this);