function LodApp(viewElement, width, height) {
    LodLoader.init();

    this.view = new LodView(width, height, viewElement);
    this.control = new LodControl(this.view);
    this.view.initControls(this.control);

    var loadFromUrl = LodLoader.isSummaryIdSet();

    if (debug) {
        this.control.loadModel("file:///C:/Users/user/Dropbox/LODSight/summaryApp/lodsight%20visualizer/getgraph.txt", loadFromUrl, false); //"file:///C:/Users/user/Dropbox/LODSight/summaryApp/lodsight%20visualizer/getgraph.php.htm", this.control); //http://192.168.1.2/lodsight/getgraph.php?sumid=60720955&minfreq=1
    } else {
        this.control.loadModel(null, loadFromUrl, false);
    }
}