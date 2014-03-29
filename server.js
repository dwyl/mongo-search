function createIndex(collection, fields, callback){
	
}

var KEYWORDS = "learned, learnt, homework, science, math, maths, physics, chemistry"; // add keywords separated by spaces.
// KEYWORDS = "katie, justin, kim, beyonce, 1DWorld, OMG, FML, news, breaking";
// KEYWORDS = "idea";

var twitter = require('twitter'),
  twit = new twitter({
    consumer_key: 'wyir0dDuntZkbXF0jQps8w',
    consumer_secret: 'hrWA0pEoGGD9DiJf1tanhkgYOCNwFL7yN6L8QCc3Nc',
    access_token_key: '2389016353-maPa5ax7R3VcXnFBROMb8HPEwJsO64So62dAHnK',
    access_token_secret: 'iKuvsT3tZd0Mk8ACUCfi6KzeN3Fvbr5EnyzDyHIlUgrrA'
});

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://127.0.0.1:27017/meteor', function(err, db) {
  if(err) throw err;
  var posts = db.collection('posts');

  twit.stream("statuses/filter", { track: KEYWORDS, 'lang':'en' }, function(stream) {
    stream.on('data', function(data) {
      var tweet = extractTweet(data);
      posts.insert(tweet, function(err, docs) {

        posts.count(function(err, count) {
          console.log(count, tweet.text);
        });

      }); // end posts.insert
    }); // end stream.on
  }); // end twit.stream

  // wait 10 seconds for some data then create full-text index

}) // end MongoClient

function extractTweet(data) {
  var tweet = {};
  tweet.text = data.text;
  tweet.time = new Date(Date.parse(data.created_at)); // date objecte sortable
  tweet.avatar = data.user && data.user.profile_image_url || '';

  // extract images where available:
  if(data.entities && data.entities.media && data.entities.media[0].media_url){ 
  // console.log(data.entities.media[0].media_url);    
    tweet.img = data.entities.media[0].media_url;

  }
  if(data.retweeted_status && parseInt(data.retweeted_status.retweet_count, 10) > 0){
  // console.log(data)
  }
  // console.log(data.text)
  // if(data.lang === 'en') { // && tweet.img) {
  if(tweet.text.indexOf("#") !== -1) {   
  // insertTweet(tweet);        
  } 
  tweet.lang = data.lang;
  return tweet;
}