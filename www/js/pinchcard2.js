
// This version will work on a single touch element, not a list spanning multipal items.
(function(){
    if (typeof this.$ === 'undefined') {
      throw new Error('zepto.js required');
    } else {
      if (!$.fn.forEach) {
        $.fn.forEach = $.fn.each;
       }
    }
  
    PinchCard2 = function(selector){

      var _this = this;
      var selEl = null;
      
      $(selector).bind('gesturestart', function(e){
        selEl = $(e.target)[0];
      })
      .bind('gestureend', function(e) {
        if (e.scale < 1.0) {
          $(selEl).trigger('clsePanel');
        } else if (e.scale > 1.0) {
          $(selEl).trigger('openPanel');
        }
      });
    };
      
}).call(this);


// This version will work on a single touch element, not a list spanning multipal items.
/*
(function(){
    if (typeof this.$ === 'undefined') {
      throw new Error('zepto.js required');
    } else {
      if (!$.fn.forEach) {
        $.fn.forEach = $.fn.each;
       }
    }
  
    PinchCard2 = function(selector){

      var touch = {};
      var selEl = null;
      this.list = [];
      this.dy1 = [],
      this.dy2 = [],
      this.fireAction = null;
      var _this = this;

      $(selector).bind('touchstart', function(e){
        if (e !== undefined && e.touches.length === 2) {
          if ($(e.touches[1].target).closest(selector)[0] === $(e.touches[0].target).closest(selector)[0]) {
            e.preventDefault();
            selEl = $(e.touches[1].target).closest(selector)[0];
            touch.y1 = e.touches[0].pageY;
            touch.y2 = e.touches[1].pageY;
          }
        }
      })
      .bind('touchmove',function(e){
        var threshold = 15;
        if (e.touches.length === 2 && $(e.touches[1].target).closest(selector)[0] === $(e.touches[0].target).closest(selector)[0]) {
          e.preventDefault();
          
          touch.dy1 = e.touches[0].pageY - touch.y1;
          touch.dy2 = e.touches[1].pageY - touch.y2;
          
          console.log(touch.y1, e.touches[0].pageY)
          // _this.dy1.push(touch.dy1);
          // _this.dy2.push(touch.dy2);

          if (_this.dy1.length >= threshold || _this.dy2.length >= threshold) {

            if (_this.fireAction === null) {
              var dy1sum = _.reduce(_this.dy1, function(memo, num){ return memo + num; }, 0); 
              var dy2sum = _.reduce(_this.dy2, function(memo, num){ return memo + num; }, 0);                        
              console.log(dy1sum, dy2sum);
            }

          }

          // Normalize the top / bottom movement
          var normDelta = ((touch.dy1 + touch.dy2) / 6);

          // _this.list.push(Math.round(normDelta));
        
        // Some threshold amount to trigger the move
        // if (_this.list.length >= 5) {
        //   var sum = _.reduce(_this.list, function(memo, num){ return memo + num; }, 0);
        //   
        //   console.log("FIRE", sum);
        //   
        //   if (_this.fireAction === null) {
        //     if (sum < -threshold) {
        //       console.log("OPEN Fired");
        //       $(selEl).trigger('openPanel');
        //     } else if (sum > threshold){
        //       console.log("CLOSE Fired");
        //       $(selEl).trigger('closePanel');
        //     }
        //     if (Math.abs(sum) >= threshold) 
        //       _this.fireAction = true;
        //   }
        //   
        }

      }).bind('touchend touchcancel', function() {
        _this.fireAction = null;
        _this.list = [];
        _this.dy1 = [];
        _this.dy2 = [];
      });
    };
      
}).call(this);
*/