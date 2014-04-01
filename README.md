MongoDB Search
==============

Experiment with Full-Text-Search using Node.js and MongoDB

## WHY

Finding relevance in an ocean of content.

Having spent the last couple of days 
[*wrestling* with Meteor + Search](https://github.com/ideaq/meteor-search)
trying to get it let me search through a collection 
I've decided to take a different approach to the probrem.

Hopefully by the end of this exercise we will be able to search through 
a collection of "posts" (tweets) and find relevant results.

## WHAT

***Full-text search*** *without having to manage *Solr or ElasticSearch*.
(keeping it simple with just *one* data store)


## HOW

### Going Native

In the past I've used [Mongoose](http://mongoosejs.com/) to interact with 
MongoDB. Mongoose offers many great abstractions when building applications
specifically around pre-defining models and providing constructors to 
validate fields on insert/update. We don't need that here.

All we need is the ability to:

- [x] Connect to MongoDB (Local)
- [x] Insert records into a collection
- [x] Create a text index for the text field in the collection
- [x] Execute a text (search) query against the records in the collection
- [x] Return a list of all the record (_ids) that match the search criteria
- [x] Store the results in a "results" collection to speed up future searches

For these simple tasks the ***Node MongoDB Native*** client is *perfect*.

- https://github.com/mongodb/node-mongodb-native

Install it using NPM.

```
npm install mongodb
```

#### Startup The Meteor Mongo DB

mongod --bind_ip 127.0.0.1 --dbpath ~/code/meteor-search/.meteor/local/db --setParameter textSearchEnabled=true

### Create the Index

```
MongoClient.connect('mongodb://127.0.0.1:27017/meteor', function(err, db) {
  if(err) throw err;
  var posts = db.collection('posts');
  posts.indexInformation(function(err, info) { // all indexes on posts collection
    console.dir(info);
  });
}) // end MongoClient

```
Output:
```
{ 
  _id_: [ [ '_id', 1 ] ],
  post_search_index: [ [ '_fts', 'text' ], [ '_ftsx', 1 ] ] 
}
```
*ignore* the _id_ index that's a mongodb default.
the one which interests us is the post_search_index we created earlier.

- http://mongodb.github.io/node-mongodb-native/markdown-docs/indexes.html


### Searching the Data

```
db.posts.find({}).sort({time:-1}).limit(100);
```

Node.js MongoDB Native *does not have* **runCommand** which is used in most 
full-text search examples. <br />So we *cannot* just do:

```javascript
db.posts.runCommand( "text", { search: "justin" } )
```

![MongoDB Native NO runCommand](http://i.imgur.com/5LKPFNE.png)

But a bit of investigation yields: 

```javascript
// unintuitively the text field is actually the collection!
db.command({text:"posts" , search: "maths science" }, function(err, cb){ 
	console.log(cb.results);
});
```

### Storing Search Results

The result of the above **db.command** search query has the format:

```
  { score: 2.142857142857143,
    obj: 
     { text: 'Math, science, history, unraveling the mystery it all started with a #BigBang💥',
       time: Sun Mar 30 2014 07:03:08 GMT+0100 (BST),
       avatar: 'http://pbs.twimg.com/profile_images/442935363095379968/CuEcmYsH_normal.jpeg',
       _id: 'Kxssadbi2e5X7ga5L' } },
 { score: 2.142857142857143,
    obj: 
     { text: 'I was just about to set my maths and science books on fire…#ihateschool',
       time: Sun Mar 30 2014 06:22:31 GMT+0100 (BST),
       avatar: 'http://pbs.twimg.com/profile_images/449715822454243329/cNN69E3A_normal.jpeg',
       _id: 'ghoi72BoEfswZgfws' } }
```

This returns the **score** (a *float*) and the entire record (all fields).
We could return these results directly to the user and we are *done*.
But going back to our original reason for diving into "*naitve*" node, 
we want to be able to "pipe" these results back into our Meteor app.

#### New Collection: Search Results


```javascript
db.search_results.insert(
	{
		keywords:"science",
		posts : [ 
				{
					score: 2.142857142857143,
					_id: 'Kxssadbi2e5X7ga5L'
				},
				{
					score: 2.142857142857143,
					_id: 'ghoi72BoEfswZgfws' 
				}
			]
		last_updated: new Date()
	}
);
```

### Displaying Search Results



























## Further Reading

- Searching MongoDB: http://docs.mongodb.org/manual/tutorial/search-for-text/
- http://blog.mongohq.com/mongodb-and-full-text-search-my-first-week-with-mongodb-2-4-development-release/
- https://blog.serverdensity.com/full-text-search-in-mongodb
- 12 Months with Mongo: http://blog.wordnik.com/12-months-with-mongodb
- http://stackoverflow.com/questions/16070233/runcommand-equivalent-for-nodejs-native-mongodb
- If Mongoose was an option: http://stackoverflow.com/questions/19849650/full-text-search-in-mongodb-node-js-mongoose-text-search

>> REPLY TO: http://stackoverflow.com/questions/17159626/implementing-mongodb-2-4s-full-text-search-in-a-meteor-app

### Prefer "Real" Search?

- Feature compairson: http://solr-vs-elasticsearch.com/
- Discussion: http://stackoverflow.com/questions/10213009/solr-vs-elasticsearch
- Bonsai (hosted ElasticSearch): http://www.bonsai.io/