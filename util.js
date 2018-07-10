/**
 * 1、给传入的数字加逗号，例如 10000000， 返回10,000,000
 * 100 返回 100
 * @param {string} str 数字类型的字符串
 */
function format(str) {
    if (/\D/.test(str)) {
        return 'this function require a number string'
    } else {
        var reg = /(?=((?!\b)\d{3})+$)/g;
        return str.replace(reg, ',');
    }
}
// console.log(format('100'))
// console.log(format('100000000'))
// console.log(format('10000dd0000'))

/**
 * 2、传入一个对象，和一个对象属性，如果对象属性存在，返回属性，不存在，返回undefined并且不报错
 * 比如 var obj = {a:{b:c}} obj, a.d 返回 undefinded
 * @param {object} obj 对象
 * @param {string} str 属性
 */
function getProperty(obj, str) {
    var arr = str.split('.');
    if (obj[arr[0]]) {
        if (arr[1]) {
            var s = str.replace(/\w+?./, '');
            return getProperty(obj[arr[0]], s);
        } else {
            return obj[arr[0]];
        }
    } else {
        return undefined;
    }
}
var obj = { a: { b: { c: 1 } } }
// console.log(getProperty(obj, 'a'))
// console.log(getProperty(obj, 'a.b.c'))
// console.log(getProperty(obj, 'a.d'))

/**
 * 2、传入一个对象，和一个对象属性，如果对象属性存在，返回属性，不存在，返回undefined并且不报错
 * 比如 var obj = {a:{b:c}} obj, a.d 返回 undefinded
 * @param {object} obj 对象
 * @param {string} str 属性
 */
function getProperty(obj, str) {
    var arr = str.split('.');
    if (obj[arr[0]]) {
        if (arr[1]) {
            var s = str.replace(/\w+?./, '');
            return getProperty(obj[arr[0]], s);
        } else {
            return obj[arr[0]];
        }
    } else {
        return undefined;
    }
}
// var obj = { a: { b: { c: 1 } } }
// console.log(getProperty(obj, 'a'))
// console.log(getProperty(obj, 'a.b.c'))
// console.log(getProperty(obj, 'a.d'))


/**
 * 3、获取本页面所有标签的值，组成数组
 * [html,body,span] 等
 */
function getTag() {
    var str = document.getElementsByTagName('html')[0].outerHTML;
    var reg = /<(\w+).*?>/g
    var a = null, arr = [];
    while (a = reg.exec(str)) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (a[1] == arr[i]) {
                break;
            }
        }
        if (i == len) {
            arr.push(a[1])
        }
    }
    return arr;
}

/**
 * 4、创建一个Cookie 对象，分别有set,get,remove方法
 */
var Cookie = {
    set: function (key, value, options) {
        var str = key + '=' + value;
        if (options && options.expires) {
            str = str + ';expires=' + expires;
        }
        document.cookie = str;
    },
    get: function (key) {
        var str = document.cookie;
        var reg = new RegExp('(\\b|;)' + key + '=' + '(.+?)' + '(\\b|;)')
        var arr = reg.exec(str);
        if (!arr) {
            return null;
        }
        return arr[2]
    },
    remove: function (key) {
        document.cookie = key + '=1' + ';expires=' + new Date(0);
    }
}

var util = {
    /**
     * 获取url中的query,返回对于的json
     */
    getObjFromQuery: function(){
        var url = location.href;
        var reg = /(?:\?|&)(.+?)=(.+?)(?=$|&)/g
        var a = null, obj = {};
        while(a = reg.exec(url)){
            obj[a[1]] = a[2];
        }
        return obj;
    }
}
