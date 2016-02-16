angular.module('starter.controllers', [])

.filter('html', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
})

.controller('DashCtrl', function($scope, $http, $sce, ConfigService) {
  $scope.services = [];
  $scope.message = "";
  $scope.loading = true;
  $scope.user = ConfigService.recoverEmail().split("@")[0];
  var host = ConfigService.load();
  $scope.serviceprovided = '';

  var filter = {"email": ConfigService.recoverEmail()};

  var promisse = $http({
    method: 'POST',
    host: host + '/myServices',
    data: filter,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  });

  promisse.success(function(result){
    $scope.loading = true;
    if(result)
      $scope.services = result;
      $scope.loading = false;
  });

  promisse.error(function(error){
    $scope.services = [{"service": "Weather"}];
    //$scope.message = 'Error on connect to server.';
    $scope.loading = false;
  });

  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };

  $scope.isGroupShown = function(service) {
    return $scope.shownGroup === service;
  };

  $scope.getHtml = function(html){
    return $sce.trustAsHtml(html);
  };

  $scope.showService = function(service) {
    $scope.loading = true;

    var promisse = $http({
      method: 'POST',
      url: host + '/showService',
      data: {"service": service.service, "email": ConfigService.recoverEmail()},
      headers: {
        Accept : "text/plain; charset=utf-8",
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    promisse.success(function(result){
      if(result){
        $scope.serviceprovided = result;
      }
      $scope.loading = false;
    });
  };
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, $http, ConfigService) {

  $scope.host = ConfigService.load();
  $scope.message = '';
  $scope.success = '';
  $scope.emailUsed = false;

  $scope.confirmation = function(){
    var pattern = /^[A-Za-z0-9]\w{6,12}$/;
    if(invalidadFields($scope)) {
      $scope.message = "Please, fill all fields.";
      return;
    }

    if($scope.password.match(pattern)) {
      if($scope.password === $scope.confirm) {
        $scope.message = '';
        var user = {
          "name": $scope.name,
          "email": $scope.email,
          "password": CryptoJS.SHA256($scope.password).toString()
        };

        if($scope.emailUsed) {
          $scope.message = "Email not available, it has been used.";
          return;
        }

        $scope.signup(user);
      } else {
        $scope.message = "The passwords didn't match";
      }
    } else
      $scope.message = "Please, use a password with numbers, letters and more than 6 chars"
  };

  $scope.signup = function(user){
    
    var promisse = $http.get($scope.host + '/signup/' + user['name'] + '/' + user['email'] + '/' + user['password']);
    
    promisse.success( function(data){
      if(data["insert"] == true){
        $scope.success = 'Success on save the user.';
      }
    }).error(function(error){
      $scope.message = 'Error on trying to save the user.';
    });
  };

  $scope.validateEmail = function(){
    if($scope.email !== '') {
      $scope.loading = true;

      var promisse = $http({method: 'get', url: $scope.host + '/email/' + $scope.email});

      promisse.success(function(data){
        if(emailUsed(data, $scope.email)) {
          $scope.emailUsed = true;
          $scope.message = "Email not available, it has been used.";
        } else {
          $scope.emailUsed = false;
          $scope.message = "";
        }

        $scope.loading = false;
      }).error(function(error){
        $scope.message = 'Error on connect to server.';
        $scope.loading = false;
      });
    }
  };

  function invalidadFields(scope){
  return  scope.password === undefined || scope.password === '' ||
          scope.email === undefined || scope.email === '' ||
          scope.name === undefined || scope.name === '';
  };

  function emailUsed(data, email) {
    return data.length > 0 && data[0].email === email;
  };
})

.controller('ServicesCtrl', function($scope, $http, ConfigService, PreferencesService){
  
  $scope.init = function(){
    $scope.data = {};
    var host = ConfigService.load();

    if(host !== '') {
      var promisse = $http({method: 'GET', url: host + '/types'});

      promisse.success(function(data){
        $scope.data.types = data;
      }).error(function(error){
        $scope.data.error = 'Error on connect to server.';
      });
    } else {
      $scope.data.error = 'Error on connect to server.';
    }
  };

  $scope.config = function(type, params){
      PreferencesService.configuration(type, params);
  };
})

.controller('PreferencesCtrl', function($scope, ConfigService){
  $scope.host = ConfigService.load();
})

.service('PreferencesService', function(){
  var data = {};

  var config = function(service, params) {
    data.service = service;
    data.params = params;
  };

  var params = function(){
    return data.params;
  };

  var service = function() {
    return data.service;
  };

  return {
    configuration: config,
    getParams: params,
    getService: service 
  };
})

.directive('preferences', function(){
  return {
    restrict: 'E',
    replace: true,
    templateUrl:'templates/prefs.html',
    controller: function ($scope, $http, ConfigService, PreferencesService) {
    $scope.host = ConfigService.load();
    //var email = configService.recoverEmail();

    $scope.savePreferences = function(){
      var promisse = $http.post($scope.host + '/savePreferences', $scope.amount);
    };

    $scope.create = function(){
      $scope.prefs = {};

      var div = $('<div>');

      var user = $('<input>');
      user.attr('type', 'hidden');
      user.attr('name', 'user');
      user.attr('value', ConfigService.recoverEmail());

      var service = $('<input>');
      service.attr('type', 'hidden');
      service.attr('name', 'service');
      service.attr('value', PreferencesService.getService());

      div.append(user);
      div.append(service);

      $.each(PreferencesService.getParams(), function (idx, obj) {
        var container = $('<div>');
        container.attr('id', 'container');

        var el = $('<' + obj.element + '>');
        el.attr('type', obj.type);
        el.attr('name', obj.name);

        $scope.prefs[obj.name];

        if(obj.type === "number") {
          el.addClass("number");
        }

        var label = $('<label>');

        if (obj.type === "checkbox") {
          label.addClass('toogle');
          label.append(obj.label);
          container.append(el);
          container.append(label);
        } else if(obj.type === "select"){
          label.addClass('toogle');
          label.append(obj.label);
          container.append(label);
          container.append(el);
        } else {
          el.attr('placeholder', obj.label);
          label.addClass('item item-input');
          label.append(el);
          container.append(label);
        }

        if (obj.type === "select") {
          for (var item in obj.content) {
            var option = $('<option>');
            option.val(item);
            option.html(obj.content[item]);
            el.append(option);
          }
        }

        div.append(container);
      });

      $('#preferencia').html(div.html());
      }
    }
  };
})

.controller('ConfigCtrl', function($scope, ConfigService) {
  
  $scope.save = function() {
    var config = {
      address: $scope.address,
      port: $scope.port
    };
  
    ConfigService.save(config);
    $scope.load();
  };

  $scope.load = function() {
    $scope.host = ConfigService.load();
  };

  $scope.load();
})

.controller('LoginCtrl', function($scope, $http, ConfigService) {
  $scope.host = ConfigService.load();
  $scope.message = '';

  $scope.login = function() {
    //$scope.data.loggedIn = true;
    if ($scope.email && $scope.password) {
      $scope.loading = true;
      var user = {
        "email": $scope.email,
        "password": CryptoJS.SHA256($scope.password).toString()
      };

      var promisse = $http({
        method: 'POST',
        url: $scope.host + '/login',
        data: user,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });

      promisse.success(function (data) {
        $scope.loading = false;
        if (data.logged){
          //$scope.data.loggedIn = true;
          ConfigService.storeEmail($scope.email);
        } else
          $scope.message = 'User or password did not match';
      }).error(function (error) {
        $scope.message = 'Error on login.';
        $scope.loading = false;
      });
    }
  }
})

.controller('LinkCtrl', function($scope, $http, ConfigService, PreferencesService) {
  $scope.host = ConfigService.load();
  $scope.typeService = PreferencesService.getService();
  $scope.message = "";

  $scope.service = function() {
    return PreferencesService.getService();
  };

  $scope.save = function(){
    var config = {
      "url": $scope.url,
      "email": $scope.email,
      "password": $scope.password,
      "service": PreferencesService.getService()
    };

    var promisse = $http({
      method: 'POST',
      url: $scope.host + '/saveLink',
      data: config,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });

    promisse.success(function(result){
      if(result.success) {
        $scope.message = 'Success!';
        $scope.url = '';
        $scope.email = '';
        $scope.password = '';
      } else
        $scope.message = 'Sorry, the data was not save!';
    });

    promisse.error(function(error){
      $scope.message = 'Sorry, there was some troble!';
    });
  };
});
