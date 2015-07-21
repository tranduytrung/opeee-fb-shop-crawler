var readline = require('readline');
var async = require('async');
var _ = require('lodash');
var config = require('./config');
var crawl = require('./crawl');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

async.series({
    accessToken: function(callback) {
        rl.question('Access Token: ', function(answer) {
            if (_.isEmpty(answer)) {
                return callback(null);
            }

            callback(null, answer);
        });
    },
    query: function(callback) {
        rl.question('Search: ', function(answer) {
            if (_.isEmpty(answer)) {
                return callback(null);
            }

            callback(null, answer);
        });
    }
}, function(err, answers) {
    if (err) {
        console(err);
        rl.close();
        return;
    }

    var options = _.defaults(answers, config);
    crawl(options);
    rl.close();
})