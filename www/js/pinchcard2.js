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

      var touch = {};
      var selEl = null;
      this.list = [];
      this.fireAction = null;
      var _this = this;

      $(selector).bind('touchstart', function(e){
        
        if ( e.touches.length === 2 && $(e.touches[1].target).closest(selector)[0] === $(e.touches[0].target).closest(selector)[0]) {
          e.preventDefault();
          selEl = $(e.touches[1].target).closest(selector)[0];
          touch.x1 = e.touches[0].pageX;
          touch.y1 = e.touches[0].pageY;
          touch.x2 = e.touches[1].pageX;
          touch.y2 = e.touches[1].pageY;          
        }
      }).bind('touchmove',function(e){
        var threshold = 15;
        if (e.touches.length === 2 && $(e.touches[1].target).closest(selector)[0] === $(e.touches[0].target).closest(selector)[0]) {
          e.preventDefault();
            
          touch.dx1 = e.touches[0].pageX - touch.x1;
          touch.dy1 = e.touches[0].pageY - touch.y1;
          touch.dx2 = e.touches[1].pageX - touch.x2;
          touch.dy2 = e.touches[1].pageY - touch.y2;

          // Normalize the top / bottom movement
          var normDelta = ((touch.dy1 + touch.dy2) / 6);
          _this.list.push(normDelta);
          
          // Some threshold amount to trigger the move
          if (_this.list.length >= 5) {
            var sum = _.reduce(_this.list, function(memo, num){ return memo + num; }, 0);

            if (_this.fireAction === null) {
              if (sum < -threshold) {
                // console.log("OPEN Fired");
                $(selEl).trigger('openPanel');
              } else if (sum > threshold){
                // console.log("CLOSE Fired");
                $(selEl).trigger('closePanel');
              }
              if (Math.abs(sum) >= threshold) 
                _this.fireAction = true;
            }
            
          }
        }
      }).bind('touchend touchcancel', function() {
        _this.fireAction = null;
        _this.list = [];
      });

    };
      
}).call(this);