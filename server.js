const express = require('express');
const bodyParser= require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));

const xlsx = require('node-xlsx');
app.use(express.static('public'));// папка з статичними елементами (картінки)
app.set('views',(__dirname, 'views'));
app.set('view engine', 'ejs');


var MongoDriver = require('mongodb');

var MongoClient = MongoDriver.MongoClient, assert = require('assert');
var url = 'mongodb://localhost:27017/auto_turn';
var ObjectId = MongoDriver.ObjectId;
var formidable = require("formidable");
var fs = require("fs"),
    sys = require("sys");

var count1 = ''; 
var filenamedb =0; 
var printcount = 1;
var printname = 0;
var importdir ='';




MongoClient.connect(url, function(err, db) { 
	



	app.get('/', function(req, res) {

		var collection = db.collection('auto');
		assert.equal(null, err);
		console.log("Connected correctly to server");
		collection.find().sort( { _id : 1 } ).toArray(function(err, results) {
   		   
			res.render('index', {results:results,printname:printname,printcount:printcount});

    	});
		
	});

	app.post('/reg', function(req, res) {
		

 

 
		count1++;
		console.log(count1);
		console.log(req.body.id_car);
		console.log(req.body.model_car);
		printcount = count1;
		printcount++;
		scriptjs =  "javascript:CallPrint('print-content');";



		printname = req.body.model_car; 
		
		var print_info = "   "+count1 +"\r\n" + req.body.model_car+"\r\n\r\n"+"--------";
	

//занести дані в файл і потім його розпічатати
		fs.open("number.txt", "w", 0644, function(err, file_handle) {
if (!err) {
    // Операции с открытым файлом
    fs.write(file_handle, print_info , null, 'ascii', function(err, written) {
        if (!err) {
            // Всё прошло хорошо 
            console.log('write file true');
             fs.close(file_handle);
             var startexe = require('child_process').exec('start jre\\bin\\java.exe -jar DataPrinter.jar "'+ count1 +'" "' + req.body.model_car + '"');

        } else {
            // Произошла ошибка при записи
            console.log('write file failed');

        }
    });
} else {
    // Обработка ошибок
}
});

	

 // добавлення дока



 
 		var collection = db.collection('auto');
  // Update document where a is 2, set b equal to 1 
 // collection.updateOne({_id:ObjectId(req.body.id_car) }, { $set: { count : [count1] } });  

		collection.updateOne({_id:ObjectId(req.body.id_car) }, { $push: { count : count1} }); 
  	collection.updateOne({_id:ObjectId(req.body.id_car) }, { $push: { client : req.body.name} });
	
		collection.find().sort( { _id : 1 } ).toArray(function(err, results) {

			res.render('index', {results:results,printname:printname,printcount:printcount});
			
	
    	});

		
	});


	app.post("/reset", function(req, res){
		var collection = db.collection('auto');
		printcount = 1;
		printname = 0; 

		

if(req.body.reset=='true'){

 		
		count1 = '';
		collection.updateMany({},{$set:{count:[0]}});
		collection.updateMany({} , { $pop: { count: -1 } });
		collection.updateMany({},{$set:{client:[0]}});
		collection.updateMany({} , { $pop: { client: -1 } });  
	

		collection.find().sort( { _id : 1 } ).toArray(function(err, results) {
   		  
			res.render('index', {results:results,printname:printname,printcount:printcount});
	
    	});
	}else{
	collection.find().sort( { _id : 1 } ).toArray(function(err, results) {
   		  
			res.render('index', {results:results,printname:printname,printcount:printcount});
	
    	});
	}

	});



	app.post("/next", function(req, res){

		var collection = db.collection('auto');

		collection.update({_id:ObjectId(req.body.id_car) }
    		, { $pop: { count: -1 }  
  		}); 
  		collection.update({_id:ObjectId(req.body.id_car) }
    		, { $pop: { client: -1 }  
  		}); 

		collection.find().sort( { _id : 1 } ).toArray(function(err, results) {
   		  
			res.render('index', {results:results,printname:printname,printcount:printcount});

	
    	});

	});

	app.post('/buttomexe', function(req, res){

		res.render('print', {});
	})

//сторінка загрузки img
app.post('/renderaddcar', function(req, res) {

res.render('addcar', {filenamedb:filenamedb});


});

// загрузка зображення для автомобілів 
app.post('/upload', function(req, res){
var form = new formidable.IncomingForm();
form.parse(req);


form.on('fileBegin', function (name, file){
        file.path = __dirname + '/public/images/car/' + file.name;
      
    });

 form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
filenamedb = 'images/car/'+file.name; 
res.render('addcar',{filenamedb:filenamedb});
    });
});


