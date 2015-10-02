angular.module('starter.services', [])

.factory('ConfigService', function(){
  
  var storeEmail = function(email) {
    window.localStorage.setItem('email', email);
  }

  var recoverEmail = function() {
    return window.localStorage.getItem('email');
  }

  var save = function(config){
    window.localStorage.setItem('brokerclient', JSON.stringify(config));
  };

  var load = function() {
    var host = '';
    var config = JSON.parse(window.localStorage.getItem('brokerclient'));

    if(config !== null && config.address !== '' && config.address !== undefined) {
      if(temHttp(config.address))
        host = config.address;
      else {
        var number = parseInt(config.address.substring(0,1));
        if(isNaN(number)) {
          host = 'http://' + config.address;
        } else {
          host = config.address;
        }
      }

      if(config.port) {
        if(config.port !== undefined && config.port > 0)
          host = host + ":" + config.port;
        }
      }

      return host;
  };

  function temHttp(address){
    return address.substring(0,7) === 'http://' || address.substring(0,8) === 'https://';
  };

  return {
    save: save,
    load: load,
    storeEmail: storeEmail,
    recoverEmail: recoverEmail
  };
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
