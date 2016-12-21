/**
 * 
 * Feedboard 0.5 
 * 
 */

var FeedBoard = function() {};


FeedBoard.prototype = {
	
    feedControl: function(act) {
		// main controller
		this.feedcontroller = act;
		return(this.feedcontroller);
    },	
	
	checkClient: function(){
	  // check device variables
	  // (control frameworks here)
	}
  
};





window.onload = function() {

	var usrBoard = new FeedBoard();
	var usrClient = usrApp.checkClient();
  
};
