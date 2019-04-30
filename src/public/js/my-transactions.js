function payTransaction(id){
	//console.log(id);
	const req = new XMLHttpRequest();
	req.open('post', '/user/pay-transaction/'+id, true);
	req.send();
	req.addEventListener('load', ()=>{
		if(req.responseText ==="ok"){
			//remove the div


			const fullDiv = document.querySelector(`#trans-${id}`);
			const amountSpan = fullDiv.querySelector("span.amount");
			const AddedSpan	= fullDiv.querySelector("span.added-by");
			const viewBill = fullDiv.querySelector("span.view-bill");

			fullDiv.remove();

			createPaidDiv(amountSpan, AddedSpan, viewBill);
		}

	});

	//location.reload();
}

function createPaidDiv(amountSpan, AddedSpan, viewBill){
	const paidDiv = createElement("article", {"class": "paid"});
	paidDiv.appendChild(amountSpan);
	paidDiv.appendChild(AddedSpan);
	paidDiv.appendChild(viewBill);

	const paidTrans = document.querySelector("#paid-transactions");
	paidTrans.insertBefore(paidDiv, paidTrans.childNodes[0]);

}

function createElement(elementType, attributes, text){
  const elem = document.createElement(elementType);

  for (let key in attributes){
    if (attributes.hasOwnProperty(key)) {
      elem.setAttribute(key, attributes[key])
    }
  }


  if (text){
    elem.appendChild(document.createTextNode(text));
  }

  //console.log(elem);

  return elem;


}