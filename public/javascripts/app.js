//app.js - angular controller
angular.module('BlockchainMonApp', ['BlockchainMonApp.socket', 'BlockchainMonApp.controllers', 'BlockchainMonApp.directives', 'toggle-switch','ngMaterial' ])
.config(function($mdThemingProvider, $mdIconProvider){

          $mdThemingProvider.theme('default')
              .primaryPalette('deep-purple')
              .accentPalette('light-blue');
      });