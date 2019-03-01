const express = require('express');

const router = express.Router();

router.post('/register', (req, res, next) => {
	res.send('');
  	next();
});

router.post('/login', (req, res, next) => {
  	res.send('');
  	next();
});

router.get('/logout', (req, res, next) => {
  	res.send('');
  	next();
});

router.get('/:username', (req, res, next) => {
	const username = req.params.username;

	res.send(`profile page for ${username}`);
  	next();
});



module.exports = router;