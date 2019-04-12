function showBalances(username){
	
	const header = document.getElementById('header');
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
      	if(t.paidBy != username && t.isPaid == true){
      		li.textContent = "You paid " + t.amount + " to " + t.paidTo + ' on ' + res.dates[i];
      	}
      	else if(t.paidBy != username && t.isPaid == false){
      		li.textContent = "You owe $" + t.amount + " to " + t.paidTo;
      	}
      	else if(t.paidBy == username && t.isPaid == true){
      		li.textContent = t.paidBy + " paid you " + t.amount + " on " + res.dates[i];
      	}
      	else if(t.paidBy == username && t.isPaid == false){
      		li.textContent = t.paidBy + ' owes you ' + t.amount;
      	}
      	
      	ul.appendChild(li);
      }
      header.append(ul);
    });
    req.send("username="+username);
}