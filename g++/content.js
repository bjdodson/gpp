var EMBED_LINK = "http://mobisocial.stanford.edu:8888/embed?"
var JAIL_LINK = "http://mobisocial.stanford.edu:8888/jail?"
var CAJA = false;

// this is a hack to update the live g+ page.
var poll_loop = function() {
    gpp.each("post", function(p) {
      if (!$(p).hasClass("gpp-transformed")) {
        $(p).addClass("gpp-transformed");
        postify(p);
        //$(p).css("background-color",'#'+Math.floor(Math.random()*4095).toString(16));
      }
    });
    checkForLinks();
    //window.setTimeout(poll_loop, 5000);
}

var on_load = function() {
    span = "<span id='circleTag' style='float:right;font-size:20px;'># <input style='background-color:#ddd;width:150px;'></input></span>";
    $(".a-f-tr").append(span);
}

on_load();

var postify = function(p) {
  var r = { "post" : p };

  // update content
  var body = $(p).find(".Jq, .DE");
  var render = $(body).html();
  content = "" + render.toString();
  while (true) {
    i = content.indexOf("$html");
    if (i == -1) break;
    j = content.indexOf("$end");
    if (j == -1) j = content.length - 1;
    text = content.substr(i + "$html".length, j - i - "$html".length);
    content = content.substr(0,i).concat("<div style='border:1px solid #555;margin-bottom:30px;position:relative;background-color:#ccc'><div style='position:relative;margin-left:20px;'>",
      text
        .replace(/&lt;/g,"<")
        .replace(/&gt;/g,">")
        .replace(/&amp;/g,"&")
      , "</div></div>");
    render = content;
  }
  $(body).html(render);
}

function getCurrentCircle() {
  return $(".a-b-f-U-R").html();
}

String.prototype.startsWith = function(prefix){
    return this.lastIndexOf(prefix, 0) === 0;
}

function getQueryVariable(variable, location) {
    if(location.indexOf("?") == -1)
        return undefined;
    var query = location.substring(location.indexOf("?") + 1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

function getPostablesDiv() {
 // class: n-Wa-ph-Ob n-Y-zb
 return $(".n-Wa-ph-Ob");
}

var gpp = {};
gpp.each = function(thing, act) {
  var divs = document.documentElement.getElementsByTagName("div");
  for(var i = 0; i < divs.length; ++i) {
    var div = divs[i];
    if (things[thing].selector(div)) {
      act(div);
    }
  }
}

var post = {};
post.selector = function(div) {
    return div.getAttribute("id") 
        && div.getAttribute("id").startsWith("update-");
}

var things = {"post":post};

var checkForLinks = function() {
    var divs = document.documentElement.getElementsByTagName("div");
    for(var i = 0; i < divs.length; ++i) {
        var div = divs[i];
        var data_content_url = div.getAttribute("data-content-url");
        if(data_content_url === null)
            continue;
        if(data_content_url.startsWith(EMBED_LINK)) {
            // get params
            var app_url = getQueryVariable("app", data_content_url);
            var replace = div.parentNode;
            var parent = replace.parentNode;
            
            //remove the junk in the main post that tries to let the picture be removed
            if(parent) {
                var next = parent.nextSibling;
                if(next != null && next.getAttribute("tabindex") !== null) {
                    //skip the tab index
                    next = next.nextSibling;
                    if(next) {
                        //skip the embed cancel
                        next = next.nextSibling;
                        while(next != null) {
                            var me = next;
                            next = next.nextSibling;
                            me.parentNode.removeChild(me);
                        }
                    }
                }
            }
            var jail = null;
            //create an iframe for compatibility
            jail = document.createElement("iframe");
            if(CAJA) {
                jail.setAttribute("src", data_content_url.replace(EMBED_LINK, JAIL_LINK));
            } else {
                jail.setAttribute("src", app_url);
                jail.setAttribute("sandbox", "allow-same-origin allow-scripts allow-forms");
            }
            jail.setAttribute("frameborder", 0);
            //common props
            var width = getQueryVariable("width", data_content_url);
            if(width != undefined)
                jail.setAttribute("width", width);
            else
                jail.setAttribute("width", "100%");
            var height = getQueryVariable("height", data_content_url);
            if(height != undefined)
                jail.setAttribute("height", height);
            else
                jail.setAttribute("height", "260");

            parent.insertBefore(jail, replace);
            parent.removeChild(replace);
        }
    }
}

window.setTimeout(poll_loop, 1000);
