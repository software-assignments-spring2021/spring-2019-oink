const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.send('Welcome to Oink. This app is currently under construction');
  next();
});

module.exports = router;