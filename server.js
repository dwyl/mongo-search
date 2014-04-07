// keywords to find in tweets
var KEYWORDS = "learned, learnt, homework, science, math, maths, physics, chemistry"; // add keywords separated by spaces.
// KEYWORDS = "katie, justin, kim, beyonce, 1DWorld, OMG, FML, news, breaking"; // for *LOTS* of tweets.
// KEYWORDS = "idea";
var twitter = require('twitter'),
  twit = new twitter({
    consumer_key: 'U8N2QzFu6Hv4BB3BjObIy9HDF',
    consumer_secret: 'rJWtj5NneVWmfT8STB7YN6IBkLreke9JoJhP3nIe0ffnBq91Xv',
    access_token_key: '2389016353-4tCDaVgRFkkNsWOj1sb6fZQ8s0bINqD5jJGmqRC',
    access_token_secret: 'OEFnemh9FlSkOX5YuNP46XsDh3EutbHiiKq6q8wV2Pwko'
});

var SEARCH_INDEX = "post_search_index";
var SEARCH_KEYWORDS = "math",
    _db, _sr, _posts; // global DB handles

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://127.0.0.1:27017/meteor', function(err, db) {
  if(err) throw err;
  _posts = db.collection('posts');
  _sr    = db.collection('search_results');
  _db    = db; // export the database handle
  fetchTweets(_posts);

  // wait 10 seconds for some data then create full-text index
  // setTimeout(function(){
  //   createIndex(_posts);
  // },10000)

  // search('science');
}) // end MongoClient

// 
function search(keywords){
  console.log("- - - > SEARCHING for ",keywords, " < - - - ");
  _db.command({text:"posts" , search: keywords }, function(err, res){ 
    if(err) console.log(err);

    var record = {};
    record.keywords = keywords;
    record.last_updated = new Date();
    record.posts = [];

    if (res.results && res.results.length > 0){
      console.log("EXAMPLE:",res.results[0]);

      for(var i in res.results){
        // console.log(i, res.results[i].score, res.results[i].obj._id);
        record.posts.push({
          "_id":res.results[i].obj._id.toString(), 
          "score":res.results[i].score
        });
      }

      // check if an SR record already exists for this keyword
      _sr.findOne({"keywords":keywords}, function(err, items) {
        if(err) console.log(err);
        console.log(items);
        if(items && items._id){
          record._id = items._id;
          // upsert the results record
          _sr.update(record, { upsert: true }, function(err,info){
            if(err) console.log(err);
            // console.log("INFO",info);
          });
        } else {
          // insert new search results record
          _sr.insert(record, function(err,info){
            if(err) console.log(err);
            console.log("INFO",info);
          });
        }

      }) // end findOne (search results lookup for keywords)
    } else { // no search results
      console.log('no results');
      _sr.insert(record, function(err,info){
        if(err) console.log(err);
        console.log("INFO",info);
      });
    }
    console.log("- - - > FOUND Results for ",keywords, " < - - - ");
  }); // end command (search)
}


function createIndex(collection) {
  collection.indexInformation(function(err, index) { // all indexes on posts collection
    // console.dir(index);
    // console.log(typeof index)
    if(typeof index[SEARCH_INDEX] === 'undefined'){
      // create index
      collection.ensureIndex( { text: 'text' }, {
            name: SEARCH_INDEX,
            background:true
        }, function(err, info){
        if(err) throw err;
        // console.dir(info);
      });
    }
  });
}

function fetchTweets(collection){
  // console.log(twit);
  twit.stream("statuses/filter", { track: KEYWORDS, 'lang':'en' }, function(stream) {
    stream.on('data', function(data) {
      var tweet = extractTweet(data);
      collection.insert(tweet, function(err, docs) {

        collection.count(function(err, count) {
          console.log(count, tweet.user, tweet.text);
        });

      }); // end collection.insert
    }); // end stream.on
  }); // end twit.stream
}


function extractTweet(data) {
  var tweet = {};
  tweet.text = data.text;
  tweet.time = new Date(Date.parse(data.created_at)); // date objecte sortable
  tweet.avatar = data.user && data.user.profile_image_url || '';
  // console.log(data.user.screen_name);
  tweet.user = data.user.screen_name
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