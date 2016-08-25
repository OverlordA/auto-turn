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
var filenamedb =''; 
var printcount = '';
var printname = '';
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
		printcount = '';
		printname = ''; 

		

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
        
      
    });

form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
filenamedb = 'import/'+file.name;
importdir = __dirname+'/public/import/'+file.name;
console.log(importdir);
importFile(importdir);
    });

var collection = db.collection('users');


var flag = "Не прибув";
var bodyesnum = "";
//importdir = req.xlfile;
console.log(importdir);

        
 function importFile(path) {
 	// копіюємо в буфер файл що розпізнаємо  
var workSheetsFromBuffer = xlsx.parse(fs.readFileSync(path));  // поправити шлях шоб не був корінь а папка імпорт в пабліку

// розпізнає файл і заносить його в вложений масив обєктів де кожен обєкт це лист
var workSheetsFromFile = xlsx.parse(path);
//var Jan02_1970 = new Date(year, month, date, hours, minutes);
//console.log(Jan02_1970);
//console.log(workSheetsFromFile[0].data[2][7]);
//console.log(new Date((workSheetsFromFile[0].data[2][7] - (25567 + 2))*86400*1000 - (10800*1000)));
//var d = new Date((workSheetsFromFile[0].data[2][7] - (25567 + 2))*86400*1000);
//d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

for(var i = 1; i < workSheetsFromFile[0].data.length; i++){	
		var ds = new Date((workSheetsFromFile[0].data[i][7] - (25567 + 2))*86400*1000);
		var de = new Date((workSheetsFromFile[0].data[i][8] - (25567 + 2))*86400*1000);
		//d.setTime( d.getTime() + d.getTimezoneOffset()*60*1000 );
	collection.insertOne({id_client:(workSheetsFromFile[0].data[i][9]),
		name:(capitalizeFirstLetter(workSheetsFromFile[0].data[i][0])),
		surname:(capitalizeFirstLetter(workSheetsFromFile[0].data[i][1])),
		phone:(workSheetsFromFile[0].data[i][2]),
		email:(workSheetsFromFile[0].data[i][3]),
		sity:(workSheetsFromFile[0].data[i][4]),
		status:(workSheetsFromFile[0].data[i][5]),
		auto:(workSheetsFromFile[0].data[i][6]),
		timestart:(ds),
		timeend:(de),
		numberbodies:(bodyesnum),
		flag:(flag)

	});
}
 }   
   


res.render('import', {});



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
	//var nameuser = '';
	//var phoneuser ='';
	var results=[{name:'',phone:''},{name:'',phone:''},{name:'',phone:''},{name:'',phone:''}] ;
	

				res.render('verifi', {results:results});
	
    
	});
//Змінити флаг прийшов чи ні 
app.post('/changflag', function(req, res) {
var collection = db.collection('users');

collection.updateOne({_id :ObjectId(req.body.idclient)} , { $set: { flag : 'Прибув' }});

collection.find({surname:req.body.surname}).toArray(function(err, results) { 
	

if(err){

	console.log(err);
	var results=[{name:'',phone:''},{name:'',phone:''},{name:'',phone:''},{name:'',phone:''}] ;
	var timetestdrive = ''; 
	res.render('verifi', {results:results,timetestdrive:timetestdrive});
		
}else{
var dates = new Date((results[0].timestart - (10800*1000)));
	var minutes = dates.getMinutes(); minutes = minutes > 9 ? minutes : '0' + minutes; 
	var hours = dates.getHours(); hours = hours > 9 ? hours : '0' + hours; 
	var month = dates.getMonth(); month = month > 9 ? month : '0' + month;
	var day = dates.getDay(); day = day > 9 ? day : '0' + day;

	timetestdrive = dates.getFullYear() +"-"+ month +"-"+ day+" "+hours +":"+ minutes;
	res.render('verifi', {results:results,timetestdrive:timetestdrive});
}
	
    
	});

});
//сторінка реєстрації нового клієнта 
app.post('/adduserrender', function(req, res) {
				res.render('adduser', {});
	
    
	});

// шукати клієнта по коду з бази 8 цифр
app.post('/codverif', function(req, res) {
	var collection = db.collection('users');

  //console.log(req.body.codk);
  collection.find({id_client:req.body.codk}).toArray(function(err, results) { 
if(err){
	console.log(err);
var results=[{name:'',phone:''},{name:'',phone:''},{name:'',phone:''},{name:'',phone:''}] ;
var timetestdrive = ''; 
				res.render('verifi', {results:results,timetestdrive:timetestdrive});
		
}else{
	var dates = new Date((results[0].timestart - (10800*1000)));
	var minutes = dates.getMinutes(); minutes = minutes > 9 ? minutes : '0' + minutes; 
	var hours = dates.getHours(); hours = hours > 9 ? hours : '0' + hours; 
	var month = dates.getMonth(); month = month > 9 ? month : '0' + month;
	var day = dates.getDay(); day = day > 9 ? day : '0' + day;

	timetestdrive = dates.getFullYear() +"-"+ month +"-"+ day+" "+hours +":"+ minutes;
res.render('verifi', {results:results,timetestdrive:timetestdrive});


}
			
	
    	});
			
		
	});


// шукати клієнта з бази по прізвищу 
app.post('/nameverif', function(req, res) {

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
	var collection = db.collection('users');

  //console.log(req.body.surname);

  collection.find({surname:capitalizeFirstLetter(req.body.surname)}).toArray(function(err, results) { 
if(err){
	console.log(err);
var results=[{name:'',phone:''},{name:'',phone:''},{name:'',phone:''},{name:'',phone:''}] ;
var timetestdrive = ''; 
				res.render('verifi', {results:results,timetestdrive:timetestdrive});
		
}else{
	var dates = new Date((results[0].timestart - (10800*1000)));
	var minutes = dates.getMinutes(); minutes = minutes > 9 ? minutes : '0' + minutes; 
	var hours = dates.getHours(); hours = hours > 9 ? hours : '0' + hours; 
	var month = dates.getMonth(); month = month > 9 ? month : '0' + month;
	var day = dates.getDay(); day = day > 9 ? day : '0' + day;

	timetestdrive = dates.getFullYear() +"-"+ month +"-"+ day+" "+hours +":"+ minutes;



res.render('verifi', {results:results, timetestdrive:timetestdrive});


}
			
	
    	});
			
		
	});
//додавання користувача в базу 
app.post('/adduser', function(req, res) {
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
	var collection = db.collection('users');
var flag = 'Прибув';
var start ='';
var end = '';
var codclient = '';
	collection.insertOne({id_client:(codclient),
		name:(capitalizeFirstLetter(req.body.name)),
		surname:(capitalizeFirstLetter(req.body.surname)),
		phone:(req.body.phone),
		email:(req.body.email),
		sity:(req.body.sity),
		status:(req.body.status),
		auto:(req.body.auto),
		timestart:(start),
		timeend:(end),
		numberbodyes:(req.body.numberbodies),
		flag:(flag) });
	

			
				res.render('adduser', {});

});









//disconect db	
});



app.listen(3000, function() {

	console.log('listening on 3000');

});