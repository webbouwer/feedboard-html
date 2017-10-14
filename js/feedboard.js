/* Feedboard 0.4 */
/*
Wishlist
- date/time format (.. time ago) .. https://coderwall.com/p/uub3pw/javascript-timeago-func-e-g-8-hours-ago
- desktop and mobile styling
- display bundle by group (bundle)
- !? filter image from description


Todo Version 0.2
- check xml parser
- extend cleanHtmlText (image display)
- loading message
- bundle: category/channel 1.filter 2.remove

Changelog

Version 0.2
- toggleChannel querySelectorAll data-feedurl

Version 0.1
- import opml file to archive and groups
- build group navigation
- import rss channel to archive
Version 0.2
- list channels and items in bundle
- display and reload bundle
Version 0.3
- option: max feeds per channel (settings)
- option: minimize (setting)
Version 0.4
- list active channels ordered in groups
Version 0.5
.. inprogress: fix remove xml request from main threat

*/


/*


var apple = {
    type: "macintosh",
    color: "red",
    getInfo: function () {
        return this.color + ' ' + this.type + ' apple';
    }
}
apple.color = "reddish";
alert(apple.getInfo());

*/





// opml file with links
var linklibrary = ['http://webdesigndenhaag.net/project/feedboard/library.opml',
				   //'https://raw.githubusercontent.com/marklogic-community/feed/master/test-scripts/data/opml_google-reader.opml',
				   //'http://webdesigndenhaag.net/project/feedboard/construct.opml',
				   //http://webdesigndenhaag.net/lab/wp-links-opml.php'
				  ];
// globals
var archive = []; // feedchannel list to be extended on first selection
var groups = []; // array with group names
var channels = []; // array of urls selected for display
var bundle = []; // array of items from selected urls
var maxf = 3; // default amount of feeditems each url


function myFeedBoard() {

  	this.version = 0.4;

	this.init = function(){

			loadOPMLlibrary(linklibrary);
    		displaySettings();
    		displayGroups();
    		displayBundle();
	}

	this.init();

}


onload = function(){

	document.getElementById("contentbar").innerHTML = 'Importing opml data..';

	var FeedBoard = new myFeedBoard();
}


/* still on main threat
	onload = function(){

		document.getElementById("contentbar").innerHTML = 'Importing opml data..';

		FeedBoard.init();
		//loadOPMLlibrary(linklibrary);
	}
	// Class
	var FeedBoard = {

    	version: 0.5,

		init: function () {

			loadOPMLlibrary(linklibrary);
    		displaySettings();
    		displayGroups();
    		displayBundle();

		}

	}
*/


/********* Data ***********/


function loadOPMLlibrary(lib){
    if(lib.length > 0 ){

      for (var i = 0; i < lib.length; i++) {
        importOpmlChannel(lib[i]);
      }

    }else{
      document.getElementById("contentbar").innerHTML = 'No OPML libs (feedlists) available';
    }
}





function importOpmlChannel(url){

    var valid = validateOpmlUrl(url);
    if(valid['chk'] == 1){


        var opml = valid['data'];
        var outlines = opml.getElementsByTagName("outline");

        for (var i = 0; i < outlines.length; i++) {
            if(outlines[i].getAttribute('type') == 'category'){
                // list sub outlines(links) to stack format (array ['groupname','urls'])
                // list urls as new channels (without loading 'items')
                var grp = outlines[i].getAttribute('title');
                var lnks = outlines[i].getElementsByTagName("outline");
                if(lnks.length > 0){

                   for (var l = 0; l < lnks.length; l++) {
                      if(lnks[l].getAttribute('xmlUrl') != ''){
                          var nwchannel = [];
                          nwchannel['title'] = lnks[l].getAttribute('text');
                          nwchannel['feedurl'] = lnks[l].getAttribute('xmlUrl');
                          nwchannel['website'] = lnks[l].getAttribute('htmlUrl');
                          nwchannel['group'] = grp;
                          archive.push(nwchannel);
                          if(checkArr(groups,grp) == 0){
                              groups.push(grp);
                          }

                      }
                   }

                }
            }
        }
    }else{
        document.getElementById("contentbar").innerHTML = 'No feeds available';
    }
}

