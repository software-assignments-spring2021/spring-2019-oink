
function validateNumber(num){
	return !isNaN(num) && num > 0;
}

function validateBill(bill){
	const isPosNum = validateNumber(bill.amount);

	const splitWith = bill.splitWith.length > 0;
	const comment = bill.comment.length <= 128;

	return comment && splitWith && isPosNum;

}

module.export = {
	validateBill : validateBill
}