// загрузка файла xl для імпорту в базу 
app.post('/importxl', function(req, res){
var form = new formidable.IncomingForm();
form.parse(req);


form.on('fileBegin', function (name, file){
        file.path = __dirname + '\\public\\import\\' + file.name;
        importdir = __dirname + '\\public\\import\\' + file.name;
      
    });

 form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
filenamedb = 'import/'+file.name; 
res.render('import',{});
    });
});


// додання автомобіля 
app.post('/addcar', function(req, res){

console.log(req.body.brand);
console.log(req.body.model);

console.log(filenamedb);

var insertDocuments = function(db, callback) {
  			// Get the documents collection 
  			var collection = db.collection('auto');
  			// Insert some documents 
  			collection.insertOne({model:(req.body.model),marka:(req.body.brand),urlimg:(filenamedb),count:[]}, function(err, result) {
    			assert.equal(err, null);
    			assert.equal(1, result.result.n);
   				 assert.equal(1, result.ops.length);
   				 console.log("Inserted 1 documents into the document collection");

   				 callback(result);
  			});
		}
  
  
  		insertDocuments(db, function() {

	
		}); 

res.render('addcar', {filenamedb:filenamedb});
});

/*

app.get('/print',function(req, res){

		var collection = db.collection('auto');

		collection.find().sort( { _id : 1 } ).toArray(function(err, results) {
   		  
			res.render('print',{results:results});
		
	
    	});
		
});
*/
// starting exe file 
//app.post('/startexe', function(req, res){
//	var startexe = require('child_process').exec('start cmd.exe ');

//});
//при натисненні кнопки import перейти на таку сторінку 
app.post('/importrender', function(req, res) {

			res.render('import', {});
	
	});
//при натисненні кнопки verify перейти на таку сторінку 
app.post('/verifirender', function(req, res) {
	var nameuser = '';
	var phoneuser ='';
				res.render('verifi', {nameuser:nameuser, phoneuser:phoneuser});
	
    
	});

// шукати клієнта по коду з бази 8 цифр
app.post('/codverif', function(req, res) {
	var collection = db.collection('users');

  //console.log(req.body.codk);

  collection.find({id_client:req.body.codk}).toArray(function(err, results) {
   		 // console.log(results[0].name);
   		//  console.log(results[0].phone);
   		var phoneuser = results[0].phone; 
   		var nameuser = results[0].name; 
   		
			res.render('verifi', {phoneuser:phoneuser, nameuser:nameuser});
	
    	});
			
		
	});

// шукати клієнта з бази по прізвищу 
app.post('/nameverif', function(req, res) {

	var collection = db.collection('users');

  //console.log(req.body.surname);

  collection.find({surname:req.body.surname}).toArray(function(err, results) {
   		 // console.log(results[0].name);
   		 // console.log(results[0].phone);
	var phoneuser = results[0].phone; 
   		var nameuser = results[0].name; 
			res.render('verifi', {phoneuser:phoneuser, nameuser:nameuser});
	
    	});
			
		
	});
//додавання користувача в базу 
app.post('/adduser', function(req, res) {

	var collection = db.collection('users');

	collection.insertOne({id_client:(req.body.codclient),
		name:(req.body.name),
		surname:(req.body.surname),
		phone:(req.body.phone),
		email:(req.body.email),
		sity:(req.body.sity),
		status:(req.body.status),
		auto:(req.body.auto),
		'time-start':(req.body.timestart),
		'time-end':(req.body.timeend),
		flag:(req.body.flag) });
	
	var nameuser = '';
	var phoneuser ='';
				res.render('verifi', {nameuser:nameuser, phoneuser:phoneuser});

});


app.post('/parcexl', function(req, res) {



console.log(importdir);

// Parse a buffer 
const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(`${__dirname}/test.xlsx`));
// Parse a file 
const workSheetsFromFile = xlsx.parse(`${__dirname}/test.xlsx`);

console.log(workSheetsFromFile[0]);
res.render('import', {});


});






//disconect db	
});



app.listen(3000, function() {

	console.log('listening on 3000');

});