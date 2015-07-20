var readline = require('readline');
var async = require('async');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

async.series({
    favoriteFood: function(callback) {
        rl.question('What is your favorite food? ', function(answer) {
            callback(null, answer);
        });
    },
    favoriteColor: function(callback) {
        rl.question('What is your favorite color? ', function(answer) {
            callback(null, answer);
        });
    }
}, function(err, answers) {
    if (err) {
        rl.close();
        return;
    }

    console.log('Oh, so your favorite food is ' + answers.favoriteFood);
    console.log('and your favorite color is ' + answers.favoriteColor);
    rl.close();
})