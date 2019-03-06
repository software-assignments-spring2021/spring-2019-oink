const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = mongoose.model("User");

router.post('/add', (req, res) => {
  res.send('');
});

router.get('/add', (req, res) => {
	const a = {};
	if(req.query.searchUser !== "" && req.query.searchUser !== undefined){
		a.username = req.query.searchUser;
	}
	User.find(a, function(err, data){
		if(data === null){
			res.send('404 CANNOT RETRIEVE');
		}
		else{
			//res.render('reviews', {reviews: data});
			res.send(a.username + " found!");
		}
	});
});

router.post('/split', (req, res)=>{
	res.send('');
});

module.exports = router;