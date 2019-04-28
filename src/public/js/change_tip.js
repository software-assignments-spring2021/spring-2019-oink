function onClickChangeTip(){
	const tip = document.getElementById("tip").value;
	const xml = new XMLHttpRequest();
	xml.open('post', '/api/change-tip', true);
	xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xml.addEventListener('load', () => {
    	location.reload();
    });
	xml.send("tip=" + tip);
}