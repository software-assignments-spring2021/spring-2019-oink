const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to Oink. This app is currently under construction');
});

module.exports = router;