var app = app || {};

(function() {
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
    },
    streetCarRoutes: function() {
      return this.filter(function(r) {
        return (r.get('tag').length > 2 && r.get('tag').slice(0,1) === '5');
      });
    },
    busRoutes: function() {
      return this.filter(function(r) {
        var tag = r.get('tag');
        if(tag.length === 2) {
          return r;
        } else if (tag.length > 2) {
          if(tag.slice(0,1) !== '5')
            return r;
        }
      });
    }
  });

  app.Direction = Backbone.Model.extend({});
  app.Directions = Backbone.Collection.extend({model:app.Direction});

  app.Stop = Backbone.Model.extend({});
  app.Stops = Backbone.Collection.extend({model:app.Stop});

  app.VehicleLocation = Backbone.Model.extend({
  
    url: function() {
      return 'http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=ttc&r='+this.get('route')+'&s='+this.get('stop')+'&t=0';
    }
  });
  app.VehicleLocations = Backbone.Collection.extend({
    model:app.VehicleLocation
  });
  app.Vehicle = Backbone.Model.extend({
    getType:function() {
      // this bit here is inspired by whereismystreetcar.appspot.com
      // http://code.google.com/p/whereismystreetcar/source/browse/src/ca/wimsc/client/common/util/Vehicles.java
      // thanks dude!
      var v = this.get('vehicle').slice(0,2);
      if(v === '40' || v === '41' || v === '42' || v === '45') {
        return 'Street Car';
      } else {
        return 'Bus';
      }
    }
  });
  app.Vehicles= Backbone.Collection.extend({
    model:app.Vehicle
  });

  app.Prediction = Backbone.Model.extend({
    url: function() {
      return 'http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=ttc&r='+ this.get('route')+'&s='+this.get('routeTag')+'';
    },
    parse: function(response) {
      if(response.predictions.direction) {
        if(response.predictions.direction && response.predictions.direction.length > 1) {
          response.predictions.direction.prediction = [];
          _.each(response.predictions.direction, function(d) {
            _.each(d.prediction, function(p) {
              p.title = d.title;
              response.predictions.direction.prediction.push(p);
            });
          });
        }  
        if(response.predictions.direction) {
          return _.sortBy(response.predictions.direction.prediction, function(num) {
            return parseInt(num.minutes);
          });
        }
      }
      return "";
    },
  });
  app.Predictions = Backbone.Collection.extend({model:app.Prediction});
})();
