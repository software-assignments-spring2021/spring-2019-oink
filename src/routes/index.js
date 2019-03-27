const express = require('express');
const router = express.Router(); 

router.get('/', (req, res) => {
  res.render('home');
});

router.get('/newpath', (req, res) => {
  res.render('newpage');
});

module.exports = router;