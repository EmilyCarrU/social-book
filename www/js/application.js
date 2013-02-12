// Main Entry point into app.

var apiEndpoint = 'http://book.hyko.org/api';

window.App = {};
window.App.online = false;
//
// Models
// 

App.Decade = Backbone.Model.extend({
  title: '',
  decade: null,
  initialize: function(o) {
    this.set("decade", parseInt(o.slug));
  }
});

App.Year = Backbone.Model.extend({
  title: '',
  year: null,
  initialize: function(o) {
    var m = o.slug.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      this.set('decade', parseInt(m[1]));
      this.set('year', parseInt(m[2]));
      this.set('part', parseInt(m[3]));
    } 
  }
});


App.Chapter = Backbone.Model.extend({
  slug : '',
  title : '',
  content : '',
  comment_status : false,
  decade: null,
  
  initialize: function(o) {

    var m = o.slug.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      this.set('decade', parseInt(m[1]));
      this.set('year', parseInt(m[2]));
      this.set('part', parseInt(m[3]));
    }
    
    this.comments = new App.Comments(o.comments);
  }
});

App.Comment = Backbone.Model.extend({
  sync: function(method, model, options) {
    if (method === "create") {
     $.ajax({
       type: 'POST',
       url: apiEndpoint + '/submit_comment/?post_id=' + options.post_id,
       data: model.toJSON(),
       complete: function(xhr, status) {
         // Done... console.log(xhr, status)
       }
     }) 
    }
  }
});


//
// Collections
//
App.Years = Backbone.Collection.extend({
  model: App.Year,
  initialize: function(o) {
  },
  
  comparator: function(year1, year2) {
    if (year1.get('year') < year2.get('year')) {
      return 1;
    } else if (year1.get('year') > year2.get('year')) {
      return -1;
    } else if (year1.get('year') === year2.get('year')) {
      if (year1.get('part') < year2.get('part')) {
        return 1;
      } else if (year1.get('part') > year2.get('part')) {
        return -1;
      } else if (year1.get('part') === year2.get('part')) {
        return 0;
      }
    }
  },
  
  parse: function(response) {
    return response.posts;
  }

});

App.Decades = Backbone.Collection.extend({
  model: App.Decade,
  url: apiEndpoint + "/get_tag_posts/?tag=decade",
  
  initialize: function(d) {
  },

  comparator: function(decade) {
    return decade.get('decade');
  },
  
  parse: function(response) {
    return response.posts;
  }
  
});

App.Chapters = Backbone.Collection.extend({
  model: App.Chapter,
  // url: 'http://book.hyko.org/api/get_recent_posts/',

  // comparator: function(chapter1, chapter2) {
  //   if (chapter1.get('decade') < chapter2.get('decade')) {
  //     return 1;
  //   } else if (chapter1.get('decade') > chapter2.get('decade')) {
  //     return -1;
  //   } else if (chapter1.get('decade') === chapter2.get('decade')) {   
  //     if (chapter1.get('year') < chapter2.get('year')) {
  //       return 1;
  //     } else if (chapter1.get('year') > chapter2.get('year')) {
  //       return -1;
  //     } else if (chapter1.get('year') === chapter2.get('year')) {
  //       if (chapter1.get('part') < chapter2.get('part')) {
  //         return 1;
  //       } else if (chapter1.get('part') > chapter2.get('part')) {
  //         return -1;
  //       } else if (chapter1.get('part') === chapter2.get('part')) {
  //         return 0;
  //       }
  //     }
  //   }
  // },
  
  parse: function(response) {
    return response.posts;
  }
  
});

App.Comments = Backbone.Collection.extend({
    model: App.Comment,
    localStorage: new Store("app-comments")
});

//
// Views
//

  
App.CommentView = Backbone.View.extend({
  tagName: "li",
  className: "com_comments_comment",
  
  events: {
    "click": "preventDefault",
    "tap .com_comments_comment_reply"     : "addComment",
    "click .com_comments_comment_reply"   : "addComment"
  },
  
  preventDefault: function(e) {
    e.preventDefault();
    e.stopPropagation();
  },
  
  // This is the reply button
  addComment: function(e) {
    e.preventDefault();
    e.stopPropagation();
    alert("Add Reply");
  },
    
  render: function() {
    var template =  _.template($("#template-comment").html());
    var html = template(this.model.toJSON());

    $(this.el).append(html);
    return this;
  }
  
});

