;(function(){

    var SearchBox = function(elementId){
        this.box = document.getElementById(elementId);
        this.input = this.box.getElementsByTagName('input')[0];
        this.button = this.box.getElementsByTagName('button')[0];
        this.value = this.input.value;
    };
    SearchBox.prototype = {
        _addEvent: function(fn){
            var self = this;
            this.button.onclick = function(evt){
                evt.preventDefault();
                self.value = self.input.value;
                'function' === typeof fn && fn.call(self, self.input.value);
            };
        },
        search: function(fn){
            this._addEvent(fn);
        }
    };
    this.SearchBox = SearchBox;

}).call(this);
