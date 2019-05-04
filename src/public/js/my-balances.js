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

function transactionText(t, username, date){
  let text = ""
  let forgive = false
  if(t.paidBy != username && t.isPaid == true){
    //if the transaction is paid by the session user and they have paid it
    text = "You paid " + t.amount + " to " + t.paidTo + ' on ' + date;
  }
  else if(t.paidBy != username && t.isPaid == false){
    //if the transaction is paid by the session user, and they have NOT paid it
    text = t.paidTo + " requested " + t.amount + " from you on " + date;
  }
  else if(t.paidBy == username && t.isPaid == true){
    //if the transaction is paid by the friend and it is paid
    text = t.paidBy + " paid you " + t.amount + " on " + date;
  }
  else if(t.paidBy == username && t.isPaid == false){
    text = "You requested " + t.amount + " from " + t.paidBy + ' on ' + date;
    forgive = true;
  }

  return {"text":text, "forgive":forgive};
}

function totalText(username, balance){

  if(balance == 0)
    return `You and ${username} are even!`;  
  if(balance > 0)
    return  username + " owes you $" + balance;
  if(balance < 0)
    return "You owe $" + (-1*balance) + " to " + username;

}





function showBalances(username){


  //change out the text in the header 
  document.querySelector("h3#username-balances").textContent = `Transactions with ${username}`;
  //remove the previous transactions from the screen
  document.querySelector('section#transactions').innerHTML = '';



  const req = new XMLHttpRequest();
  req.open('post', '/api/history', true);
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.addEventListener('load', () => {
    const res = JSON.parse(req.responseText);
    //for each transaction


    const section = document.querySelector("section#transactions");
    

    const ul = document.createElement("ul");
    for(let i = 0; i < res.transactions.length; i++){
      let trans = res.transactions[i];

      let text = transactionText(trans, username, res.dates[i]);

      let article = createElement("article", {"class":trans.isPaid ? "paid" : "unpaid"});
      let amount = createElement("span", {"class":"amount"}, text.text);
      let viewBill = createElement("span", {"class":"view-bill"});
      let linkToBill = createElement("a", {"href": `/bill/view/${trans.bill}`}, "View ");
      let arrow = createElement("i", {"class": "fas fa-arrow-right"});

      linkToBill.appendChild(arrow);
      viewBill.appendChild(linkToBill);

      article.appendChild(amount);


      if(text.forgive){
        let forgiveButton = createElement("button", {"class":"pay"}, "Forgive");
        forgiveButton.addEventListener("click", function(){
          //console.log("button clicked");
          const xml = new XMLHttpRequest();
          xml.open('post', '/user/pay-transaction/'+trans._id, true);
          xml.addEventListener("load", ()=>{
            console.log(xml.responseText);
            if(xml.responseText == "ok"){
              console.log('removed');
              //update the balance
              //paid by will always be the friend, so to update the balance on the page
              trans.isPaid = true;
              document.querySelector("h3#totalBalance").textContent = totalText(username, res.balance-trans.amount);
              //set the article to paid
              article.classList.add("paid");
              article.classList.remove("unpaid");

              //remove the forgive button
              forgiveButton.remove();
              //location.reload();

            }
            else{
              console.log("error");
            }
          });
          
          xml.send();
        }); 

        article.appendChild(forgiveButton);
      }

      article.appendChild(viewBill)

      section.appendChild(article);

    }

    //const totalBalance = document.createElement("h3");
    const totalBalance = createElement("h3", {"id":"totalBalance"}, totalText(username, res.balance));
    section.appendChild(totalBalance);

  });
  req.send("username="+username);
}