function importFeedChannel(url,group){
    if(typeof(group) === 'undefined' || typeof(group) === 'undefined') group = 'default';
            var valid = validateFeedUrl(url);
            if(valid['chk'] == 1){

               var feed = valid['data'];
               var newchannel = [];
               newchannel['title'] = feed.getElementsByTagName("title")[0].firstChild.nodeValue;
               newchannel['feedurl'] = url;
               newchannel['group'] = group;
               //newchannel['link'] = feed.getElementsByTagName("link")[0].firstChild.nodeValue;

               newchannel['items'] = [];

			   if( feed.getElementsByTagName("item") ){
               	  var items = feed.getElementsByTagName("item");
			   }else if( feed.getElementsByTagName("entry") ){
				  var items = feed.getElementsByTagName("entry");
			   }


				for (var i = 0; i < 10; i++) {
                   var item = [];
                   item['title'] = items[i].getElementsByTagName("title")[0].firstChild.nodeValue;
                   item['description'] = items[i].getElementsByTagName("description")[0].firstChild.nodeValue;
                   item['pubDate'] = items[i].getElementsByTagName("pubDate")[0].firstChild.nodeValue;
                   item['link'] = items[i].getElementsByTagName("link")[0].firstChild.nodeValue;
                   item['channelgroup'] = group;
                   item['feedurl'] = url;
                   item['feedtitle'] = newchannel['title'];

                   newchannel['items'].push(item);
               }
               return newchannel;
            }else{
               return false;
            }
}

/********* Events ***********/
function toggleChannel(opt){
    var url = opt.getAttribute('data-feedurl');
    var group = opt.getAttribute('data-group');
    var elements = document.querySelectorAll('[data-feedurl]');
    if(checkSubArr(channels,'feedurl',url) == 1){
        removeUrlfromBundle(url,group);
        //opt.setAttribute('class','nonactive');
        for ( var i = 0; i < elements.length; i++ ) {
            if(elements[i].getAttribute('data-feedurl') == url){
            elements[i].setAttribute('class','nonactive');
            }
        }
    }else{
        addUrlToBundle(url,group);
        //opt.setAttribute('class','active');
        for ( var i = 0; i < elements.length; i++ ) {
            if(elements[i].getAttribute('data-feedurl') == url){
            elements[i].setAttribute('class','active');
            }
        }
    }
    displayBundle();
}

function addUrlToBundle(url,group){ // add channel feed items to bundle

	var channel = getArchiveUrl(url,group); //getSubArr(archive,'feedurl',url);
    var urlmax =  document.getElementById("feedmax").options[document.getElementById("feedmax").selectedIndex].text;
    if(channel){


        if(!channel['items']){
            var newchannel = importFeedChannel( url, group);
            if(newchannel['items']){
                for(var c = newchannel['items'].length; c--;){
                    newchannel['items'][c]['website'] = channel['website']; // add website url from opml list (not from rss)
                }
                for(var i = archive.length; i--;){
	            if (archive[i]['feedurl'] === url && archive[i]['group'] === group){
		        archive[i]['items'] = newchannel['items']; // add loaded items to url archive
                        channel = archive[i];
	            }
	        }
            }else{
                alert('Problemo! importing ' + url );
            }
        }
        if(channel['items'].length > 0){
            channels.push(channel); // url to channels selection
            for(i=0;i<urlmax;i++){
                bundle.push(channel['items'][i]); // url items to bundle
            }
            sortBundle();
        }

    }
}

function removeUrlfromBundle(url,group){ // remove channel feed items from channels and bundle
        for(var i = channels.length; i--;){
	    if (channels[i]['feedurl'] === url && channels[i]['group'] === group){
		channels.splice(i, 1);
	    }
	}
        for(var i = bundle.length; i--;){
		if (bundle[i]['feedurl'] === url && bundle[i]['channelgroup'] === group){
		    bundle.splice(i, 1);
		}
	}
}

