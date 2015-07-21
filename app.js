var readline = require('readline');
var fs = require('fs');
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
    },
    count: function(callback) {
        rl.question('Count: ', function(answer) {
            if (_.isEmpty(answer)) {
                return callback(null);
            }

            callback(null, answer);
        });
    },
    saveTo: function(callback) {
        rl.question('Save to: ', function(answer) {
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
    console.log("Crawling...");
    crawl(options, function(err, pages) {
        if (err) {
            console.log(err);
        }
        
        var ids = _.map(pages, function(page) {
            return page.id;
        });

        fs.writeFile(answers.saveTo, ids.join("\r\n"), function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("Saved to " + answers.saveTo);
        });
    });
    rl.close();
});