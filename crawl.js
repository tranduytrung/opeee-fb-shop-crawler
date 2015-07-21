'use strict';
var fb = require('facebook-node');
fb.setApiVersion("v2.4");

module.exports = function(options) {
    fb.setAccessToken(options.accessToken);

    fb.api('search', { type: 'page', q: options.query }, function (res) {
        if(!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            return;
        }
        
        console.log(res);
    });
};