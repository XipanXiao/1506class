define('payment/payment', [
    'address_editor/address_editor',
    'services', 'utils'], function() {
  return angular.module('PaymentModule', [
      'AddressEditorModule', 'ServicesModule', 'UtilsModule'])
    .directive('payment', function(rpc, utils) {
      return {
        scope: {
          cart: '='
        },
        link: function(scope) {
        	  // Render the PayPal button
        	  paypal.Button.render({
          // Set your environment
            env: 'sandbox', // sandbox | production

        	  // Specify the style of the button
        	  style: {
        	    layout: 'vertical',  // horizontal | vertical
        	    size:   'medium',    // medium | large | responsive
        	    shape:  'rect',      // pill | rect
        	    color:  'gold'       // gold | blue | silver | white | black
        	  },

	        	// Specify allowed and disallowed funding sources
	        	//
	        	// Options:
	        	// - paypal.FUNDING.CARD
	        	// - paypal.FUNDING.CREDIT
	        	// - paypal.FUNDING.ELV
	        	funding: {
	        	  allowed: [
	        	    paypal.FUNDING.CARD,
	        	    paypal.FUNDING.CREDIT
	        	  ],
	        	  disallowed: []
	        	},
	
	        	// PayPal Client IDs - replace with your own
	        	// Create a PayPal app: https://developer.paypal.com/developer/applications/create
	        	client: {
	        	  sandbox: 'AShDzR3WfiCQg5WzQOjqET8_4CWE1Txmg5TQvKdrv8WlTiAVTo-Ll4zOyrloEfVfllK8_bA6GqdIONAC',
	        	  production: '<insert production client id>'
	        	},
	
	        	payment: function (data, actions) {
	        	  return actions.payment.create({
	        	    payment: {
	        	      transactions: [
	        	        {
	        	          amount: {
	        	            total: scope.cart.grand_total,
	        	            currency: 'USD'
	        	          }
	        	        }
	        	      ]
	        	    }
	        	  });
	        	},
	
	        	onAuthorize: function (data, actions) {
	        	  return actions.payment.execute()
	        	    .then(function (result) {
	        	      scope.cart.paypal_trans_id = result.id;
	        	      scope.cart.paid_date = result.create_time;
	        	    });
	        	}
	        	}, '#paypal-button-container');
        	},
        templateUrl : 'js/payment/payment.html?tag=201809222258'
      };
    });
});
