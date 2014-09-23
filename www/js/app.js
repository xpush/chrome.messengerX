angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.constants', 'starter.directives', 'starter.dao', 'ionic', 'ionic.contrib.frostedGlass', 'ngStorage'])

.run(function($location, $ionicPlatform, $rootScope, APP_INFO, DB, BASE_URL, Sign, NAVI, $state, $window, $localStorage, $sessionStorage, $templateCache ) {
  $ionicPlatform.ready(function() {

    $ionicPlatform.registerBackButtonAction(function(e){

      if ($rootScope.backButtonPressedOnceToExit) {
        ionic.Platform.exitApp();
      }
      else if('/tab/friends' === $location.path() ) {
        $rootScope.backButtonPressedOnceToExit = true;
        window.plugins.toast.showShortCenter(
          "'뒤로가기'버튼을 한번 더 누르시면, \n종료됩니다.",function(a){},function(b){}
        );
        setTimeout(function(){
          $rootScope.backButtonPressedOnceToExit = false;
        },2000);
      }
      else if ($rootScope.$viewHistory.backView) {
        console.log( $rootScope.$viewHistory.backView );
        $rootScope.$viewHistory.backView.go();
      }
      e.preventDefault();
      return false;
    },101);

    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    $rootScope.cameraFlag = false;
    if( window.device ){
      $rootScope.deviceId = device.uuid;
      $rootScope.rootImgPath = "img";
      $rootScope.rootPath = "";

      $rootScope.cameraFlag = true;
      $rootScope.usePopupFlag = false;

      if( device.model.indexOf('x86') === 0 ){ // emulator or desktop pc
        console.log('emulator or desktop pc');
      }else{
        var pushNotification = window.plugins.pushNotification;

        if( device.platform === 'android' || device.platform === 'Android') {
          pushNotification.register(successHandler, errorHandler,{"senderID":"944977353393","ecb":"onNotification"});
        } else {
          pushNotification.register(tokenHandler, errorHandler,{"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});
        }
      }

      document.addEventListener("resume", onResume, false);
      document.addEventListener("pause", onPause, false);

      function onResume() {
        console.log('On Resume');
      }

      function onPause() {
        console.log('On Pause');
      }

    } else if ( $location.absUrl().indexOf( 'file' ) > -1 ) {
      $rootScope.rootImgPath = "img";
      $rootScope.rootPath = "../www/";
      $rootScope.deviceId = 'ionic';
      $rootScope.usePopupFlag = true;
      // web
    } else {
      $rootScope.rootImgPath = "../img";
      $rootScope.rootPath = "/";
      $rootScope.deviceId = 'ionic';
      $rootScope.usePopupFlag = true;

      var mobileAgents = ["android","iphone","bb","symbian","nokia", "ipad"];
      var agent = window.navigator.userAgent.toLowerCase();

      for( var inx = 0, until = mobileAgents.length ; $rootScope.usePopupFlag && inx < until ; inx++ ){
        if( agent.indexOf( mobileAgents[inx] ) > -1 ){
          $rootScope.usePopupFlag = false;
        }
      }
    }

    // node wekit ==  true
    if( window.root ){
      var gui = require('nw.gui');
      var winmain = gui.Window.get();
      $rootScope.nodeWebkit = true;
      $rootScope.rootPath = "file://"+window.root+"/";

      var tray = new gui.Tray({ title: 'Tray', icon: 'icon.png' });

      if( process.platform == 'window' ){
        var menu = new gui.Menu();
        menu.append(new gui.MenuItem({ label: 'Logout' }));
        menu.append(new gui.MenuItem({ label: 'Quit' }));
        tray.menu = menu;

        menu.items[0].click = function() {
          $rootScope.logout();
        };

        menu.items[1].click = function() {
          tray.remove();
          gui.App.quit();
        };
      } else if( process.platform == 'linux' || process.platform == 'darwin' ){
        var menubar = new gui.Menu({ type: "menubar" });
        var submenu = new gui.Menu();

        var fileMenuItem = new gui.MenuItem({
          label: 'File'
        });

        var logoutMenuItem = new gui.MenuItem({
          label: 'Logout',
          click: function() {
            $rootScope.logout();
          }
        });

        var closeMenuItem = new gui.MenuItem({
          label: 'Quit',
          click: function() {
            tray.remove();
            gui.App.quit();
          }
        });

        submenu.append( logoutMenuItem );
        submenu.append( closeMenuItem );
        menubar.append( fileMenuItem );
        fileMenuItem.submenu = submenu;
        
        if( process.platform == 'darwin' ){
          //menubar.createMacBuiltin("messengerX");
        }
        winmain.menu = menubar;
      }

      tray.click = function(){
        winmain.show();
        winmain.focus();
      }
  
      winmain.on('close', function(){
        winmain.minimize();

        if( process.platform == 'window' ){
          winmain.setShowInTaskbar(false);
        }
      });

      $rootScope.close = function(){
        winmain.minimize();
        if( process.platform == 'window' ){
          winmain.hide();
        }
      };

      winmain.show();
    }

    $rootScope.host = BASE_URL;
    $rootScope.app  = APP_INFO.appKey;

    // webrtc support ?
    if (
      (navigator.mozGetUserMedia && window.mozRTCPeerConnection) ||
      (navigator.webkitGetUserMedia && window.webkitRTCPeerConnection)
    ){
      $rootScope.supportWebRTC = true;
    }else{
      $rootScope.supportWebRTC = false;
    }

    // Use in cordova
    $rootScope.localNoti = function(param, callback){
      if( window.plugin && window.plugin.notification.local ){
        window.plugin.notification.local.add({
          id: param.id,  // A unique id of the notifiction
          //date:,    // This expects a date object
          message: param.message,  // The message that is displayed
          title: param.title,  // The title of the message
          //repeat:     String,  // Either 'secondly', 'minutely', 'hourly', 'daily', 'weekly', 'monthly' or 'yearly'
          //badge:      Number,  // Displays number badge to notification
          //sound:      String,  // A sound to be played
          //json:       String,  // Data to be passed through the notification
          autoCancel: true // Setting this flag and the notification is automatically canceled when the user clicks it
          //ongoing:    Boolean, // Prevent clearing of notification (Android only)
        });
      }
    }

    // Brower's notification
    $rootScope.webNoti = function( message ) {

      // Let's check if the browser supports notifications
      if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
      }

      // Let's check if the user is okay to get some notification
      else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification( message );
      }

      // Otherwise, we need to ask the user for permission
      // Note, Chrome does not implement the permission static property
      // So we have to check for NOT 'denied' instead of 'default'
      else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {

          // Whatever the user answers, we make sure we store the information
          if(!('permission' in Notification)) {
            Notification.permission = permission;
          }

          // If the user is okay, let's create a notification
          if (permission === "granted") {
            var notification = new Notification( message );
          }
        });
      }
    };

    // For android notification
    onNotification = function(e) {
      switch( e.event ){
        case 'registered':
          if ( e.regid.length > 0 ){
            console.log("regID = " + e.regid);
            $rootScope.notiId = e.regid;
          }
          break;

        case 'message':
          if (e.foreground){
            window.plugin.notification.local.add({
              id: e.payload.TS,  // A unique id of the notifiction
              message: encodeURIComponent( e.payload.MG ),  // The message that is displayed
              title: encodeURIComponent( e.payload.UO.NM ),  // The title of the message
              autoCancel: true // Setting this flag and the notification is automatically canceled when the user clicks it
            });
          }else{   // otherwise we were launched because the user touched a notification in the notification tray.
            if (e.coldstart){
              //$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
            }else{
              //$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
            }
          }
          break;

        case 'error':
          //$("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
          break;

        default:
          //$("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
          break;
      }
    }

    // result contains any message sent from the plugin call
    function successHandler(result) {
      console.log( 'result = ', result );
    }

    // result contains any error description text returned from the plugin call
    function errorHandler(result) {
      console.log( 'error = ', result );
    }

    function tokenHandler(result) {
      console.log( 'device token = ', result );
    }

    DB.init();

    var autoInitFlag = false;
    if( !$rootScope.usePopupFlag ){
      autoInitFlag = true;
    }

    $rootScope.xpush = new XPush($rootScope.host, $rootScope.app, function (type, data){

      if(type === 'LOGOUT'){
        if( !$sessionStorage.reloading ){
          $rootScope.logout( function(){
            $state.go( "error" );
          });
        }
      }
    }, autoInitFlag );

    // tootScope function
    $rootScope.logout = function( callback ){
      Sign.logout(function(){
        $rootScope.xpush.logout();

        var popups = NAVI.getPopups();
        for( var key in popups ){
          popups[key].close();
        }

        // broadcast for clear event
        $rootScope.$broadcast( "ON_LOGOUT" );

        if ( callback && typeof callback === 'function') {
          callback();
        } else {
          $templateCache.removeAll();
          $state.transitionTo('signin', {}, { reload: true, notify: true });
        }
      });
    };

    $rootScope.totalUnreadCount = 0;
  });

  // Add Auth Interceptor
  $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
    if( toState.name === 'splash' ){
      $sessionStorage.reloading = true;
    } else {
      $sessionStorage.reloading = false;
    }
  });

  $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
    var ignoreStates = ["signin","signup","splash","error"];

    if ( ignoreStates.indexOf( toState.name ) < 0 && Sign.getUser() === undefined ) {
      event.preventDefault();
      $rootScope.error = null;
      $state.go('splash');
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('splash', {
      url: "/splash",
      templateUrl: "templates/splash.html",
      controller: 'SplashCtrl'
    })

    .state('signin', {
      url: "/sign-in",
      templateUrl: "templates/sign-in.html",
      controller: 'SignInCtrl'
    })

    .state('signup', {
      url: "/sign-up",
      templateUrl: "templates/sign-up.html",
      controller: 'SignUpCtrl'
    })

    .state('chat', {
      url: '/chat',
      templateUrl: "templates/chat.html",
      controller: 'ChatCtrl'
    })

    .state('error', {
      url: "/error",
      templateUrl: "templates/error.html",
      controller: 'ErrorCtrl'
    })

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:
    .state('tab.channel', {
      url: '/channel',
      views: {
        'tab-channel': {
          templateUrl: 'templates/tab-channel.html',
          controller: 'ChannelCtrl'
        }
      }
    })

    .state('tab.friends', {
      url: '/friends',
      views: {
        'tab-friends': {
          templateUrl: 'templates/tab-friends.html',
          controller: 'FriendsCtrl'
        }
      }
    })

    .state('tab.account', {
      url: '/account',
      views: {
        'tab-account': {
          templateUrl: 'templates/tab-account.html',
          controller: 'AccountCtrl'
        }
      }
    })

    .state('tab.emoticon', {
      url: '/emoticon',
      views: {
        'tab-emoticon': {
          templateUrl: 'templates/tab-emoticon.html',
          controller: 'EmoticonCtrl'
        }
      }
    })

    .state('tab.messages', {
      url: '/messages',
      views: {
        'tab-messages': {
          templateUrl: 'templates/tab-messages.html',
          controller: 'MessageCtrl'
        }
      }
    });

  // splash screen start
  $urlRouterProvider.otherwise('/splash');
});

