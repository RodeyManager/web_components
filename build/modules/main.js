;(function() {
    window.App = window.App || new Object();
    //调式模式
    App.IS_DEBUG = false;

    /*-------项目其他配置参数 Start--------*/
    //短信发送间隔时间
    App.sendTime = 60;

    /*-------项目其他配置参数 End--------*/

    /*-------项目所有api接口配置 Start--------*/
    var href = window.location.href.replace(window.location.hash, ''),
        port = location.port,
        host = location.host,
        origin = window.location.origin || (function(){
                return location.protocol  + '//' + host + (port != '' ? ':' + port : port);
            })();
    var webServiceUrls = {
        //登录
        login          : 'members/logout'
    };

    // 强制使用某个环境(测试用),默认就设置为空
    App.testEnv = 'local';

    if(App.testEnv == 'stg' || App.testEnv == 'prd' || App.testEnv == ''){
        //调配链接环境
        App.ServerHost = origin + '/' + location.pathname.split('/')[1] + '/';

    }else if(App.testEnv == 'int'){
        //开发环境
        App.ServerHost = 'http://10.141.139.52:8080/';  //（Jack）

    }else if(App.testEnv == 'local'){
        //本地环境
        var ma = (location.pathname.match(/[\w-]+.(html|do|action)/gi))[0];
        App.ServerHost = origin + location.pathname.replace(ma, '');
        // 会员登陆验证
        webServiceUrls = {
            //登录
            login               : 'assets/mockData/login.json'
        };
    }

    //更具key获取api地址
    App.webServiceUrls = webServiceUrls;
    App.getWebServiceUrl = function(name, host) {
        return (host || App.ServerHost) + webServiceUrls[name];
    };

    /*-------项目所有api接口配置 End--------*/

}).call(this);

/**
 * Created by Rodey on 2015/7/20.
 */

var appModel;
$(function(){

    appMpdel = SYST.Model({
        $mid: 'appModel',
        init: function(){
            //全局ajax请求方式
            this.$http.ajaxType = 'POST';

            //生产对应的接口请求方法
            this.initGenerateApis();
        },

        initGenerateApis: function(){
            var apis = {};
            for(var key in App.webServiceUrls){
                if(App.webServiceUrls.hasOwnProperty(key)){
                    apis[key] = App.getWebServiceUrl(key);
                }
            }
            this.generateApi(apis);
        },

        /*---------------------------------------会员相关----------------------------------------*/

        showPage: function(){
            document.getElementsByTagName('html')[0].classList.remove('loading');
            document.body.style.display = 'block';
        },

        //接口测试用
        test: function(postData, su, fail){
            this.$http.doAjax(App.getWebServiceUrl('test'), postData, su, fail, { callTarget: this });
        }

    });

    var requestTipDom = $('#request-tip');

    SYST.httpConfig = {
        commonData: {
            token: 'SDFDFA5SD1F5AS1D8FE15D'
        },
        //-------------ajax请求过程的每一个回调回调（注意每一个请求都会调用）----------------------------------
        ajaxBefore: function(){
            //console.log('发起请求之前执行');
            requestTipDom.show();
        },
        ajaxEnd: function(res){
            //console.log('请求结束 success error 之前执行', res);
            requestTipDom.hide();
        },
        ajaxComplete: function(res){
            //console.log('请求完成 success error主题执行之后', res);
        },
        ajaxSuccess: function(res){
            //console.log('请求成功');
        },
        ajaxError: function(err, xhr){
            //console.log('请求失败', this);
        }
    };

});


/**
 * Created by r9luox on 2016/4/15
 * name: '__ VIEW 公共视图 __'
 */

var appView;
$(function(){

    appView = SYST.View({

        model: appModel,
        events: {
            //退出登录
            'click #logout-btn':    'userLogout'
        },
        init: function(){
            //console.log('初始化公共View');
        },
        //用户退出登录
        userLogout: function(evt){
            if(confirm('您确定需要退出该系统吗？')){
                SYST.T.jumpTo('login.html');
            }
            //console.log('您确定需要退出该系统吗？');
        }

    });

});