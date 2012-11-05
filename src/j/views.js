var app = app || {};

(function() {

  var BaseListView = Backbone.View.extend({
    tagName: 'ul',
    className: 'nav nav-tabs nav-stacked',
    initialize: function() {
      this.childViews = [];
      $('#messages').empty();
    },
    render:function() {
      var view = this;
      this.collection.each(function(r) {
        view.$el.append(view.template(r.toJSON()));
      });
    }
  });

  app.RoutesListView = BaseListView.extend({
    template: _.template($('#routeListTemplate').html()),
    render: function() {
      BaseListView.prototype.render.call(this);
      return this;
    }
  });

  app.DirectionsListView = BaseListView.extend({
    template: _.template($('#routeDirectionListTemplate').html()),
    render: function() {
      BaseListView.prototype.render.call(this);

      return this;
    }
  });

  app.StopsView = BaseListView.extend({
    template: _.template($('#routeStopListTemplate').html()),
    render: function() {
      var view = this;
      this.collection.each(function(d) {
        var routeStop = _.find(view.options.stops.get('stop'), function(stop) {
          if(stop.tag === d.get('tag'))
            return stop;
        });
        view.$el.append(view.template({data:routeStop, stopId: routeStop.stopId ? routeStop.stopId : 0}));
      });
      return this;
    }
  });

  app.PredictionReloader = BaseListView.extend({
    el:'#top-nav',
    events: {
      'click button':'reloadPredictions'
    },
    initialize: function() {
      this.$el.empty();
    },
    render: function() {
      var reloadButton = this.make('button',{'id':'reload-button','class':'btn btn-navbar reload'}, '<i class="icon-refresh icon-white"></i>');
      this.$el.append(reloadButton);
    },
    reloadPredictions: function(e) {
      e.preventDefault();
      $(e.srcElement).text('...');
      var view = this;
      this.model.fetch({
        success: function(model, response) {
          var predictionsView = new app.PredictionView({collection:new app.Predictions(model),model:model, direction:view.options.direction,stop:view.options.stop});
          Controller.showView(predictionsView);
        }
      });
    }
  });

  app.PredictionMap = Backbone.View.extend({
    render: function() {

    }
  });

  app.PredictionView = BaseListView.extend({
    tagName:'table',
    className: 'table',
    template: _.template($('#routePredictionListTemplate').html()),
    initialize:function() {
      $('#routes').addClass('predictions');
      BaseListView.prototype.initialize.call(this);
    },
    render: function() {
      var view = this,
          count = 0
          tbody = this.make('tbody'),
          direction = view.options.direction,
          stop = view.options.stop;

      var myLatlng = new google.maps.LatLng(stop.lat,stop.lon);
      var mapOptions = {
        center: myLatlng,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
      var marker = new google.maps.Marker({
        position: myLatlng
      });
      marker.setMap(map);

      var vehicleLocation = new app.VehicleLocation({route:this.collection.models[0].get('route'), stop:view.options.stop.tag});
      vehicleLocation.fetch({
        success: function(model,response) {
          var vehicles = new app.Vehicles(model.get('vehicle'));
          vehicles.each(function(v) {
            var vehicle = new app.Vehicle({vehicle:v.get('id')});
            var stop = _.find(view.collection.models[0].attributes, function(s) {
              return s.vehicle === v.get('id');
            });
            if(stop) {
              var marker = new google.maps.Marker ({
                position: new google.maps.LatLng(v.get('lat'), v.get('lon')),
                text: stop.minutes,
                icon: '/img/'+vehicle.getType().replace(' ', '')+'.png'
              })
              console.log(stop);
              var label = new Label({
                map: map,
                className: 'label ' + stop.label
              });
              label.bindTo('position', marker, 'position');
              label.bindTo('text', marker, 'text');

              marker.setMap(map);
            }

          })
        }
      });

      _.each(this.collection.models[0].attributes, function(p) {
          if(p.minutes) {
            var v = new app.Vehicle({'vehicle':p.vehicle})
            p.vehicleType = v.getType();
            var minutesUntil = parseInt(p.minutes);
            if(!p.title) p.title = direction.title;
            if(minutesUntil > 10) {
              p.label = 'label-success';
              p.rowlabel = 'success';
            } else if (minutesUntil <= 10 && minutesUntil > 5) {
              p.label = 'label-warning';
              p.rowlabel = 'warning';
            } else if (minutesUntil <= 5) {
              p.label = 'label-important';
              p.rowlabel = 'error';
            } else {
              p.label = 'label-default';
            }
            $(tbody).append(view.template({data:p}));
            count = count + 1;
          }
      });

      if(count === 0) {
        app.Helpers.makeAlert({message:'There are no predictions for this stop', className:'alert-info'});
      } else {
        this.$el.append(tbody);
      }

      var reloader = new app.PredictionReloader({model:this.model, predictions:this.options.predictions, direction:this.options.direction,stop:this.options.stop});
      reloader.render();

      return this;
    }
  });

  app.AppView = Backbone.View.extend({
    el: '#routes',
    render:function() {
      var view = this;
      $('#title').show();
      $('#type-selector').show();

      return this;
    }
  });

  var Controller = {
    showView: function(view) {
      if(this.currentView) {
        this.currentView.close();
      }

      this.currentView = view;
      if(this.currentView.render) {
        this.currentView.render();
      }
      $('#routes').empty();
      $('#routes').append(view.el);
    },
    showTitle: function(message) {
      $('#title').html(message);
      $('#title').show();
    },
    showLoadingText: function() {
      $('#routes').empty();
      $('#routes').text('Loading...');
    }
  };

  app.Controller = Controller;
})();
