var twitter = function(options) {
  return function(planet) {

    planet.plugins.twitter = {};
    planet.plugins.twitter.options = options;

    planet.plugins.redraw = false;

    planet.onInit(function(done) {         

        d3.json('/twitter', function(err, data) {
          if (err) { done(); return; }         

          if (!data || data.result === 'nok') {done();return;}            

          var world = data;
          land = topojson.feature(world, world.objects.collection); 

          planet.plugins.twitter.topology = land;

          done();
          
        });
    });

    var tweet = [];    
    var tweetSize = 0;
    var now = new Date();
    var newTweet = false;

    setInterval(function(){
      d3.json('/twitter', function(err, data) {
          if (err) { return; }  

          if (!data || data.result === 'nok')
            return;

          now = new Date();

          tweet = [];
          
          var length = data.objects.collection.geometries.length;
          for (var i=length-6;i<length;i++) {                        
              tweet.push({
                text: data.objects.collection.geometries[i].properties.text,
                lat: data.objects.collection.geometries[i].properties.lat,
                lng: data.objects.collection.geometries[i].properties.lng,
              });
          }
          
          newTweet = tweetSize !== length;
          tweetSize = length;
                
          land = topojson.feature(data, data.objects.collection); 

          planet.plugins.twitter.topology = land;          
        });
    }, 7000);

    planet.onDraw(function() {                

      planet.withSavedContext(function(context) {

        if (!planet.plugins.twitter)
          return;

        context.beginPath();        

        context.strokeStyle = '#FFFFFF';              

        context.globalAlpha = 1;
      
        context.fillStyle = '#FFFFFF';
        context.font = 'italic 40pt Calibri';
        context.fillText(planet.plugins.twitter.options.label, 500, 500);

        if (tweet.length > 0) {
          context.font = 'italic 12pt Calibri';
          context.fillText(tweet[0].text, 60, 300);
          context.fillText(tweet[1].text, 60, 330);
          context.fillText(tweet[2].text, 60, 360);
          context.fillText(tweet[3].text, 60, 590);
          context.fillText(tweet[4].text, 60, 620);
          context.fillText(tweet[5].text, 60, 650);
        }

        context.stroke();

        context.strokeStyle = 'white';        
        context.shadowColor = '#eeeeee';
        context.shadowBlur = 20;
        context.shadowOffsetX = 5;
        context.shadowOffsetY = 5;
        context.globalAlpha = 0.5;

        planet.path.context(context).pointRadius(0.001);
        planet.path.context(context)(planet.plugins.twitter.topology);

        context.stroke();
        
        var lat = Math.random() * 170 - 85;
        var lng = Math.random() * 360 - 180;
        if (tweet.length > 0 && newTweet) {                    
          
          context.strokeStyle = 'white';

          context.globalAlpha = 0.5;
          context.shadowColor = '#eeeeee';
          context.shadowBlur = 20;
          context.shadowOffsetX = 2;
          context.shadowOffsetY = 2;
          context.globalAlpha = 0.5;

          var alive = new Date() - now;                        
          var alpha = 1 - (alive / 2000);

          var color = d3.rgb("#FFFFFF");
          color = "rgba(" + color.r + "," + color.g + "," + color.b + "," + alpha + ")";
          context.strokeStyle = color;

          for (var i = 0; i < tweet.length; i++) {
            var angle = Math.random() * 8;

            var circle = d3.geo.circle().origin([tweet[i].lng, tweet[i].lat]).angle(alive / 2000 * angle)();
            planet.path.context(context)(circle);  
          
            context.stroke();
          }

          setTimeout(function() { newTweet = false;}, 2000);          
        }

        context.stroke();        
      
      });
    });    
  };
};