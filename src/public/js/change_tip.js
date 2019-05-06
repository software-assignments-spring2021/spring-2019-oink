function onClickChangeTip(){
	const tip = document.getElementById("tip").value;
	const xml = new XMLHttpRequest();
	xml.open('post', '/api/change-tip', true);
	xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xml.addEventListener('load', () => {
		if(xml.responseText === "Tip Changed"){
			document.getElementById("tip").value = tip;
		}
		else
    		window.location.href = window.location.href + "?error=error";
    });
	xml.send("tip=" + tip);
}