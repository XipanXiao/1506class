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
          onPaid: '&',
          showCloseButton: '@'
        },
        link: function(scope) {
        	  // Render the PayPal button
        	  paypal.Button.render({
          // Set your environment
            env: location.href.indexOf('localhost') >= 0 ?
                'sandbox' : 'production', // sandbox | production

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
	        	  production: 'AfX_o2WZgNPs66lY4AKwp7DZhrl4MA5Hcs2o5wLndK3qROPRM7agDBLZGTYaGaFzaGWh6VSlnzOjjR-8'
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
                   var trans = result.transactions[0];
	        	      scope.order.paid = trans.amount.total;
	        	      scope.order.paypal_trans_id = trans.related_resources[0].sale.id;
	        	      scope.order.paid_date = trans.related_resources[0].sale.create_time;
	        	      scope.onPaid();
	        	    });
	        	}
	        	}, '#paypal-button-container');
        	},
        templateUrl : 'js/payment/payment.html?tag=201809252258'
      };
    });
});
