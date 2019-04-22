        //if the Nav is open, close it, and vice versa

class ControlSideNav {

	constructor(starting_state){
		this.state = starting_state;

	}

	get_state(){
		return this.state;
	}

	change_nav(){
		console.log(this.state);
		this.state.change_nav(this);
	}

	set_state(state){
		this.state = state;
	}

	perform_behavior(){
		this.state.perform_behavior();
	}

}

class OpenSideNav {
	constructor(){}

	perform_behavior(){

		document.querySelector("nav.main-side-nav").style.width = "16%";
        document.querySelector("div.container").style.marginLeft = "16%";
        document.querySelector("div.left-side-header i.fa-bars").classList.add("hidden");
        document.querySelector("div.left-side-header i.fa-times").classList.remove("hidden")
	}

	change_nav(sideNav){
		sideNav.set_state(new CloseSideNav());
   }

}


class CloseSideNav {
	constructor(){}

	perform_behavior(){
		document.querySelector("nav.main-side-nav").style.width = "0";
		document.querySelector("div.container").style.marginLeft = "0";
		document.querySelector("div.left-side-header i.fa-bars").classList.remove("hidden");
		document.querySelector("div.left-side-header i.fa-times").classList.add("hidden");
	}
	
	change_nav(sideNav){
		sideNav.set_state(new OpenSideNav());
   	}
}




document.addEventListener("DOMContentLoaded", ()=>{

	sideNavControl = new ControlSideNav(new CloseSideNav());
	console.log("content loaded");

	document.querySelector("div.left-side-header i.fa-bars").addEventListener("click", ()=>{
		sideNavControl.change_nav();
		sideNavControl.perform_behavior();
	});

	document.querySelector("div.left-side-header i.fa-times").addEventListener("click", ()=>{
		sideNavControl.change_nav();
		sideNavControl.perform_behavior();
	});

});