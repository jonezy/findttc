$(function() {
  var TTCRouteModel = Backbone.Model.extend({});
  var TTCRoutes = Backbone.Collection.extend({
    model:TTCRouteModel,
    url: 'http://webservices.nextbus.com/service/publicJSONFeed?command=routeList&a=ttc',
    parse: function(response) {
      return response.route;
    }
  });

  var RoutesNearModel = Backbone.Model.extend({});
  var RoutesNearCollection = Backbone.Collection.extend({
    model:RoutesNearModel,
    url: function() {
      return 'http://www.myttc.ca/near/'+this.models[0].get('lat')+','+this.models[0].get('long')+'';
    }
  });
  var StopModel = Backbone.Model.extend({});
  var StopCollection = Backbone.Collection.extend({
    model:StopModel,
    url:function() {
      return 'http://www.myttc.ca/'+this.models[0].get('uri')+'.json';
    }
  });

  var DepartureList = Backbone.View.extend({
    render: function() {
      var view = this;
      _.each(this.collection,function(i) {
        var departure = new Departure({model:i});
        departure.render();
        view.$el.append(departure.el);
      });
      return this;
    }
  });

  var Departure = Backbone.View.extend({
    template: _.template($('#departure_list').html()),
    render: function() {
      this.$el.html(this.template(this.model));
      return this;
    }

  });
  var StopsList = Backbone.View.extend({
    initialize:function() {
      this.collection.on('all', this.reset, this);
    },

    render: function() {
      var view = this;
      _.each(this.collection.models[0].get('locations'), function(l) {
        var entry = view.make('div', {'class': 'span4','style':'padding:10px'}, '');
        var title = view.make('h4', {}, l.name);
        $(entry).append(title);

        var stops = new StopCollection({uri:l.uri});
        stops.on('reset', function() {
          if(stops.models[0].get('stops')[0].routes.length > 0) {
            var list = new DepartureList({collection:stops.models[0].get('stops')});
            list.render();

            var listContainer = view.make('div', {'style':'paddng:10px'}, list.el.innerHTML);
            $(entry).append(listContainer);
            view.$el.append(entry);
          }
        });
        stops.fetch();

      });
      return this;
    }
  });

  var AppView = Backbone.View.extend({
    render:function() {
      var view = this,
          browserSupportFlag = true;

      var routeList = new TTCRoutes;
      console.log(routeList);
      routeList.fetch();

      routeList.on('reset', function() {
        console.log(routeList);
      });
      // handles geolocation.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          view.handleLocatedEvent(position);
        }, function () {
          console.log('wtf');
          //view.handleNoGeolocation(browserSupportFlag);
        });
      } else if (google.gears) {
        browserSupportFlag = true;
        var geo = google.gears.factory.create('beta.geolocation');
        geo.getCurrentPosition(function (position) {
          view.handleLocatedEvent(initialLocation);
        }, function () {
          view.handleNoGeoLocation(browserSupportFlag);
        });
        // Browser doesn't support Geolocation
      } else {
        browserSupportFlag = false;
        view.handleNoGeolocation(browserSupportFlag);
      }

      return this;
    },

    handleLocatedEvent: function(position) {
      var view = this;
      var stops = new RoutesNearCollection({lat:position.coords.latitude,long:position.coords.longitude});
      console.log(position);
      stops.on('reset', function() {
        console.log(stops);
        var stopsList = new StopsList({collection:stops}); 
        stopsList.render();
        $('#stopsnear').html(stopsList.el);
      });

      stops.fetch();

      setInterval(function() {
        view.render();
      }, 30000);
    }
  });

  var appView = new AppView;
  appView.render();
});
