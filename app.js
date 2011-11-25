$(function() {

    /**
     * @param {string} url base url, eg 'https://bugzilla.wikimedia.org'
     * @constructor
     */
    function Bugzilla(url) {
        var that = this;
        var service = new rpc.ServiceProxy(url + '/jsonrpc.cgi', {
            asynchronous: true,
            sanitize: false, // jsonp
            methods: ['Bug.search', 'Bug.get'],
            callbackParamName: 'callback'
        });

        var proxy = function(method, call, params) {
            return jQuery.Deferred(function(deferred) {
                var xparams = $.extend({method: method}, params);
                call({
                    params: {
                        method: method,
                        params: JSON.stringify([params])
                    },
                    onSuccess: function(json) {
                        deferred.resolve(json);
                    },
                    onError: function(err) {
                        deferred.reject(err);
                    }
                });
            }).promise();
            return deferred.promise();
        };

        var makeProxy = function(method, call) {
            return function(params) {
                return proxy(method, call, params);
            };
        };

        this.Bug = {
            search: makeProxy('Bug.search', service.Bug.search),
            get: makeProxy('Bug.get', service.Bug.get)
        }
    }

    var bz = new Bugzilla('https://bugzilla.wikimedia.org');
    window.bz = bz;
    bz.Bug.search({
        summary: "android"
    //bz.Bug.get({
    //    ids: [1234]
    }).then(function(result) {
        $('#view').text(JSON.stringify(result));
    });

});