function reloadBundle(){
    document.getElementById("contentbar").innerHTML = '';
    var urlmax = document.getElementById("feedmax").options[document.getElementById("feedmax").selectedIndex].text;
    bundle = [];
    if(channels.length > 0){
        for(i=0;i<channels.length;i++){
            for(c=0;c<urlmax;c++){
                bundle.push(channels[i]['items'][c]);
            }
        }
        sortBundle();
   }
   displayBundle();
}

/********* UI ***********/
function displayBundle(){
    document.getElementById("contentbar").innerHTML = '';
    var holder = document.createElement('ul');
    holder.setAttribute('id','feedbundle');
    if(bundle.length > 0){
        for(i=0;i<bundle.length;i++){
          var box = document.createElement('li');
          box.setAttribute('class','bundle-item');
          var ttl = document.createElement('h3');
          var lnk = document.createElement('a');
          lnk.setAttribute('href',bundle[i]['link']);
          lnk.setAttribute('target', '_blank');

          var bttl = document.createTextNode(bundle[i]['title']);
          lnk.appendChild(bttl);
          ttl.appendChild(lnk);

          var metabox = document.createElement('h4');

          var web = document.createElement('a');
          web.setAttribute('href',bundle[i]['website']);
          web.setAttribute('target', '_blank');
          var fttl = document.createTextNode(bundle[i]['feedtitle']);
          web.appendChild(fttl);
          metabox.appendChild(web); // website

          var dtt = document.createElement('time');
          var ts = bundle[i]['pubDate'];
          //var tm = calculateSince(ts);
          var dtxt = document.createTextNode( ts );
          dtt.appendChild(dtxt);
	  metabox.appendChild(dtt); // pubdate



	  box.appendChild(metabox); // time and url
          box.appendChild(ttl); // item title

          if(document.getElementById("setminimize").checked != true){
              var txt = document.createElement('div');
              txt.setAttribute('class', 'itemtextbox');
              txt.innerHTML = cleanHtmlText(bundle[i]['description']);
              box.appendChild(txt);
	  }
          holder.appendChild(box);
        }

    }else{
          var box = document.createElement('li');
          box.setAttribute('class','no-display');
          box.innerHTML = 'Select a channel for display';
          holder.appendChild(box);
    }
    document.getElementById("contentbar").appendChild(holder);
    displayChannels();
    setActiveOptions();

        document.getElementById("loaderbox").className = 'hidden';

}

function displayGroups(){
    if(groups.length > 0){
        var box = document.createElement('ul');
        box.setAttribute('id','groupmenu');
        for(i=0;i<groups.length;i++){
            var opt = document.createElement('li');
            opt.setAttribute('data-name', groups[i]);
            opt.setAttribute('onclick','displayGroupChannels(this);');
            opt.innerHTML = groups[i];
            box.appendChild(opt);
        }
        document.getElementById("navbar").appendChild(box);
    }
}

function displayGroupChannels(obj){
    var group = obj.getAttribute('data-name');
    var groupmenu = document.getElementById("groupmenu");
    var options = groupmenu.getElementsByTagName('li');
    for(i=0;i<options.length;i++){
        options[i].removeAttribute('id');
    }
    obj.setAttribute('id', 'currentgroup');
    if(!document.getElementById("groupchannelbox")){
        var box = document.createElement('ul');
        box.setAttribute('id','groupchannelbox');
    }else{
        var box = document.getElementById("groupchannelbox");
        box.innerHTML = '';
    }
    for(i=0;i<archive.length;i++){
        if(archive[i]['group'] == group){
            var opt = document.createElement('li');
            opt.setAttribute('data-feedurl',archive[i]['feedurl']);
            opt.setAttribute('data-group',archive[i]['group']);
            opt.setAttribute('onclick','toggleChannel(this);');
            opt.innerHTML = archive[i]['title'];

			var del = document.createElement('span');
			del.innerHTML = 'x';

			opt.appendChild(del);
            box.appendChild(opt);
        }
    }
    document.getElementById("navbar").appendChild(box);
    setActiveOptions();
}