App.CommentsView = Backbone.View.extend({
  
  events: {

    "click": "preventDefault",
    "click .target__com": "toggleComments",
    "tap .target__com": "toggleComments",
    "openPanel .taget__com" : "toggleComments",
    "clsePanel .target__com" : "toggleComments",

    "click .button.com_comments_meta_add"   : "showCommentForm",
    "click .cancel" : "cancelCommentForm",
    "click .com_add_form .submit": "addComment"
  },
  
  initialize: function() {
    this.model.bind('change', this.updateCount, this);
  },
  
  preventDefault: function(e) {
    e.preventDefault();
    e.stopPropagation();
  },
  
  // This is the add button on the comments for the form
  showCommentForm : function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Add the Comment Form
    var template =  _.template($("#template-comment-form").html());
    var html = template();
    // This should already be in the DOM (hidden)
    // TODO, move this upto init or render.
    $(this.el).append(html);
  },
  
  clearForm: function() {
    $(this.el).find('.com_add_form #commentName').val('');
    $(this.el).find('.com_add_form #commentEmail').val('');
    $(this.el).find('.com_add_form #commentText').val('');    
  },
  
  closeForm: function() {
    $(this.el).find('.modal').toggleClass("modal__open");
    var that = this;
    window.setTimeout(function(){
      $(that.el).find('.com_add_sec').remove();      
    },1000);

  },
  
  addComment: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var attr = {}
    attr.data = new Date();
    attr.name = $(this.el).find('.com_add_form #commentName').val();
    attr.email = $(this.el).find('.com_add_form #commentEmail').val();
    attr.content = $(this.el).find('.com_add_form #commentText').val();
    attr.post_id = this.model.get('id');
  
    this.collection.create(attr);
    this.clearForm();
    this.closeForm();

    // Update the comment count
    this.model.set('comment_count', this.model.get('comment_count') + 1);   
  },
  
  cancelCommentForm: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this.closeForm();
  },
  
  toggleComments : function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(this.el).find('.dive').first().toggleClass('dive__open');
  },
  
  // Called on 'change'
  updateCount: function() {
    $(this.el).find('.dive_count').html(this.model.get('comment_count'));
  },
  
  render : function() {

    var template =  _.template($("#template-comments").html());
    var html = template(this.model.toJSON());
    $(this.el).append(html);

    if (this.model.get('comment_count') === 0) {
      $(this.el).find('.com_comments_actions_item .view_all').hide();
    }
    
    this.collection.each(function(comment) {
      var commentView = new App.CommentView({ model : comment });
      $(this.el).find('.com_comments').prepend(commentView.render().el);
    }, this);

    return this;
  }
});

App.SectionView = Backbone.View.extend({

  initialize: function() {
    this.model.comments.bind('add', this.addOne, this);
  },
  
  render : function() {
    // Main section template
    var template =  _.template($("#template-section").html());
    var html = template(this.model.toJSON());
    $(this.el).append(html);
    
    // Comments template
    if (this.model.get('comment_status') === 'open') {
      var commentsView = new App.CommentsView({
        collection: this.model.comments,
        model: this.model,
        tagName: 'div',
        className: 'target target__com'
      });
      $(this.el).append(commentsView.render().el);
      // Need to fix something here,
      // Instead of appending the comments to the section,
      // I want to put it after, but that doesn't seem to
      // work inside this view
    }
    return this;
  },

  addOne: function(comment) {

    var commentView = new App.CommentView({
      model : comment
    });
    $(this.el).find('.com_comments').append(commentView.render().el);

    // TODO.
    // Hit the server with the comment.
    // console.log(comment.toJSON());
  }
  
});

