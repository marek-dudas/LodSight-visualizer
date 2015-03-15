LodLoader = {};

LodLoader.loadLodModel  = function(lodControl, _url) {
	var url = "";
	if(_url==null) url = this.createUrl();
	else url = _url;

	require(["dojo/_base/xhr"],
		    function(xhr) {
//dojo.xhrGet({
		xhr.get({
    // The URL of the request
    url: url,
    // Handle the result as JSON data
    handleAs: "json",
    // The success handler
    load: function(jsonData) {
    	var lodModel = new LodModel();
    	lodModel.dataset = jsonData.dataset;
    	lodModel.endpoint = jsonData.endpoint;
    	lodModel.maxFrequency = jsonData.maxFrequency;
        
    	/*jsonData.entities.forEach(function(node){
        			lodModel.addNode(node.name, node.prefixcc, node.fromCSet);
        		});*/
    	for(var i=0; i<jsonData.entities.length; i++){
    		var node = jsonData.entities[i];
			lodModel.addNode(node.name, node.prefixcc, node.fromCSet);
		}
        /*jsonData.links.forEach(function(link){
        	if(link.start<0 || link.start>lodModel.nodes.length || link.end<0 || link.end>lodModel.nodes.length) {
        		alert('error in json data on link '+link.prefix+link.name);
        	}
        	else lodModel.addLink(link.label.name, link.label.prefixcc, lodModel.nodes[link.start], lodModel.nodes[link.end], link.fromCSet, link.frequency);
        	
        })*/
    	for(var i=0; i<jsonData.links.length; i++){
    		var link = jsonData.links[i];
    		if(link.start<0 || link.start>lodModel.nodes.length || link.end<0 || link.end>lodModel.nodes.length) {
        		alert('error in json data on link '+link.prefix+link.name);
        	}
        	else lodModel.addLink(link.label.name, link.label.prefixcc, lodModel.nodes[link.start], lodModel.nodes[link.end], link.fromCSet, link.frequency);        	
    	}
    	
        lodModel.prefixes = jsonData.prefixes;
        lodModel.duplicateDataNodes();
        lodControl.viewModel(lodModel);
    },
    // The error handler
    error: function() {
        alert('Error on loading the model.');
    }
		});
});
}

LodLoader.isSummaryIdSet = function() {
	return this.sumid != null;
}

LodLoader.init = function() {	
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
	this.setMinFreq(gup('minfreq'));
}

LodLoader.setMinFreq = function(minfreq) {
	this.minfreq = minfreq;
}
 
LodLoader.createUrl = function() {
	return modelStoreUrl+"?sumid="+this.sumid+"&minfreq="+this.minfreq;
}