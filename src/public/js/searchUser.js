function openSearch(){
  document.querySelector(".search-bar #search").style.width = "100%";
  document.querySelector(".search-bar #search").placeholder = "Search..."

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


function addResultsToDropDown(docs){
  //console.log(docs);

  const list = document.querySelector("div.search-dropdown ul.search-results");
  console.log(list);

  let a, li;

  docs.forEach((doc)=>{
    a = createElement("a", {"href": `/user/${doc}`});
    li = createElement("li", {}, doc);

    a.appendChild(li);

    list.appendChild(a);


  });

  //document.querySelector("div.search-dropdown").appendChild(list);


}

function searchOnKeyUp(evt){
  document.querySelector("ul.search-results").innerHTML = "" //clear out the dropdown

  const value = evt.target.value;
  console.log(value);


  const req = new XMLHttpRequest();
  req.open('get', `/api/search?value=${value}`, true);

  let names = []

  req.addEventListener("load", ()=>{
    docs = JSON.parse(req.responseText)

    docs.forEach((doc)=>{
      names.push(doc.username);
    });

    addResultsToDropDown(names);
  });

  req.send();



}