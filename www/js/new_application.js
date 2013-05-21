var apiEndpoint = 'http://book.hyko.org/api';

window.App = {};
window.App.online = true;


App.Section = Backbone.Model.extend({
  initialize: function() {
  },
  
  url : function() {
     return apiEndpoint + "/get_page/?post_type=chapters&id="+ this.id + "&children=true"
  },
  parse: function(response) {
    return response.page;
  }
});

App.Sections = Backbone.Collection.extend({
  model: App.Section
});

App.Paragraph = Backbone.Model.extend({
  initialize: function(o) {
    this.id = o.id;
    this.comments = new App.Comments(o.comments);
  }
});

App.Chapter = Backbone.Model.extend({
});

App.Chapters = Backbone.Collection.extend({
  model: App.Chapter
});

App.Paragraphs = Backbone.Collection.extend({
  model: App.Paragraph,
});

App.ParagraphView = Backbone.View.extend({
  tagName : 'li',
  className : 'para_item',
  
  initialize: function() {
    this.model.comments.bind('add', this.addOne, this);
  },
  
  render: function() {
    var that = this;
    // Comments template
    if (that.model.get('comment_status') === 'open') {
      var commentsView = new App.CommentsView({
        collection: that.model.comments,
        model: that.model,
        tagName: 'div',
        className: 'target target__com'
      });
      $(this.el).append(commentsView.render().el);
    }
    return $(this.el).append(this.model.toJSON().content);
    //return  this.el; // this.model.toJSON().content;
  },
  
  addOne: function(comment) {
    var commentView = new App.CommentView({
      model : comment
    }); 
    $(this.el).find('.com_comments').append(commentView.render().el);
  }
})

App.Comment = Backbone.Model.extend({
  sync: function(method, model, options) {
    if (method === "create") {
     $.ajax({
       type: 'POST',
       url: apiEndpoint + '/submit_comment/?post_id=' + model.get('post_id'),
       data: model.toJSON(),
       complete: function(xhr, status) {
         var response = JSON.parse(xhr.responseText);
         if (response.status === "error") {
           alert(response.error)
         }
       },
       error: function(xhr, status) {
         console.log(xhr)
         // alert()
       }
     })
    }
  }
});

App.Comments = Backbone.Collection.extend({
    model: App.Comment,
    localStorage: new Store("app-comments")
});

App.ParagraphsView = Backbone.View.extend({
  tagName : 'ol',
  className : 'para_list',
  
  render: function() {
    this.collection.each(function(d) {
      var paraView = new App.ParagraphView({ model : d });
      $(this.el).append(paraView.render());
    }, this);
    return this;
  }
});

App.ChapterView = Backbone.View.extend({
  
  tagName: "li",
  render : function() {
    var that = this;
    
    var template =  _.template($("#template-chapter").html());
    var html = template(this.model.toJSON());
    $(this.el).append(html);
    
    that.paragraphs = new App.Paragraphs(this.model.attributes.children)
    that.paragraphsView = new App.ParagraphsView({ collection : that.paragraphs });
    $(that.el).find('.paragraphs_toc_wrapper').html(that.paragraphsView.render().el);
    
    return this;
  }
})

App.ChaptersView = Backbone.View.extend({
  tagName : 'ol',
  className : 'chapters',
  render: function() {
    this.collection.each(function(d) {
      var chapterView = new App.ChapterView({ model: d });
      $(this.el).append(chapterView.render().el);
    }, this);
    return this;
  }
});

App.SectionsView = Backbone.View.extend({
  tagName : 'ol',
  className : 'decade',
  render : function() {
    this.collection.each(function(d) {
      var sectionView = new App.SectionView({ model : d });
      $(this.el).append(sectionView.render().el);
    }, this);
    return this;
  }
});

App.SectionView = Backbone.View.extend({
  tagName: 'li',
  className: 'toc_item',
  render: function() {
    var that = this;
    var template =  _.template($("#template-section").html());
    var html = template(this.model.toJSON());
    $(this.el).append(html);
    
    this.model.fetch({success: function(model, response){
      // Init the Chapters
      that.chapters = new App.Chapters(model.attributes.children)
      that.chaptersView = new App.ChaptersView({ collection : that.chapters });
      $(that.el).find('.decade_toc_wrapper').html(that.chaptersView.render().el);
    }});
    
    return this;
  }
});


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
    // "click .target__com": "toggleComments",
    // "tap .target__com": "toggleComments",
    // "openPanel .taget__com" : "toggleComments",
    // "clsePanel .target__com" : "toggleComments",

    "click .button.com_comments_meta_add" : "showCommentForm",
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

    if (!$(this.el).find('.com_add_sec ').is(":visible")) {
      var template =  _.template($("#template-comment-form").html());
      var html = template();
      $(this.el).append(html);
    }
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


App.Router = Backbone.Router.extend({
  routes: {
    '*path': 'defaultRoute'
  },

  defaultRoute: function(path) {

    var callback = function(sections) {
      App.sections = new App.Sections(sections)
      App.sectionView = new App.SectionsView({ collection: App.sections });
      
      $('#decades').html(App.sectionView.render().el);
      $("#decades").css({"max-height":"100%"});
    }

    if (window.App.online) {
      $.getJSON(apiEndpoint + '/get_category_posts/?post_type=chapters&slug=section&order=ASC', function(sectionData, status, xhr){
        callback(sectionData.posts);
      });
    } else {
      console.log("offline")
    }
  }
});

$(function() {
  Backbone.emulateJSON = true;

  // Initialize the Backbone router.
  App.router = new App.Router();
  Backbone.history.start();

});