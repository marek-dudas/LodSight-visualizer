Path = {
		init: function(link) {
			this.links = [];
			this.labelIndexes = [];
		},
		addLink: function(link) {
			this.links.push(link);
			this.endLink = link;
			this.labelIndexes.push(0);
		},
		canConnect: function(link) {
			if(this.links.length > 3) return false;
			if(link.end.getName().includes("rdf:Bag")) return false;
			var canCon = link.start == this.endLink.end;
			if(canCon) {
				for(var i=0; i<this.links.length; i++) {
					if(this.links[i].start == link.end) canCon = false;
				}
			}
			return canCon;
		},
		copy: function() {
			var copy = Object.create(Path);
			copy.links = this.links.slice(0);
			copy.labelIndexes = [];
			for(var i=0; i<this.labelIndexes.length; i++) 
				copy.labelIndexes.push(this.labelIndexes[i]);
			copy.json = LodPathSerializer.getJSONpathFromGivenLinks(this.links);
			return copy;
		},
		equals: function(path) {
			if(this.links.length != path.links.length) return false;
			for(var i=0; i<this.links.length; i++) {
				if(this.links[i] != path.links[i]) return false;
			} 
			return true;
		},
		selectLabelIndex: function(linkIndex, labelIndex) {
			if(linkIndex>=this.labelIndexes.length) alert("linkindex error");
			else {
				this.labelIndexes[linkIndex] = labelIndex;
				this.links[linkIndex].node.selectedLabelIndex = labelIndex;
			}
		},
		equalsWithLinks: function(path) {
			if(this.links.length != path.links.length) return false;
			for(var i=0; i<this.links.length; i++) {
				if(this.links[i] != path.links[i]) return false;
				if(this.labelIndexes[i] != path.labelIndexes[i]) return false;
			} 
			return true;
		}
};

LodPathGenerator = {
		go: function(model, serializer) {
			this.init(model,serializer);
			this.generateOnePaths();
			this.generatePaths();
			for(var i=0; i<this.paths.length; i++) this.filterPathsToUpload(this.paths[i],0);
		},
		init: function(model, serializer) {
			serializer.setModel(model);
			this.model = model;
			this.serializer = serializer;
			this.paths = [];
			this.pathsToUpload = [];
		},
		generateOnePaths: function() {
			for(var i=0; i<this.model.links.length; i++) {
				newPath = Object.create(Path);
				newPath.init();
				newPath.addLink(this.model.links[i]);
				this.paths.push(newPath);
			}
		},
		pathExists: function(path) {
			for(var i=0; i<this.paths.length; i++)
				if(this.paths[i].equals(path)) return true;
			return false;
		},
		expandPaths: function() {
			var foundNewPath = false;
			for(var i=0; i<this.paths.length; i++) {
				for(var j=0; j<this.model.links.length; j++) {
					if(this.paths[i].canConnect(this.model.links[j])) {
						var newPath = this.paths[i].copy();
						newPath.addLink(this.model.links[j]);
						if(!this.pathExists(newPath)) {
							this.paths.push(newPath);
							foundNewPath = true;
							//this.debugPath(newPath);
						}
					}
				}
			}
			return foundNewPath;
		},
		generatePaths: function() {
			while(this.expandPaths());			
		},
		createPaths: function() {
			for(var i=0; i<this.paths.length; i++) this.filterPathsToUpload(this.paths[i]);
		},
		filterPathsToUpload: function(path, startIndex) {
			if(startIndex>=path.links.length) this.uploadPath(path);
			else {
				for(var i=startIndex; i<path.links.length; i++) {
					for(var j=0; j<path.links[i].node.labels.length; j++) {
						path.selectLabelIndex(i, j); //.links[i].node.selectedLabelIndex = j;
						if(!path.links[i].getSelectedLabel().includes("rdf:_"))
							this.filterPathsToUpload(path, i+1);
					}
				}
			}
		},
		pathWasUploaded: function(path) {
			var uploaded = false;
			for(var i=0; i<this.pathsToUpload.length; i++) {
				if(this.pathsToUpload[i].equalsWithLinks(path)) uploaded = true;
			}
			return uploaded;
		},
		uploadPath: function(path) {
			if(! this.pathWasUploaded(path)) {
				var pathCopy = path.copy();
				this.pathsToUpload.push(pathCopy);
				var sparqler = new LodSparqler(this.model);
				sparqler.countExamples(pathCopy, function(exampleCount) {
					if(exampleCount > 4) {
						$.post("http://localhost/lodsight-graph-creator/save-path.php", pathCopy.json);
					}
				});
			}
		},
		debugPath: function(path) {
			var textPath = "";
			for(var i=0; i<path.links.length; i++) {
				textPath += path.links[i].start.name + " -- " + path.links[i].end.name + "\r\n";
			}
			$.post("http://localhost/lodsight-graph-creator/save-path.php", textPath);			
		}
};