function displayChannels(){
    document.getElementById("sidebar").innerHTML = '';
    if(channels.length > 0){
        var activebox = document.createElement('div');
        activebox.setAttribute('id','activeselectbox');
        var atl = document.createElement('h3');
        atl.innerHTML = 'Bundle';
        activebox.appendChild(atl);
        for(h=0;h<groups.length;h++){
            if(checkSubArr(channels,'group',groups[h]) == 1){
		var box = document.createElement('div');
		var ttl = document.createElement('h4');
		ttl.innerHTML = groups[h];
		box.appendChild(ttl);
		var lst = document.createElement('ul');
                for(i=0;i<channels.length;i++){
                    if(channels[i]['group'] == groups[h]){
                        var opt = document.createElement('li');
						var del = document.createElement('span');
						del.innerHTML = 'x';
                        del.setAttribute('onclick','toggleChannel(this.parentNode);');

                        opt.setAttribute('data-feedurl',channels[i]['feedurl']);
                        opt.setAttribute('data-group',channels[i]['group']);
                        opt.innerHTML = channels[i]['title'];// + '<sup>x</sup>';


						opt.appendChild(del);

                        lst.appendChild(opt);
		    }
                }
		box.appendChild(lst);
                activebox.appendChild(box);
	    }
	}
        document.getElementById("sidebar").appendChild(activebox);
    }
}

function displaySettings(){
    var dsp = document.createElement('span');
    dsp.setAttribute('id', 'selectboxfeedmax');
    dsp.setAttribute('class', 'option');
    var box = document.createElement('select');
    box.setAttribute('id', 'feedmax');
    box.setAttribute('onchange', 'reloadBundle();');
    var opt1 = document.createElement('option');
    opt1.innerHTML = '1';
    var opt2 = document.createElement('option');
    opt2.innerHTML = '3';
    var opt3 = document.createElement('option');
    opt3.setAttribute('selected','selected');
    opt3.innerHTML = '5';
    var opt4 = document.createElement('option');
    opt4.innerHTML = '7';
    var opt5 = document.createElement('option');
    opt5.innerHTML = '10';
    box.appendChild(opt1);
    box.appendChild(opt2);
    box.appendChild(opt3);
    box.appendChild(opt4);
    box.appendChild(opt5);
    dsp.appendChild(box);
    dsp.appendChild(document.createTextNode(' items/channel'));
    document.getElementById("optionbar").appendChild(dsp);

    var dsp = document.createElement('label');
    dsp.setAttribute('id', 'selectboxminimize');
    dsp.setAttribute('class', 'option');
    var box = document.createElement('input');
    box.setAttribute('id', 'setminimize');
    box.setAttribute('checked', 'checked');
    box.setAttribute('type', 'checkbox');
    box.setAttribute('onchange', 'reloadBundle();');

    dsp.appendChild(box);
    dsp.appendChild(document.createTextNode(' minimize'));
    document.getElementById("optionbar").appendChild(dsp);
}

function setActiveOptions(){
    if(channels.length > 0){
        var groupmenu = document.getElementById("groupmenu");
        var options = groupmenu.getElementsByTagName('li');
        if(options.length > 0){
            for(i=0;i<options.length;i++){
                var grpnm = options[i].getAttribute('data-name');
                if(checkSubArr(channels,'group',grpnm) == 1){
                    options[i].setAttribute('class', 'active');
                }else{
                    options[i].setAttribute('class', 'nonactive');
                }
            }
        }
        var channelmenu = document.getElementById("groupchannelbox");
        var feedoptions = channelmenu.getElementsByTagName('li');
        if(feedoptions.length > 0){
            for(i=0;i<feedoptions.length;i++){
                var fdurl = feedoptions[i].getAttribute('data-feedurl');
                if(checkSubArr(channels,'feedurl',fdurl) == 1){
                    feedoptions[i].setAttribute('class', 'active');
                }else{
                    feedoptions[i].setAttribute('class', 'nonactive');
                }
            }
        }
    }
}







