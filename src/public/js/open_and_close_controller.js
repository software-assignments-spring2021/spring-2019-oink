        //if the Nav is open, close it, and vice versa

class OpenSideNav {
	constructor(){}

	perform_behavior(){
		document.querySelector("nav.main-side-nav").style.width = "16%";
        document.querySelector("div.container").style.marginLeft = "16%";
        document.querySelector("div.left-side-header i.fa-bars").classList.add("hidden");
        document.querySelector("div.left-side-header i.fa-times").classList.remove("hidden")
	}

   changeNav(ControlSideNav sideNav){
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
	
	changeNav(ControlSideNav sideNav){
       sideNav.set_state(new OpenSideNav);
   	}
}

class ControlSideNav {

	constructor(starting_state){
		this.state = starting_state;

	}

	change_nav(){
		this.state.change_nav(this);
	}

	set_state(state){
		this.state = state;
	}

	perform_behavior(){
		this.state.perform_behavior();
	}

}


document.addEventListener("DOMContentLoaded", ()=>{

	sideNavControl = new ControlSideNav(new CloseSideNav);

	document.querySelector("div.left-side-header").addEventListener("click", ()=>{
		sideNavControl.change_nav();
		sideNavControl.perform_behavior();
	});

});