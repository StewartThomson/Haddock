(function($) {
	$.fn.currencyInput = function() {
		this.each(function() {
			var wrapper = $("<div class='currency-input' />");
			$(this).wrap(wrapper);
			$(this).before("<span class='currency-symbol'>$</span>");
			$(this).change(function() {
				var min = parseFloat($(this).attr("min"));
				var max = parseFloat($(this).attr("max"));
				var value = this.valueAsNumber;
				if(value < min)
					value = min;
				else if(value > max)
					value = max;
				$(this).val(value.toFixed(2));
			});
		});
	};
})(jQuery);

$(document).ready(function() {
	$('input.currency').currencyInput();
});

Array.prototype.forEach.call(document.querySelectorAll('[data-stripe-tip]'), function (el) {
	var errorEl = el.querySelector('[data-members-error]');
	function clickHandler(event) {
		var amount = document.getElementById("tip-input").value * 100;
		el.removeEventListener('click', clickHandler);
		event.preventDefault();

		var successUrl = el.dataset.membersSuccess;
		var cancelUrl = el.dataset.membersCancel;
		var checkoutSuccessUrl = window.location.href;
		var checkoutCancelUrl = window.location.href;

		if (successUrl) {
			checkoutSuccessUrl = (new URL(successUrl, window.location.href)).href;
		}

		if (cancelUrl) {
			checkoutCancelUrl = (new URL(cancelUrl, window.location.href)).href;
		}

		if (errorEl) {
			errorEl.innerText = '';
		}
		el.classList.add('loading');
		fetch(window.location.origin + '/tip', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				amount: amount,
				successUrl: checkoutSuccessUrl,
				cancelUrl: checkoutCancelUrl
			})
		}).then(function (res) {
			if (!res.ok) {
				throw new Error('Could not create stripe checkout session');
			}
			return res.json();
		}).then(function (result) {
			var stripe = Stripe(result.publicKey);
			return stripe.redirectToCheckout({
				sessionId: result.sessionId
			});
		}).then(function (result) {
			if (result.error) {
				throw new Error(result.error.message);
			}
		}).catch(function (err) {
			console.error(err);
			el.addEventListener('click', clickHandler);
			el.classList.remove('loading');
			if (errorEl) {
				errorEl.innerText = err.message;
			}
			el.classList.add('error');
		});
	}
	el.addEventListener('click', clickHandler);
});