function showBalances(username){
	
	const header = document.getElementById('header'); // CLEAR THE CURRENT CONTENTS OF THE SCREEN
	while(header.firstChild){
		header.removeChild(header.firstChild);
	}

	const title = document.getElementsByTagName('h3')[3];
	title.textContent = "Your Transactions With " + username;

	const req = new XMLHttpRequest();
    req.open('post', '/api/history', true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.addEventListener('load', () => {
      const res = JSON.parse(req.responseText);
      const ul = document.createElement("ul");
      for(let i = 0; i < res.transactions.length; i++){
      	const t = res.transactions[i]
      	const li = document.createElement("li");
      	const a = document.createElement("a");
        let forgive;
      	a.textContent = "View Bill";
        a.href = "/fake/link";
      	if(t.paidBy != username && t.isPaid == true){
      		li.textContent = "You paid " + t.amount + " to " + t.paidTo + ' on ' + res.dates[i];
      	}
      	else if(t.paidBy != username && t.isPaid == false){
      		li.textContent = t.paidTo + " loaned you " + t.amount + " on " + res.dates[i];
      		a.href = "/bill/view/" + t.bill;
      	}
      	else if(t.paidBy == username && t.isPaid == true){
      		li.textContent = t.paidBy + " paid you " + t.amount + " on " + res.dates[i];
      	}
      	else if(t.paidBy == username && t.isPaid == false){
      		li.textContent = "You loaned " + t.amount + " to " + t.paidBy + ' on ' + res.dates[i];
      		a.href = "/bill/view/" + t.bill;
          forgive = document.createElement("button");
          forgive.textContent = "Forgive";
          forgive.onclick = function(){
              const xml = new XMLHttpRequest();
              xml.open('post', '/api/remove-transaction/'+t._id, true);
              xml.send();
              location.reload();
          };
      	}
      	
      	ul.appendChild(li);
      	if(a.href != "http://localhost:3000/fake/link"){
      		ul.appendChild(a);
      	}
        if(forgive !== undefined){
          const br = document.createElement("br");
          ul.appendChild(br);
          console.log('test');
          ul.appendChild(forgive);
        }
      }

    const totalBalance = document.createElement("h3");
    if(res.balance == 0)
	 		totalBalance.textContent = "In Total: " + "Your Overall Balance With " + username + " is: " + res.balance + "!";	
	 	if(res.balance > 0)
	 		totalBalance.textContent = "In Total: " + username + " owes you " + "$" + res.balance;
	 	if(res.balance < 0)
	 		totalBalance.textContent = "In Total: " + "You owe $" + (-1*res.balance) + " to " + username; 	

      header.append(ul);
      header.append(totalBalance);
    });
    req.send("username="+username);
}