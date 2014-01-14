var path = require('path');
var express = require('express');
var events = require('events');
var fs = require('fs');
var topojson = require('topojson');
var twitter2 = require('ntwitter');
var cronJob = require('cron').CronJob;

var eventEmitter = new events.EventEmitter();

var twitterConsumerKey = 'o2YJSxfrTahrywnodx32A';
var twitterConsumerSecret = 'AGJl92rHxASFJXUoAJo30JSC56Zm34VqfaUdXuMFVjg';
var access_token_key = '53659570-doYYVH7QT9Xmcqq7nmtRG8p5yq9nH4Zuruw28cBbT';
var access_token_secret = 'QVK8dddxacH0327lnqsjC7iqfMlIpyxg9pkE1Aa5w9Oef';

var twit = new twitter2({
  consumer_key: twitterConsumerKey,
  consumer_secret: twitterConsumerSecret,
  access_token_key: access_token_key,
  access_token_secret: access_token_secret
});

var featuresTweets = [];

var newTweet = function newTweet(tweet)
{  

  var o = {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": tweet.coordinates.coordinates
      },
      "properties": {
        "text": tweet.text,
        "lng": tweet.coordinates.coordinates[0],
        "lat": tweet.coordinates.coordinates[1]
      }
  };

  featuresTweets.push(o);

  if (featuresTweets.length % 10 === 0) {      
      outputFile = __dirname+'/public/tweets.json';
      var newArray = JSON.parse(JSON.stringify(featuresTweets));
      var collection = {type: "FeatureCollection", features: featuresTweets};
      var topology = topojson.topology({collection: collection}, {"property-transform":function propertyTransform(properties, key, value) {
          properties[key] = value;
          return true;
        }
      }); // convert to TopoJSON

      featuresTweets = newArray;

      //console.log(JSON.stringify(featuresTweets));

      // var json = JSON.stringify(collection);
      app.set("tweetJSON", JSON.stringify(topology));
      // fs.writeFile(outputFile, JSON.stringify(topology), function (err) {
      //   //console.log(writed);
      //   //fs.writeFileSync(outputFile, JSON.stringify(topology));
      // });
    }
}

twit.stream('statuses/filter', {'track':'football,futebol,футбол,サッカー,fútbol'}, function(stream) {
  stream.on('data', function (data) {
    if (data.geo)
      eventEmitter.emit('newTweet', data);
  });
});

eventEmitter.on('newTweet', newTweet);

// SMALL CRON
var cronJob = require('cron').CronJob;
var job = new cronJob({
  cronTime: '00 00 00 * * 1-7',
  onTick: function() {
    featuresTweets = [];
    app.set("tweetJSON", JSON.stringify({result:'nok'}));
  },
  start: false,
  timeZone: "America/Los_Angeles"
});
job.start();

var init = false; 

var app = express();

app.configure(function(){
  //app.set('port', process.env.PORT || 4000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.set('view cache', true);  
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());  
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.static(path.join(__dirname, 'public')));
});


app.get('/globe-twitter', function(req, res){ 
    res.render('planetarystats');
});

app.get('/twitter', function(req, res) {
  res.end(app.get("tweetJSON"));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    app.set("tweetJSON", JSON.stringify({result:'nok'}));
});