App.DecadeView = Backbone.View.extend({
  tagName: 'li',
  className: 'toc_item',

  events: {
    // "click .target__decade_toc" : "expandItem",
    // "tap .target__decade_toc" : "expandItem",
    "openPanel .target__decade_toc" : "expandItemPinch",
    "clsePanel .target__decade_toc" : "clapseItemPinch"
  },
    
  initialize: function() {
    // Init the years view
    var that = this;    
    this.years = new App.Years(chapters);
    
    
    var decadeItor = function(o) {
      if (o.attributes.year) {
        return (o.attributes.decade == that.model.get('decade')  && o.attributes.part == 1) ? true : false;
      }
    }
    
    // Filter out the the other decades
    var yearList = that.years.filter(decadeItor);    
    this.years.reset(yearList);


    // $(this.el).bind("openPanel",function(){
    //   $(that.el).find('.yearTOC').addClass("dive__open");
    // },this);

    // $(this.el).bind("closePanel",function(){
    //   $(that.el).find('.yearTOC').removeClass("dive__open");
    // },this);

  },
  
  expandItemPinch : function(e){
    e.preventDefault();
    e.stopPropagation();

    var diveWrapper = $(this.el).find('.dive').first();
    diveWrapper.addClass('dive__open');
  },

  expandItem : function(e){
    e.preventDefault();
    e.stopPropagation();
    updateSpine(this.model.get('decade'));

    var diveWrapper = $(this.el).find('.dive').first();
    // Would using children or something be faster?
    // Ask Rob about how efficient this is.

    // Kenneth's dive tease test
    // diveWrapper.addClass('dive__open dive__tease');
    // window.setTimeout(function(){$(diveWrapper).removeClass("dive__open dive__tease");}, 100);
    diveWrapper.toggleClass('dive__open');
  },
  
  clapseItemPinch : function(e){
    e.preventDefault();
    e.stopPropagation();

    var diveWrapper = $(this.el).find('.dive').first();
    diveWrapper.removeClass('dive__close');
  },

  render: function() {
    
    // Renders the DecadeView Template
    var template =  _.template($("#template-decade").html());
    var html = template(this.model.toJSON());
    $(this.el).append(html);

    // Init the YearsView
    this.yearsView = new App.YearsView({ collection : this.years });
    // $(this.el).find('.years').html(this.yearsView.render().el);

    $(this.el).find('.decade_toc_wrapper').html(this.yearsView.render().el);
    return this;
  }
  
});

App.DecadesView = Backbone.View.extend({
  tagName : 'ol',
  className : 'decade',
  
  render : function() {
    this.collection.each(function(d) {
      var decadeView = new App.DecadeView({ model : d });
      $(this.el).append(decadeView.render().el);
    }, this);
    
    return this;
  }
});

App.ChaptersView = Backbone.View.extend({
  tagName : 'article',
  className : 'chap',
  render : function() {
    this.collection.each(function(section) {

      var sectionView = new App.SectionView({
        model : section,
        tagName : 'section' // element for one .chap_sec and one .com block
      });

      $(this.el).append(sectionView.render().el)
      // .append("<em>Comment View should actually load here, after section view rather than inside it.</em>");
    }, this);

    return this;
  },
});

App.YearsView = Backbone.View.extend({
  tagName: 'ol',
  className : 'yearTOC',

  render : function() {
    this.collection.each(function(year) {
      var yearView = new App.YearView({ model : year });
      $(this.el).prepend(yearView.render().el);
    }, this);
    
    return this;
  }
});

App.DecadeIntroView = Backbone.View.extend({
  initialize: function() {
    this.el = $("#decadeIntro");
    this.template = _.template($('#template-decades-header').html());
  },
  
  render: function() {
    this.el.html(this.template(this.model.toJSON()));
    return this;
  }
  
});
  
App.YearView = Backbone.View.extend({
  tagName: 'li',
  className : 'yearItem',
  yearToggle: 0,
  events: {
    // "click": "preventDefault",
    // "tap .target__chapterItem": "launch",
    // "click .target__chapterItem": "launch",
    "openPanel .target__chapterItem": "expandItemPinch",
    "clsePanel .target__chapterItem": "clapseItemPinch"
  },
  
  initialize: function(o) {
    var that = this;
    this.chapters = new App.Chapters(chapters);
    
    var itor = function(n) {
      return (n.attributes.decade == that.model.get('decade')) ? true : false;
    }
    
    var chapterList = that.chapters.filter(itor);
    this.chapters.reset(chapterList);
  },

  expandItemPinch : function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.yearToggle === 1) {
      $(this.el).find('.dive').first().addClass('dive__open');
    } else {
      $(this.el).find('.dive').first().addClass('dive__open');
      showYear(this.model.id);
      updateSpine(this.model.get('decade') + '-' + this.model.get('year'));
    }
    this.yearToggle ^= 1;
  },

  launch: function(e) {
    e.preventDefault();
    if (this.yearToggle === 1) {
      $(this.el).find('.dive').first().toggleClass('dive__open');
    } else {
      $(this.el).find('.dive').first().toggleClass('dive__open');
      showYear(this.model.id);
      updateSpine(this.model.get('decade') + '-' + this.model.get('year'));
    }
    this.yearToggle ^= 1;
  },
  
  clapseItemPinch : function(e) {
    e.preventDefault();
    e.stopPropagation();

    $(this.el).find('.dive').first().removeClass('dive__open');
  },

  preventDefault: function(e) {
    e.preventDefault();
    e.stopPropagation();
  },  
  
  render : function() {
    var template =  _.template($("#template-year").html());
    var html = template(this.model.toJSON());
    $(this.el).append(html);
    
    return this;
  }
});