angular.module('ionic.contrib.frostedGlass', ['ionic'])

.factory('$ionicFrostedDelegate', ['$rootScope', function($rootScope) {
  return {
    update: function() {
      $rootScope.$emit('ionicFrosted.update');
    }
  }
}])
.factory('NAVI', function($rootScope, $state, Cache, Sign){
  var popupCount = 0;
  var popups = {};
  var self;

  $rootScope.$on("$popupClose", function ( data, key ){
    delete popups[key];
    popupCount--;
  });  

  return {
    getPopups : function(){
      return popups;
    },
    gotoChat : function( scope, popupKey, stateParams, callback ){
      self = this;

      if( $rootScope.usePopupFlag ){
        if( popups[popupKey] !== undefined ){
          if( popups[popupKey].window ){
            popups[popupKey].window.focus();
          } else {
            popups[popupKey].focus();
          }            
        } else {

          var popup;

          var left = screen.width - 620 + ( popupCount * 50 );
          var top = 0 + ( popupCount * 50 ) ;
          popupCount++;

          if( $rootScope.nodeWebkit ){
            popup = window.open( $rootScope.rootPath + 'popup-chat.html', popupKey, 'screenX='+ left + ',screenY=' + top +',width=400,height=600');


          

            popup.moveTo(left,top);
          } else {
            console.log("popup");
            popup = window.open( $rootScope.rootPath + 'popup-chat.html', popupKey, 'screenX='+ left + ',screenY=' + top +',width=400,height=600');
          }


          var startTime = Date.now();
          var popupInterval = setInterval( function(){
            var endTime = Date.now();
            if( endTime - startTime > 10000 ){
              clearInterval( popupInterval );
            }

            if( popup !== undefined ) {
              var popObj = popup.window.document.getElementById( "popupchat" );
              if( popObj !== undefined && popup.window.angular !== undefined ){
                var newWindowRootScope = popup.window.angular.element( popObj ).scope();
                if( newWindowRootScope !== undefined && newWindowRootScope.xpush !== undefined ){
                  if( newWindowRootScope.$$listeners.INTER_WINDOW_DATA_TRANSFER !== undefined ){
                    clearInterval( popupInterval );
                    self.openPopup( popup, popupKey, newWindowRootScope, stateParams );
                    if ( callback && typeof callback === 'function') {
                      callback();
                    }
                  }
                }
              }
            }
          }, 200 );
        }
      } else {
        $rootScope.$stateParams = stateParams;
        $state.go( 'chat' );
      }
    },
    openPopup : function( popupWin, popupKey, scope, stateParams ){

      if( $rootScope.nodeWebkit ) {
        popups[popupKey] = popupWin;
      } else {
        popups[popupKey] = popupWin;

     /*   popupWin.onbeforeunload = function(){
          scope.$broadcast("$windowClose" );
          popupCount--;
          delete popups[popupKey];
        };
*/

        popupWin.onClose.addListener(function() {
          scope.$broadcast("$windowClose" );
          popupCount--;
          delete popups[popupKey];
        });
        

      }

      var args = {};
      args.loginUser = Sign.getUser();
      args.stateParams = stateParams;
      args.cache = Cache.all();
      args.popupKey = popupKey;
      args.sessionConnection = $rootScope.xpush._sessionConnection;
      args.parentScope = $rootScope;

      scope.$broadcast("INTER_WINDOW_DATA_TRANSFER", args );
    }
  };
});
