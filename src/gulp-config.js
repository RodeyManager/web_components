
var nodePath = require('path');

//当前编译环境: stg: 测试环境(默认); int: 开发环境; prd: 生成环境
var env = 'stg';
//静态资源版本控制号
var vQueryKey = '_cmbx_',
    hashSize = 10,
    buildPath = nodePath.resolve(__dirname, '../build');

var config = {
    env: env,
    //源文件路径, 默认为 src
    source: 'src',
    //编译产出路径，可以是绝对或者相对路径，默认为 build
    build: 'build',
    //task任务列表
    builds: {
        //---说明：单个任务配置
        'build.css': {
            src: [
                'assets/css/reset.css',
                'assets/css/app.css',
                'assets/css/public.css',
                'assets/css/animate.css',
                'assets/css/fonts.css',
                'assets/css/media.css'
            ],
            //额外的插件样式，如果不是每个页面都用到，不建议合并到主样式文件中
            //可以单独在使用到的页面中引用
            plugins: [],
            dest: 'assets/css',
            //依赖task列表
            rely: ['build.images', 'build.fonts'],
            loader: {
                'gulp-sass': { outputStyle: 'compressed' },
                'gulp-recache': {
                    queryKey: vQueryKey,
                    //hash值长度
                    hashSize: hashSize,
                    //资源根路径
                    basePath: buildPath + '/assets'
                },
                'gulp-autoprefixer': {
                    browsers: ['> 5%', 'IE > 8', 'last 2 versions'],
                    cascade: false
                },
                'gulp-uglifycss': null,
                'gulp-concat-css': 'app.min.css'
            },
            watch: ['assets/css/**/*']
        },

        'build.modules': {
            pathPrefix: 'modules/',
            src: ['**/*'],
            //过滤掉不进行编译的文件或目录
            filters: [
                'config.js',
                'model.js',
                'view.js',
                'main.js'
            ],
            dest: 'modules',
            loader: {
                'gulp-uglify': { _if: env === 'prd', preserveComments: '!' }
            },
            watch: [ 'modules/**/*']
        },

        'build.html': {
            src: ['views/**/*.html'],
            filters: [],
            dest: '',
            rely: ['build.css', 'build.main', 'build.libs', 'build.js'],
            loader: {
                'gulp-tag-include': { compress: false },
                'gulp-recache': {
                    queryKey: vQueryKey,
                    //hash值长度
                    hashSize: hashSize,
                    basePath: buildPath //'D:\\Sites\\test\\web_components\\build'
                },
                'gulp-minify-html': {
                    _if: env === 'prd',
                    empty: true,       //去除空属性
                    comments: false,    //去除html注释
                    Spare: false        //属性值保留引号
                }
            },
            watch: [
                'views/**/*',
                'assets/components/**/*',
                'assets/layout/**/*'
            ]
        },

        'build.main': {
            src: [
                'modules/config.js',
                'modules/main.js',
                'modules/model.js',
                'modules/view.js'
            ],
            dest: 'modules',
            loader: {
                'gulp-concat': 'main.js',
                'gulp-uglify': { _if: env === 'prd', preserveComments: '!' }
            }
        },
        'build.libs': {
            pathPrefix: 'assets/js',
            src: [
                'jquery/jquery.js',
                'SYST/SYST.min.js'
            ],
            dest: 'assets/js',
            loader: {
                'gulp-concat': 'libs.js',
                'gulp-uglify': { _if : env === 'prd', preserveComments: '!' }
            }
        },

        'build.fonts': {
            src: 'assets/fonts/*',
            dest: 'assets/fonts'
        },

        'build.images': {
            src: 'assets/images/**/*',
            dest: 'assets/images'
        },

        //模拟数据
        'build.mockData': {
            src: 'assets/mockData/**/*',
            dest: 'assets/mockData'
        },

        'build.js': {
            src: 'assets/js/**/*',
            filters: [
                'assets/js/?(jquery|SYST)/**/*'
            ],
            dest: 'assets/js'
        }

    }
};


//导出模块
module.exports = config;
