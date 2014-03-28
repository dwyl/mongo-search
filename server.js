function createIndex(collection, fields, callback){
	
}

var KEYWORDS = "learned, learnt, homework, science, math, maths, physics, chemistry"; // add keywords separated by spaces.

var twitter = require('twitter'),
  twit = new twitter({
    consumer_key: 'wyir0dDuntZkbXF0jQps8w',
    consumer_secret: 'hrWA0pEoGGD9DiJf1tanhkgYOCNwFL7yN6L8QCc3Nc',
    access_token_key: '2389016353-maPa5ax7R3VcXnFBROMb8HPEwJsO64So62dAHnK',
    access_token_secret: 'iKuvsT3tZd0Mk8ACUCfi6KzeN3Fvbr5EnyzDyHIlUgrrA'
});

var MongoClient = require('mongodb').MongoClient, 
format = require('util').format;

MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
  if(err) throw err;
  var collection = db.collection('posts');

  collection.insert({a:2}, function(err, docs) {

    collection.count(function(err, count) {
      console.log(format("count = %s", count));
    });

    // Locate all the entries using find
    collection.find().toArray(function(err, results) {
      console.dir(results);
      // Let's close the db
      db.close();
    });
  });
})


  // var insertTweet = Meteor.bindEnvironment(function(tweet) {
  //   Posts.insert(tweet);
  // });

function getTweets(callback){
	twit.stream("statuses/filter", {
	  track: KEYWORDS, 'lang':'en'
	  }, function(stream) {
	    stream.on('data', function(data) {
        // }

      	// console.log(data.retweeted_status); // full tweet
	    });
	});
}

function extractTweet(data) {
  var tweet = {};
  console.log(data);
  var tweet = {};
  tweet.text = data.text;
  tweet.time = new Date(Date.parse(data.created_at));
  tweet.avatar = data.user && data.user.profile_image_url || '';

  if(data.entities && data.entities.media && data.entities.media[0].media_url){ // extract images where available:
  // console.log(data.entities.media[0].media_url);    
    tweet.img = data.entities.media[0].media_url;

  }
  if(data.retweeted_status && parseInt(data.retweeted_status.retweet_count, 10) > 0){
  // console.log(data)
  }
  console.log(data.text)
  // if(data.lang === 'en') { // && tweet.img) {
  if(tweet.text.indexOf("#") !== -1) {   
  // insertTweet(tweet);        
  } 
  return tweet;
}

getTweets(function(){
	console.log('done');
});