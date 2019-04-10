const express = require('express');
const router = express.Router(); 

router.get('/', (req, res) => {
	if(req.session.user){
		res.redirect(`/user/${req.session.user.username}`);
	}
	else{
  		res.render('index');
	}

});

module.exports = router;