App.Router = Backbone.Router.extend({
  routes: {
    'year/:id': 'showYear',
    '*path': 'defaultRoute'    
  },
  
  // Show all the chapters (sections) for a year
  showYear: showYear,  
  defaultRoute: function(path) {

    var callback = function(decades) {
      $("#decades").show();
      $("#decadeIntro").show();
      // $("#chapters").hide();

      var introData = _.reject(_.map(decades, 
        function(x){ if (_.any(x.tags, function(y){ return y.title == 'intro' })) return x;}), 
        function(z){ return z == undefined }
      )[0];

      var decadeSet = _.reject(decades,function(x){ return x.id == introData.id; });
      
      var introDecade = new App.Decade(introData);
      var introView = new App.DecadeIntroView({model: introDecade })
      introView.render();
      
      App.decades = new App.Decades(decadeSet);
      App.decadesView = new App.DecadesView({ collection: App.decades });

      var len = App.decades.models.length;
      var value = 0;
      for (var i = 0; i < len; i++) {
        var value = value +  100 / len;
        gSpineData[App.decades.models[i].get('decade')] = value;
      }
      
      var allChapters = new App.Chapters(chapters);

      // Update the Spine data for the chapters 
      // Filter our the parts.
      // This is pretty quick and could be improved.
      
      var x = {}
      for (var i = 0; i < allChapters.models.length; i++) {
        if (allChapters.models[i].get('decade') !== undefined) {

          if (x[allChapters.models[i].get('decade')] === undefined) {
            x[allChapters.models[i].get('decade')] = 0;
          }
          
          if (allChapters.models[i].get('part') == 1) {
            x[allChapters.models[i].get('decade')]++;
            var y = allChapters.models[i].get('year');
            var d = allChapters.models[i].get('decade');
            var baseValue = gSpineData[d];
            gSpineData[d+'-'+ y] = y + baseValue;
          }
        }        
      }

      $('#decades').html(App.decadesView.render().el);      
    }
    

    if (window.App.online) {
      $.getJSON(apiEndpoint + '/get_tag_posts/?tag=decade', function(decadeData, status, xhr){ 
        $.getJSON(apiEndpoint + '?json=1&count=1000', function(chapterData, status, xhr){ 
          // Polute this one..
          // allChapters = chapterData.posts;
          chapters = chapterData.posts;
          callback(decadeData.posts);
        });
      });
    } else {      
      // Load Book with cached data decade data.
      callback(decadeData);
    }

  }
});


$(function() {  
  Backbone.emulateJSON = true;
  
  // Initialize the Backbone router.
  App.router = new App.Router();  
  Backbone.history.start();

});

var showYear = function(id) {
    
  var chap = new App.Chapters(chapters);

  var filteredSet = chap.filter(function(o) {
    return (o.attributes.id == id) ? true : false;
  });

  var selectedYear = filteredSet[0].get('year');
  var selectedDecade = filteredSet[0].get('decade');

  var allChapters = new App.Chapters(chapters);

  // we only want chapters from this decade, section.
  var newList = allChapters.filter(function(i){
    return (i.attributes.year == selectedYear && i.attributes.decade == selectedDecade) ? true : false;
  });

  allChapters.reset(newList);

  var chaptersView = new App.ChaptersView({ collection: allChapters });
  $(".chapterItem.decade_"+ selectedDecade +".year_" + selectedYear ).html(chaptersView.render().el);
  $(".chapterItem.decade_"+ selectedDecade +".year_" + selectedYear).show();

}

var gSpineData = {}
var updateSpine = function(id) {
  $("#key").css("top", gSpineData[id] + "%")
}
