angular.module('BlockchainMonApp.directives', [])
	.directive("balance", function() {
		return {
			restrict: "A", // this means it will be declared as a mark up on html elements
			templateUrl: "partials/balance.html"
		};
	}).directive("blockView", function() {
		return {
			scope: {
				
				block: "=input"
			},
			restrict: "A", // this means it will be declared as a mark up on html elements
			templateUrl: "partials/block.html"
		};
	}).directive("transaction", function() {
		return {
			restrict: "A", // this means it will be declared as a mark up on html elements
			templateUrl: "partials/transaction.html"
		};
	}).directive("event", function() {
		return {
			restrict: "A", // this means it will be declared as a mark up on html elements
			templateUrl: "partials/event.html"
		};
	});