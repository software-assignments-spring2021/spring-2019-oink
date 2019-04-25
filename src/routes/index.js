const express = require('express');
const router = express.Router(); 
const path = require('path')
router.get('/', (req, res) => {
	if(req.session.user){
		res.redirect(`/user/${req.session.user.username}`);
	}
	else{
  		res.sendFile(path.join(__dirname, "..", "public", "html", 'index.html'))
	}

});

module.exports = router;