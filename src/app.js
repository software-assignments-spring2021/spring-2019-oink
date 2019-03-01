const express = require('express');
const app = express();
const path = require('path');
require('./schemas');

//find all the routes
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const billRouter = require('./routes/bill');

/*Any middleware added needs to go here*/

//serve static files
app.use(express.static(path.join(__dirname, 'public')));

//read in headers as objects
app.use(express.urlencoded({ extended: false }));



/*********************************/

/*Set routes*/
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/bill', billRouter);




app.listen(process.env.PORT || 3000, function(){
	console.log('\n/**************************/');
	console.log('/* Listening on port 3000 */');
	console.log('/**************************/\n');
});
