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

  return data;
}
window.App.Section.prototype.parseChap = function(data) {
  return (data.page && data.page.children) ? data.page.children : [];
}

window.App.Section.prototype.render = function() {
    var template =  _.template($("#template-decade").html());
    var html = template(this);
    
    // $(this.el).append(html);
    // 
    // Init the YearsView
    // this.yearsView = new App.YearsView({ collection : this.years });
    // $(this.el).find('.years').html(this.yearsView.render().el);
    // 
    // $(this.el).find('.decade_toc_wrapper').html(this.yearsView.render().el);
    $("#section_" + this.id).find('.decade_toc_wrapper').html("Woo Hoo");
    // $(this.el).find('.decade_toc_wrapper').html("Woo Hoo");
    // return this;
    
    return html;
    
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
  } else {
    console.log("No Section Data");
  }
}

// window.App.Section.prototype.clean = function(data) {
//   return data.page;
// }

/***

  Sections collection

***/

window.App.Sections = function() {
  this.sections = [];
}

window.App.Sections.prototype.init = function() {
  var that = this;
  that.fetch(function(){
    that.build();
    that.render({el:"#decades"});
  });
}

window.App.Sections.prototype.fetch = function(cb) {
  var that = this;
  if (window.App.online) {
    $.getJSON(apiEndpoint + "/get_category_posts/?post_type=chapters&slug=section&order=ASC", function(data, status, xhr){
      that.sectionArray = that.clean(data);
      cb();
    });
  } else {
    // TODO Fetch from Client Side DB 
    that.sectionArray = [];
    cb();
  }
}

window.App.Sections.prototype.render = function(options) {
  
  var el = options.el;
  $(el).append("<ol class='sections'>");
  var $ol = $(el).find("ol");

  for (var i = 0; i < this.sections.length; i++) {
    
    var li = document.createElement('LI');
    li.id = 'section_' + this.sections[i].id;
    li.className = 'decade'
    li.innerHTML = this.sections[i].render();
    $ol.append(li);
  }
}

window.App.Sections.prototype.clean = function(data) {
  return data.posts;
}

window.App.Sections.prototype.build = function() {
  if (this.sectionArray && this.sectionArray.length != 0) {
    for(var i = 0; i < this.sectionArray.length; i++) {
      var newSection = new window.App.Section(this.sectionArray[i]);
      this.sections.push(newSection);      
    }
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