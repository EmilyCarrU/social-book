// Main Entry point into app.

window.App = {};

App.Chapter = Backbone.Model.extend({
  slug : '',
  title : '',
  content : ''
  
});


App.Chapters = Backbone.Collection.extend({
  model: App.Chapter,
  url: 'http://book.hyko.org/api/get_recent_posts/',
  parse: function(response) {
    return response.posts;
  },
  
    
});

App.SectionView = Backbone.View.extend({
  tagName : "section",
  className : "chap_sec",
  render : function() {
    
    // just render the tweet text as the content of this element.
    $(this.el).html(this.model.get("content"));
    return this;
  }
});

App.ChaptersView = Backbone.View.extend({
  tagName: 'article',
  className: 'chap',
  
  initialize: function() {
    console.log("IN COLLECTION VIEW")
  },


  render: function(){
    this.collection.each(function(tweet) {
       var sectionView = new App.SectionView({ model : tweet });
       $(this.el).prepend(sectionView.render().el);
     }, this);

     return this;    
    
  },

  
});


App.Router = Backbone.Router.extend({
  routes: {
    '*path':  'defaultRoute'
  },
  
  initialize: function(options) {
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