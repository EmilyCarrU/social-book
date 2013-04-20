var apiEndpoint = 'http://book.hyko.org/api';

window.App = {};
window.App.online = true;
window.App.optionClick = true; // no effect on comments yet
window.App.optionPinch = true; // no effect on comments yet
window.App.optionTap = false; // no effect on comments yet


window.App.Paragraph = function(rawData) {
  this.data = this.cleanParagraph(rawData);
  return this;
}

window.App.Paragraph.prototype.render = function(options) {
  var template =  _.template($("#template-paragraph").html());
  var html = template(this);
  var el = $(options.el).append(html);
  return el.html() 
}


window.App.Paragraph.prototype.cleanParagraph = function(data) {
  this.id = data.id;
  this.title = data.title;
  this.content = data.content;
  this.comment_count = data.comment_count;
  return data
}

// A Single Chapter
window.App.Chapter = function(rawData) {
  this.paragraphArray = [];
  this.paragraphs = [];
  this.cleanChapter(rawData);  
  // Build out the final parahraph level
  this.build();
  return this;
}

window.App.Chapter.prototype.cleanChapter = function(data) {
  this.id = data.id;
  this.title = data.title;
  this.url = data.url;
  this.paragraphArray = data.children;
  return data;
}

window.App.Chapter.prototype.build = function() {
  if (this.paragraphArray && this.paragraphArray.length != 0) {
    for(var i = 0; i < this.paragraphArray.length; i++) {
      var newParagraph = new window.App.Paragraph(this.paragraphArray[i]);
      this.paragraphs.push(newParagraph);
    }
  } else {
    console.log("No Paragraph Data");
  }
}

window.App.Chapter.prototype.render = function(options) {

  var template =  _.template($("#template-chapter").html());
  var html = template(this);
  var el = $(options.el).append(html);

  var el2 = el.find(".chapter_toc_wrapper");
  // el2.append("<ol class='chapters'>");
  // var $ol = el2.find("ol.chapters");
  // console.log($ol)
  
  for (var i = 0; i < this.paragraphs.length; i++) {
    var h = this.paragraphs[i].render({el:el2});
    el2.html(h)
  }
  
  return el.html();
}


// A Single secion of content
window.App.Section = function(rawData) {
  this.data = this.cleanSection(rawData);
  this.title;
  this.id;
  this.content;
  this.url;
  this.chapters = [];
  this.chapterArray = [];
  
  var that = this;
  that.fetch(function(){
    that.build();
  });
  
  return this;
}

window.App.Section.prototype.cleanSection = function(data) {
  this.id = data.id;
  this.title = data.title;
  this.content = data.content;
  this.url = data.url;
  // this.chapters = [];

  return data;
}
window.App.Section.prototype.parseChap = function(data) {
  return (data.page && data.page.children) ? data.page.children : [];
}

window.App.Section.prototype.render = function(options) {
    var that = this;
    var template =  _.template($("#template-decade").html());
    var html = template(this);
    $(options.el).append(html);
    
    var el = $(options.el).find('.decade_toc_wrapper');
    
    for (var n = 0; n < that.chapters.length; n++) {
      var h = that.chapters[n].render({el: el});
      el.html(h);
    }
    
    return el.html();
}

window.App.Section.prototype.fetch = function(cb) {
  var that = this;
  $.getJSON(apiEndpoint + "/get_page/?post_type=chapters&id=" + this.id + "&children=true", function(data, status, xhr){
    that.chapterArray = that.parseChap(data);
    cb();
  });
}

window.App.Section.prototype.build = function() {
  if (this.chapterArray && this.chapterArray.length != 0) {
    for(var i = 0; i < this.chapterArray.length; i++) {
      var newChapter = new window.App.Chapter(this.chapterArray[i]);
      this.chapters.push(newChapter);
    }
     Sections.render({el:"#decades"});
  } else {
    console.log("No Section Data");
  }
}


/***

  Sections collection

***/

window.App.Sections = function() {
  this.sections = [];
}

window.App.Sections.prototype.init = function() {
  var that = this;
  that.fetch(function(self){
    self.build(function(self){
    });
  });
}

window.App.Sections.prototype.fetch = function(cb) {
  var that = this;
  if (window.App.online) {
    $.getJSON(apiEndpoint + "/get_category_posts/?post_type=chapters&slug=section&order=ASC", function(data, status, xhr){
      that.sectionArray = that.clean(data);
      cb(that);
    });
  } else {
    // TODO Fetch from Client Side DB 
    that.sectionArray = [];
    cb(that);
  }
}

window.App.Sections.prototype.render = function(options) {
  var el = options.el;
  $(el).append("<ol class='sections'>");
  var $ol = $(el).find("ol");

  for (var i = 0; i < this.sections.length; i++) {
    var li = document.createElement('LI');
    li.id = 'section_' + this.sections[i].id;
    li.className = 'decade';
    li.innerHTML = this.sections[i].render({el:li});
    $ol.append(li);
  }
}

window.App.Sections.prototype.clean = function(data) {
  return data.posts;
}

window.App.Sections.prototype.build = function(cb) {
  if (this.sectionArray && this.sectionArray.length != 0) {
    for(var i = 0; i < this.sectionArray.length; i++) {
      var newSection = new window.App.Section(this.sectionArray[i]);
      this.sections.push(newSection);      
    }
    if (cb) cb(this)    
  } else {
    console.log("No Section Data");
  }
}

if(!Modernizr.touch && window.App.optionClick && !window.App.optionTap) {
  window.App.optionClickDev = true; // for when we need to test the pinch on touch, and still want to click on desktop
}

var Sections = new window.App.Sections();

// Load the application
$(function() {
  Sections.init();
});