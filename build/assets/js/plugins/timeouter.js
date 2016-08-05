/**
 * Created by Rodey on 2015/8/10.
 *
 * use:
 *          var timeouter = new Timeouter({
                time: 10,
                dom: '#send-code-btn',
                before: function(){
                    console.log('....Before....');
                },
                doing: function(){
                    console.log('....Doing....', this.time);
                },
                complate: function(){
                    console.log('...Complate...', this);
                }
            });

 timeouter.start();
 *
 */

;(function(){

    var Timeouter = function (options, targetObject){
        options = options || {};
        options.targetObject = options.targetObject || targetObject || this;
        this.init(options);

    };

    Timeouter.prototype = {
        construct: Timeouter,
        init: function(options){
            this._stin = null;
            this.time = options.time || 60;
            this.dom = document.querySelector('#' + options.dom.replace('#', ''));
            this.before = options.before;
            this.doing = options.doing;
            this.complate = options.complate;
            this.target = options.targetObject;
            this.complateText = options.complateText || '获取短信验证码';
        },
        start: function(){
            var self = this, time = this.time;
            ('function' === typeof(this.before)) && this.before.call(this.target || this);

            self.dom.setAttribute('disabled', 'disabled');
            window.clearInterval(this._stin);
            this._stin = window.setInterval(function(){
                if(0 > time){
                    self._action(false, self.complateText);
                    ('function' === typeof(self.complate)) && self.complate.call(self.target || self);
                    self.stop();
                    return;
                }
                ('function' === typeof(self.doing)) && self.doing.call(self.target || self);

                self._action(true, time + 's');
                time--;
            }, 1000);
        },
        stop: function(){
            window.clearInterval(this._stin);
            this._stin = null;
            delete this['_stin'];
            this.dom.removeAttribute('disabled');
        },
        remove: function(){
            window.clearInterval(this._stin);
            this.time = 0;
            this.dom = null;
            this.cb = null;
            this.target = null;
        },
        _action: function(flag, text){
            if(!this.dom)    return;
            (true === flag)
                ?   this.dom.classList.add('disabled')
                :   this.dom.classList.remove('disabled');
            this.dom.innerHTML = text;
        }
    };

    window.Timeouter = Timeouter;

}).call(this);
