const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');


//find all the routes
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const billRouter = require('./routes/bill');

/*Any middleware added needs to go here*/

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

	console.log(`request made to ${req.path}`)
	next();
});
/*********************************/

/*Set routes*/
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/bill', billRouter);

// 404 Page Handler
app.use((req, res) => {
	res.send("404 Error");
});


app.listen(process.env.PORT || 3000, function(){
	console.log('\n/**************************/');
	console.log('/* Listening on port 3000 */');
	console.log('/**************************/\n');
});
