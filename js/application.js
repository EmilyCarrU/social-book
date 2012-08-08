// Main Entry point into app.

window.App = {};

App.Comment = Backbone.Model.extend({
});

App.Comments = Backbone.Collection.extend({
    model: App.Comment,
});

App.Chapter = Backbone.Model.extend({
  slug : '',
  title : '',
  content : '',
  comment_status : false,
  initialize: function(o) {
    var m = o.slug.match(/(\d{4})-(\d{2})-(\d{2})/);
    this.decade = parseInt(m[1]);
    this.month = parseInt(m[2]);
    this.part = parseInt(m[3]);
    this.comments = new App.Comments(o.comments);
  }
});

App.Chapters = Backbone.Collection.extend({
  model: App.Chapter,
  url: 'http://book.hyko.org/api/get_recent_posts/',

  comparator: function(chapter1, chapter2) {
    if (chapter1.decade < chapter2.decade) {
      return 1;
    } else if (chapter1.decade > chapter2.decade) {
      return -1;
    } else if (chapter1.decade === chapter2.decade) {
      if (chapter1.month < chapter2.month) {
        return 1;
      } else if (chapter1.month > chapter2.month) {
        return -1;
      } else if (chapter1.month === chapter2.month) {
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

App.CommentView = Backbone.View.extend({
  events: {
    "tap .com_comments_comment_reply"     : "addComment",
    "click .com_comments_comment_reply"   : "addComment"
  },
  
  addComment : function(e) {
    e.preventDefault();
    e.stopPropagation();
    alert("Add Comment");
  },
  
  render : function() {
    var template =  _.template($("#template-comment").html());
    var html = template(this.model.toJSON());
    $(this.el).append(html);
    return this;
  }
});

App.CommentsView = Backbone.View.extend({
  
  events: {
    "click .target_com" : "toggleComments",
    "tap .target_com" : "toggleComments"
  },
  
  toggleComments : function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(this.el).find('.com').toggleClass('com__open');
  },
  
  render : function() {
    var template =  _.template($("#template-comments").html());
    var html = template(this.model.toJSON());
    $(this.el).append(html);
    
    this.collection.each(function(comment) {
      var commentView = new App.CommentView({ model : comment });
      $(this.el).find('.com_comments').append(commentView.render().el);
    }, this);

    return this;
  }
});

App.SectionView = Backbone.View.extend({
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
  }
});

App.ChaptersView = Backbone.View.extend({
  tagName: 'article',
  className: 'chap',
  
  render: function(){
    this.collection.each(function(section) {
      var sectionView = new App.SectionView({ model : section });
      $(this.el).prepend(sectionView.render().el);
    }, this);

    return this;
  },
});

App.Router = Backbone.Router.extend({
  routes: {
    '*path':  'defaultRoute'
  },
  
  defaultRoute: function(path) {
        
    App.chapters = new App.Chapters();
    App.chaptersView = new App.ChaptersView({ collection : App.chapters });

    App.chapters.fetch({
      success : function(collection) {
        $('#chapters').html(App.chaptersView.render().el);
      }
    });
  }
});

$(function() {
  
  Backbone.emulateJSON = true;

  // Initialize the Backbone router.
  App.router = new App.Router();  
  Backbone.history.start();

});
