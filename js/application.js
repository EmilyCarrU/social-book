// Main Entry point into app.

window.App = {};

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
    } else {
      // console.log("We have to filter out the Decades", o);
    }
    
    this.comments = new App.Comments(o.comments);

  }
});

App.Comment = Backbone.Model.extend({});

//
// Collections
//
App.Years = Backbone.Collection.extend({
  model: App.Year,
  initialize: function(o) {
  },

  comparator: function(year) {
    return year.get('year');
  },
  
  parse: function(response) {
    return response.posts;
  }

});

App.Decades = Backbone.Collection.extend({
  model: App.Decade,
  url: "http://book.hyko.org/api/get_tag_posts/?tag=decade",
  
  initialize: function() {
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

  comparator: function(chapter1, chapter2) {
    if (chapter1.decade < chapter2.decade) {
      return 1;
    } else if (chapter1.decade > chapter2.decade) {
      return -1;
    } else if (chapter1.decade === chapter2.decade) {
      if (chapter1.month < chapter2.month) {
        return 1;
      } else if (chapter1.year > chapter2.year) {
        return -1;
      } else if (chapter1.year === chapter2.year) {
        if (chapter1.part < chapter2.part) {
          return 1;
        } else if (chapter1.part > chapter2.part) {
          return -1;
        } else if (chapter1.part === chapter2.part) {
          return 0;
        }
      }
    }
  },
  
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
    "click .button.com_comments_meta_add"   : "showCommentForm",
    "click .cancel" : "cancelCommentForm",
    "click .com_add_form .submit": "addComment"
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
    $(this.el).append(html);
  },
  
  clearForm: function() {
    $(this.el).find('.com_add_form #commentName').val('');
    $(this.el).find('.com_add_form #commentEmail').val('');
    $(this.el).find('.com_add_form #commentText').val('');    
  },
  
  closeForm: function() {
    $(this.el).find('.com_add_sec').remove();
  },
  
  addComment: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var attr = {}
    attr.data = new Date();
    attr.name = $(this.el).find('.com_add_form #commentName').val();
    attr.email = $(this.el).find('.com_add_form #commentEmail').val();
    attr.content = $(this.el).find('.com_add_form #commentText').val();

    this.collection.create(attr);
    this.clearForm();
    this.closeForm();

    // Update the View
  
  },
  
  cancelCommentForm: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this.closeForm();
  },
  
  toggleComments : function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(this.el).find('.com').addClass('com__open');
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
      // console.log(commentView.render().el);
      
      $(this.el).find('.com_comments').append(commentView.render().el);
    }, this);

    return this;
  }
});

App.SectionView = Backbone.View.extend({
  initialize: function() {
    this.model.comments.bind('add', this.addOne, this);
  },
  
  tagName: 'ul',
  
  render : function() {
    // Main section template
    var template =  _.template($("#template-section").html());
    var html = template(this.model.toJSON());
    $(this.el).append(html);
    
    // Comments template     
    if (this.model.get('comment_status') === 'open') {
      var commentsView = new App.CommentsView({collection: this.model.comments, model: this.model });
      $(this.el).append(commentsView.render().el);
    }
    return this;
  },

  addOne: function(comment) {
    
    var commentView = new App.CommentView({ model : comment });
    $(this.el).find('.com_comments').append(commentView.render().el);

    // TODO.
    // Hit the server with the request.    
  }
  
});

App.DecadeView = Backbone.View.extend({
  tagName: 'li',

  events: {
    "click li" : "expandItem",
  },
  
  expandItem : function(e){
    e.preventDefault();
    e.stopPropagation();
    
    $(this.el).find('.years').addClass('expandItem');
    $(this.el).find('.years').toggle();
  },
  
  initialize: function() {
    // Init the years view
    
    var that = this;    
    this.years = new App.Years(chapters);

    
    var itor = function(o) {
      return (o.attributes.decade == that.model.get('decade')) ? true : false;
    }
    
    var yearList = that.years.filter(itor);
    this.years.reset(yearList);     
  },
  
  render: function() {
    
    // Renders the DecadeView Template
    var template =  _.template($("#template-decade").html());
    var html = template(this.model.toJSON());
    $(this.el).append(html);

    // Init the YearsView
    this.yearsView = new App.YearsView({ collection : this.years });
    $(this.el).find('.years').html(this.yearsView.render().el);
    return this;
    
    // this.chaptersView = new App.ChaptersView({ collection : this.chapters });
    // 
    // var template =  _.template($("#template-decade").html());
    // var html = template(this.model.toJSON());
    // $(this.el).append(html);
    // $(this.el).find('.chapters').html(this.chaptersView.render().el);
    //     
    // return this;
  }
});

App.DecadesView = Backbone.View.extend({
  tagName : 'ul',
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
      var sectionView = new App.SectionView({ model : section });
      $(this.el).prepend(sectionView.render().el);
    }, this);

    return this;
  },
});

App.YearsView = Backbone.View.extend({
  tagName: 'ul',
  className : 'yearTOC',
  
  render : function() {
    this.collection.each(function(year) {
      var yearView = new App.YearView({ model : year });
      $(this.el).prepend(yearView.render().el);
    }, this);
    
    return this;
  }  
  
});

App.YearView = Backbone.View.extend({
  tagName: 'li',
  className : 'yearItem',
  events: {
    "click": "preventDefault",
    "click .com_year_wrap": "launch"
  },
  
  launch: function(e) {
    document.location = "#year/" + this.model.id;
  },
  
  preventDefault: function(e) {
    e.preventDefault();
    e.stopPropagation();
  },
    
  // Moved from Decade
  initialize: function(o) {
    
    var that = this;
    this.chapters = new App.Chapters(chapters);
    
    var itor = function(o) {
      return (o.attributes.decade == that.model.get('decade')) ? true : false;
    }
    
    var chapterList = that.chapters.filter(itor);
    this.chapters.reset(chapterList);        
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
  showYear: function(id) {
    $("#chapters").show();
    $("#decades").hide();
    var chap = new App.Chapters(chapters);

    var itor = function(o) {
      return (o.attributes.id == id) ? true : false;
    }
    
    var chapterList = chap.filter(itor);
    chap.reset(chapterList);
    var chaptersView = new App.ChaptersView({ collection : chap });

    $('#chapters').html(chaptersView.render().el);
  },
  
  defaultRoute: function(path) {
    $("#decades").show();
    $("#chapters").hide();
    App.decades = new App.Decades(decadeData);
    App.decadesView = new App.DecadesView({ collection : App.decades });

    $('#decades').html(App.decadesView.render().el);

  }
});

$(function() {
  
  Backbone.emulateJSON = true;
  
  // Initialize the Backbone router.
  App.router = new App.Router();  
  Backbone.history.start();

});