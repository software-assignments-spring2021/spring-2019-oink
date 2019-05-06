const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');

require('./schemas'); 
const mongoose = require('mongoose');
const User = mongoose.model("User");

//find all the routes
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const billRouter = require('./routes/bill');
const apiRouter = require('./routes/api');
const groupRouter = require('./routes/group');


/*Any middleware added needs to go here*/



/*
app.use(multer({ dest: './public/img/',
	rename: function (fieldname, filename) {
	return filename;
	},
}));*/

//serve static files
app.use(express.static(path.join(__dirname, 'public')));

//read in headers as objects
app.use(express.urlencoded({ extended: false }));

// read hbs
app.set('view engine', 'hbs'); //enable hbs

//add sessions
app.use(session({
    secret: 'secrets should be kept between friends',
    resave: false,
    saveUninitialized: true,
}));


app.use((req, res, next) => {
	if(req.session.user){
		res.locals.sessionUser = req.session.user;
		User.find({"username": { $ne: req.session.user.username}}, (err, users) => {
			res.locals.allUsers = users;
		});
		app.set('view options', { layout: 'loggedInLayout' });
		next();
	}
	else{
		app.set('view options', { layout: 'layout' });
		next();
	}
});

//for debugging
app.use(function(req, res, next){

	console.log(`request made to ${req.path}`);
	// if(req.session.user){
	// 	console.log(req.session.user);
	// }
	next();
});



/*********************************/

/*Set routes*/
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/bill', billRouter);
app.use('/api', apiRouter);
app.use('/group', groupRouter);

// 404 Page Handler
app.use((req, res) => {
	res.send("404 Error");
});


app.listen(process.env.PORT || 3000, function(){
	console.log('\n/**************************/');
	console.log('/* Listening on port 3000 */');
	console.log('/**************************/\n');
});
