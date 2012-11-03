var app = app || {};

(function() {

app.Manager = Backbone.Router.extend({
    routes: {
      ":routetag/:stoptag":"loadPredictions"
    },
    loadPredictions: function(routetag, stoptag) {

      $('#routes').empty();
      $('#title').text();
      $('#routes').text('Loading...');
      var routeDetail = new app.RouteDetail({tag:routetag});
      var router = this;
      routeDetail.on('change', function() {
        var routeStop = _.find(routeDetail.get('stop'), function(s) {
          if(s.tag === stoptag)
            return s;
        });

        _.each(routeDetail.get('direction'), function(d) {
          _.each(d.stop, function(s) {
            if(s.tag === stoptag) {
              router.actuallyLoadPredictions(new app.Prediction({route:routetag, routeTag:stoptag}), d, routeStop);
            }
          });

        });
      });
      routeDetail.fetch();
    },
    actuallyLoadPredictions: function(predictions, direction, stop) {
      predictions.fetch({
        success: function(model, response) {
          app.Controller.showTitle(stop.title + ' <small>(' + direction.branch + ' ' + direction.name + ')</small>');

          var predictionsView = new app.PredictionView({collection:new app.Predictions(predictions),model:predictions,direction:direction, stop:stop});
          app.Controller.showView(predictionsView);
        }
      });
    }
  });

})();
