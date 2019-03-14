

function saveDocAndRedirect(err, saved,res, redirectPath){
	if(err){
		res.send(err);
	}
	else{
		console.log(saved);
		res.redirect(redirectPath);
	}
}

module.exports = {
	saveDocAndRedirect: saveDocAndRedirect
}