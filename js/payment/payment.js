define('payment/payment', [
    'address_editor/address_editor',
    'services', 'utils'], function() {
  return angular.module('PaymentModule', [
      'AddressEditorModule', 'ServicesModule', 'UtilsModule'])
    .directive('payment', function(rpc, utils) {
      return {
        scope: {
          order: '=',
          onCancel: '&',
          onPaid: '&'
        },
        link: function(scope) {
        	  // Render the PayPal button
        	  paypal.Button.render({
          // Set your environment
            env: 'production', // sandbox | production

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
	        	  production: 'xs8wy8r8h8g74z64$08b1bdddaf4891a034e680067b36b394'
	        	},
	
	        	payment: function (data, actions) {
	        	  return actions.payment.create({
	        	    payment: {
	        	      transactions: [
	        	        {
	        	          amount: {
	        	            total: scope.order.balance,
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
	        	      scope.order.paid = result.transactions[0].amount.total;
	        	      scope.order.paypal_trans_id = result.id;
	        	      scope.order.paid_date = result.create_time;
	        	      scope.onPaid();
	        	    });
	        	}
	        	}, '#paypal-button-container');
        	},
        templateUrl : 'js/payment/payment.html?tag=201809242258'
      };
    });
});