/********* Library ***********/
function isUrl(s) {
var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
return regexp.test(s);
}

function validateOpmlUrl(url){
  if(isUrl(url)){
    var doc = loadXMLHTTP(url);
    var valid = [];
    if(doc.getElementsByTagName("opml") && doc.getElementsByTagName("title")[0].firstChild.nodeValue && doc.getElementsByTagName("outline")){
      valid['chk'] = 1;
      valid['data'] = doc;
    }else{ // no channel title
      valid['chk'] = 'This url might not be a valid OPML url';
    }
  }else{
    valid['chk'] = 'Should be a valid OPML url';
  }
  return valid;
}

function validateFeedUrl(url){
  if(isUrl(url)){
    var doc = loadXMLHTTP(url);
    var valid = [];
    if(doc.getElementsByTagName("channel") && doc.getElementsByTagName("title")[0].firstChild.nodeValue && doc.getElementsByTagName("item")){
      valid['chk'] = 1;
      valid['data'] = doc;
    }else{ // no channel title
      valid['chk'] = 'This url might not be a valid feed channel url';
    }
  }else{
    valid['chk'] = 'Should be a valid url';
  }
  return valid;
}

function loadXMLHTTP(url) { // get feed xml with worker.php

	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", 'assets/xmlparser.php?url=' + escape(url), false);
	xmlhttp.send(null);
	return xmlhttp.responseXML;

}


function cleanHtmlText(trunc){
  var textlength = 760;

  //trunc = trunc.replace(/<img[^>]*>/g,"");
  //trunc = trunc.replace(/<a\b[^>]*>(.*?)<\/a>/i,"");

  	var m,
    urls = [],
    str = trunc,
    rex = /<img.*?src="([^">]*\/([^">]*?))".*?>/g;

	while ( m = rex.exec( str ) ) {
    	urls.push( m[1] );
	}

	//console.log( urls );

  trunc = strip_html_tags(trunc); // cleanup html tags

  if(urls.length > 0){

  	trunc = '<img src="' + urls[0] + '" width="20%" height="auto" onerror="javascript:this.src=\'https://avatars3.githubusercontent.com/u/20241931?v=3&s=460\'" />' + trunc;

	/*  */
  }

  if (trunc.length > textlength) {
    trunc = trunc.substring(0, textlength);
    trunc = trunc.replace(/\w+$/, '');
  }

  return (trunc + '..<div class="clr"></div>');
}

function strip_html_tags(str)
{
   if ((str===null) || (str===''))
       return false;
  else
   str = str.toString();
  return str.replace(/<[^>]*>/g, '');
}
//See more at: http://www.w3resource.com/javascript-exercises/javascript-string-exercise-35.php#sthash.lbXbpewT.dpuf




function checkSubArr(arr,subkey,val){ // check if a value exists in a sub array
    var chk = 0;
           if(arr.length > 0){
	       for(var c=0; c<arr.length; c++){ if(arr[c][subkey] === val){ chk = 1; }}
           }
    return chk;
}

function getSubArr(arr,subkey,val){ // check if a value exists in a sub array
           if(arr.length > 0){
	       for(var c=0; c<arr.length; c++){ if(arr[c][subkey] === val){ return arr[c]; }}
           }
   return false;
}

function getArchiveUrl(url,group){
     if(archive.length > 0){
         for(var c=0; c<archive.length; c++){
             if(archive[c]['feedurl'] === url && archive[c]['group'] === group ){
                 return archive[c];
             }
         }
     }
     return false;
}

function checkArr(arr,val){
    var chk = 0;
    for(var c=0; c<arr.length; c++){ if(arr[c] === val){ chk = 1; }}
    return chk;
}


function sortBundle(){ // sort the bundle by pubDate
    // sort bundle by pubDate
    bundle.sort(function(a, b){
        var keyA = new Date(a.pubDate),
	keyB = new Date(b.pubDate);
	// Compare the 2 dates
	if(keyA < keyB) return 1;
	if(keyA > keyB) return -1;
	return 0;
    });
}