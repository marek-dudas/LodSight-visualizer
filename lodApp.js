function LodApp(viewElement, width, height) {
	
	this.view = new LodView(width, height, viewElement);
	this.control = new LodControl(this.view); 	
		
	gup = function( name )
	{
	  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	  var regexS = "[\\?&]"+name+"=([^&#]*)";
	  var regex = new RegExp( regexS );
	  var results = regex.exec( window.location.href );
	  if( results == null )
	    return null;
	  else
	    return results[1];
	};
	
	this.sumid = gup('sumid');
	this.minfreq = gup('minfreq');

	this.loadModel = function(minfreq) {
		loadLodModel(modelStoreUrl+"?sumid="+this.sumid+"&minfreq="+this.minfreq, this.control);
	}
	
	if(debug) loadLodModel("file:///C:/Users/user/Dropbox/LODSight/summaryApp/lodsight%20visualizer/getgraph.txt", this.control); //"file:///C:/Users/user/Dropbox/LODSight/summaryApp/lodsight%20visualizer/getgraph.php.htm", this.control); //http://192.168.1.2/lodsight/getgraph.php?sumid=60720955&minfreq=1	
	else this.loadModel(this.minfreq);
}