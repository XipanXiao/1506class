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
					function fillAddress(order) {
						var keys = ['street', 'city', 'state', 'country', 'zip'];
						if (keys.every((key) => !!order[key])) {
							scope.addressComplete = true;
							return;
						}
						rpc.get_user().then(function(user) {
							complete = true;
							keys.forEach((key) => {
								order[key] = order[key] || user[key];
								complete = complete && !!order[key];
							});
							scope.addressComplete = complete;
						});
					}
					if (scope.order) {
						fillAddress(scope.order);
					} else {
						scope.$watch('order', fillAddress);
					}
          function parseMoney(value) {
            return value && parseFloat(value) || 0.00;
          }
          function addMoney(a, b) {
            return parseMoney((parseMoney(a) + parseMoney(b)).toFixed(2));
          }
          function getItems(order) {
            return order.items.map(function (item) {
              return {
                name: item.name,
                quantity: item.count,
                currency: 'USD',
                price: addMoney(item.price, item.shipping)
              };
            });
          }
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
	        	  var order = scope.order;
	        	  return actions.payment.create({
	        	    payment: {
	        	      payer: {
	        	        payer_info: {
	        	          email: order.email,
	        	          first_name: order.name,
	        	          billing_address: {
	        	            line1: order.street,
	        	            city: order.city,
	        	            country_code: order.country,
	        	            postal_code: order.zip,
	        	            state: order.stateLabel,
	        	            phone: order.phone
	        	          },
	        	        },
	        	      },
	        	      transactions: [
	        	        {
	        	          amount: {
	        	            total: order.balance,
	        	            currency: 'USD'
	        	          },
	        	          invoice_number: order.id,
	        	          item_list: {
	        	            items: getItems(order)
	        	          },
	        	          note_to_payee: '{0}: {1}{2}?order_id={3}'.format(order.name,
	                        utils.getBaseUrl(), 'invoice_print.html', order.id)
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
        templateUrl : 'js/payment/payment.html?tag=201901062258'
      };
    });
});
