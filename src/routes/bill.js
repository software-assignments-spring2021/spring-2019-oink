const express = require('express');
const router = express.Router();

router.post('/add', (req, res, next) => {
  res.send('');
  //next();
});

router.post('/split', (req, res, next)=>{
	res.send('');
	//next();
});

module.exports = router;