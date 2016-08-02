const express = require('express');
const bodyParser= require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));


app.use(express.static('public'));// папка з статичними елементами (картінки)
app.set('views',(__dirname, 'views'));
app.set('view engine', 'ejs');

var MongoDriver = require('mongodb');
var MongoClient = MongoDriver.MongoClient, assert = require('assert');
var url = 'mongodb://192.168.2.108:27017/auto_turn';
var ObjectId = MongoDriver.ObjectId;
var formidable = require("formidable");
var count1 = 0; 

MongoClient.connect(url, function(err, db) { 
	



	app.get('/', function(req, res) {

		var collection = db.collection('auto');
		assert.equal(null, err);
		console.log("Connected correctly to server");
		collection.find().toArray(function(err, results) {
   		   
			res.render('index', {results:results});
	
    	});
		
	});

	app.post('/reg', function(req, res) {

		count1++;
		console.log(count1);
		console.log(req.body.id_car);
	

 // добавлення дока
 
 		var collection = db.collection('auto');
  // Update document where a is 2, set b equal to 1 
 // collection.updateOne({_id:ObjectId(req.body.id_car) }, { $set: { count : [count1] } });  

		collection.updateOne({_id:ObjectId(req.body.id_car) }, { $push: { count : count1} }); 
  

		collection.find().toArray(function(err, results) {
   		  
			res.render('index', {results:results});
	
    	});
		
	});


	app.post("/reset", function(req, res){
		var collection = db.collection('auto');

if(req.body.reset=='true'){

 		

		collection.updateMany({},{$set:{count:[0]}});
		collection.updateMany({} , { $pop: { count: -1 } }); 
		count1 = 0;

		collection.find().toArray(function(err, results) {
   		  
			res.render('index', {results:results});
	
    	});
	}else{
	collection.find().toArray(function(err, results) {
   		  
			res.render('index', {results:results});
	
    	});
	}

	});



	app.post("/next", function(req, res){

		var collection = db.collection('auto');

		collection.update({_id:ObjectId(req.body.id_car) }
    		, { $pop: { count: -1 }  
  		}); 

		collection.find().toArray(function(err, results) {
   		  
			res.render('index', {results:results});
	
    	});

	});


app.post('/renderaddcar', function(req, res) {

res.render('addcar', {});


});


//disconect db	
});



app.listen(3000, function() {

	console.log('listening on 3000');

});