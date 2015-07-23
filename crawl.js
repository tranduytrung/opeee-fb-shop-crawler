'use strict';

var fb = require('facebook-node');
var _ = require('lodash');
var async = require('async');
var moment = require('moment');

fb.setApiVersion("v2.4");

function search(options, callback) {
    fb.api('search', 'post', options, function (res) {
        if(!res || res.error) {
            var error = _.get(res, "error");
            return callback(error || "unexpected error");
        }

        callback(null, res);
    });
}

/* Sample of a page structure
{
    "id": "72924719987",
    "name": "ABC News",
    "likes": 1292341,
    "checkins": 0,
    "username": "abcnews.au",
    "talking_about_count": 234166,
    "feed": {
        "data": [
            {
                "id": "72924719987_10154232154764988",
                "created_time": "2015-07-21T14:31:49+0000",
                "shares": {
                    "count": 22
                },
                "likes": {
                    "data": [
                    ],
                        "summary": {
                        "total_count": 99,
                        "can_like": true,
                        "has_liked": false
                    }
                }
            },
          ..
        ]
    }

*/

function cluster(options, callback) {
    var clusters = [];
    var pages = options.pages;
    var size = options.clusterSize;
    _.forEach(pages, function(page) {

        var sector = Math.floor(page.likes/size);
        if (!clusters[sector]) {
            clusters[sector] = [];
        }

        clusters[sector].push(page);
    });

    return callback(null, clusters);
}

function filter(pages, callback) {
    var filteredList = [];

    _.forEach(pages, function(page) {
        var isGoodShop = page.likes > 5000 && page.likes < 20000;

        // the first is newest post because it is orderd by facebook
        var newestPost = _.get(page, "feed.data[0]");
        
        var hasPosted7Days = newestPost 
            && newestPost.created_time
            && moment().diff(moment(newestPost.created_time), 'days') <= 7;

        isGoodShop = isGoodShop && hasPosted7Days;

        if (isGoodShop) {
            filteredList.push(page);
        }        
    });

    callback(null, filteredList);
}

module.exports = function(options, callback) {
    fb.setAccessToken(options.accessToken);

    var defaults = {
        method: 'GET',
        type: 'page'
    }

    var params = _.defaults({
        q: options.query,
        limit: 100,
        fields: 'id,name,likes,checkins,username,talking_about_count,feed.limit(5){id,created_time,shares,likes.summary(true).limit(0)}'
    }, defaults);

    var shopList = _([]);
    var clusters = [];
    var after = undefined;
    var threshold = options.count || 9007199254740991;
    var count = 0;
    var func = options.func || 'cluster';
    var clusterSize = options.clusterSize || 5000;

    async.doWhilst(function(doWhilstCallback) {
        search(_.extend(params, {after: after}), function(err, res) {
            if (err) {
                return doWhilstCallback(err);
            }

            after = _.get(res, "paging.cursors.after");

            if (func == 'filter') {
                // check condition and add to shopList
                filter(res.data, function(err, candidates) {
                    shopList = shopList.concat(candidates);
                    count += candidates.length;

                    // call to next loop
                    doWhilstCallback();
                });
            } else {
                cluster({pages: res.data, clusterSize: clusterSize}, 
                function(err, subClusters) {

                    _.forEach(subClusters, function(cluster, sector) {
                        if (clusters[sector]) {
                            clusters[sector].concat(cluster);
                        } else {
                            clusters[sector] = _(cluster);
                        }
                    });

                    // call to next loop
                    doWhilstCallback();
                });
            }
            
        });
    },function() {
        // continuing condition
        return after && count < threshold;
    }, function(err) {
        if (err) {
            callback(err);
        }

        var result = null;
        if (func == 'filter') {
            result = shopList.value();            
        } else {
            result = _.map(clusters, function(cluster) {
                return cluster.value();
            });
        }

        if (callback) {
            callback(null, result);
        }
    });
};