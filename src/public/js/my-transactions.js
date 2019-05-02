function payTransaction(id){
	//console.log(id);
	const req = new XMLHttpRequest();
	req.open('post', '/user/pay-transaction/'+id, true);
	req.send();
	req.addEventListener('load', ()=>{
		if(req.responseText ==="ok"){
			//remove the div
			//check if we are on the view bill page or another page
			let isBillPage = window.location.pathname.split('/')[1] == "bill"; 

			if(isBillPage){
				onBillPage(id)
			}
			else{
				onOtherPage(id)
			}

			
		}

	});

}

function onBillPage(id){
	//get the date it was paid
	const dt = dateTime.create();
	const formatted = dt.format('m/d/Y');

	//on the bill page, we remove the pay button and change the class to paid
	const div = document.querySelector('#userTrans');
	div.querySelector("button.pay").remove();
	div.classList.remove('unpaid');
	div.classList.add('paid');

	const paidOn = createElement("span", {"class": "paidOn"}, `Paid on ${formatted}`);
	div.insertBefore(paidOn, div.querySelector("span.added-by"));


}

function onOtherPage(id){
	//on my transactions and user profile page, we move the div to the paid section
	const fullDiv = document.querySelector(`#trans-${id}`);
	const amountSpan = fullDiv.querySelector("span.amount");
	const AddedSpan	= fullDiv.querySelector("span.added-by");
	const viewBill = fullDiv.querySelector("span.view-bill");

	fullDiv.remove();

	createPaidDiv(amountSpan, AddedSpan, viewBill);

}

function createPaidDiv(amountSpan, AddedSpan, viewBill){
	const dt = dateTime.create();
	const formatted = dt.format('m/d/Y');
	const dateSpan = createElement("span", {"class":"paidOn"}, `Paid on ${formatted}`);
	const paidDiv = createElement("article", {"class": "paid"});
	
	paidDiv.appendChild(amountSpan);
	paidDiv.appendChild(dateSpan)
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