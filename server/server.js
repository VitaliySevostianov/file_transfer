const fs = require('fs');

const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectID;
const bodyParser = require('body-parser');

const app = express();
const jsonParser = express.json();

app.use(bodyParser({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb' }));
app.use(bodyParser());

app.use(bodyParser.json());
let dbClient;

const mongoClient = new MongoClient('mongodb://localhost:27017/', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

mongoClient.connect(function (err, client) {
	if (err) return console.log(err);
	dbClient = client;
	app.locals.collection = client.db('usersdb').collection('users');
	const server = app.listen(3000, () => {
		const { address, port } = server.address();
		console.log(`Listening at http://${address}:${port}`);
	});
});
app.get('/', (req, res) => {
	// const collection = req.app.locals.collection;
	// collection.find({}).toArray(function (err, users) {
	// 	if (err) return console.log(err);
	res.send('files');
	// });
	// import a from './'
	// fs.readdir('./', (r) => console.log(r));
});
app.post('/', jsonParser, function (req, res) {
	if (!req.body) return res.sendStatus(400);
	const data = req.body.reqData;
	for (let i = 0; i < data.length; i++) {
		fs.writeFile(
			data[i].filenames,
			data[i].content,
			{ encoding: 'base64' },
			function (err) {
				console.log('----------------------');
				console.log(data[i].filenames);
				console.log('File created');
				if (err) {
					console.log(err);
				}
			},
		);
	}

	// const collection = req.app.locals.collection;
	// collection.insertOne(user, function (err, result) {
	// 	if (err) return console.log(err);
	// 	res.send(user);
	// });
});
