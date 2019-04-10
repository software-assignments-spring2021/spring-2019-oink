function payTransaction(id){
	console.log(id);
	const req = new XMLHttpRequest();
	req.open('post', '/user/pay-transaction/'+id, true);
	req.send();
	location.reload();
}