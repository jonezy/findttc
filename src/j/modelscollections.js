var app = app || {};

(function() {
  app.RoutesNearModel = Backbone.Model.extend({});
  app.RoutesNearCollection = Backbone.Collection.extend({
    model:app.RoutesNearModel,
    url: function() {
      return 'http://www.myttc.ca/near/'+this.models[0].get('lat')+','+this.models[0].get('long')+'.json?callback=?';
    },
    parse: function(response) {
      return response.locations;
    }
  });

  app.RouteNearDetailModel = Backbone.Model.extend({
    url: function() {
      return 'http://www.myttc.ca/'+this.get('uri')+'.json?callback=?';
    }
  });

  app.Route = Backbone.Model.extend({});
  app.RouteDetail = Backbone.Model.extend({
    url: function() {
      return 'http://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a=ttc&r='+this.get('tag')+'';
    },
    parse: function(response) {
      return response.route;
    }
  });
  app.Routes = Backbone.Collection.extend({
    model:app.Route,
    url: 'http://webservices.nextbus.com/service/publicJSONFeed?command=routeList&a=ttc',
    parse: function(response) {
      return response.route;
    }
  });

  app.Direction = Backbone.Model.extend({});
  app.Directions = Backbone.Collection.extend({model:app.Direction});

  app.Stop = Backbone.Model.extend({});
  app.Stops = Backbone.Collection.extend({model:app.Stop});

  app.Prediction = Backbone.Model.extend({
    url: function() {
      return 'http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=ttc&r='+ this.get('routeTag')+'&s='+this.get('stop')+'';
    },
    parse: function(response) {
      if(response.predictions.direction)
        return response.predictions.direction.prediction;

      return "";
    }
  });
  app.Predictions = Backbone.Collection.extend({model:app.Prediction});
})();
