function updateFares(pax, currency = "Kč") {
	$('.result').each((i, el) => {
		var price = pax * calculatePrice($(el).data('distance'));
		$(el).find('.amount').html(price + "&nbsp;" + currency);
	});
}

function calculatePrice(dist, class = 2) {
	var fare = Math.round(1.3354 * dist + 11.498);
	return (class == 2) ? fare : fare * 1.3;
}

$(document).ready(() => {
	$('#search-hour').val(("0" + new Date().getHours()).substr(-2,2));
	$('#search-minute').val(("0" + new Date().getMinutes()).substr(-2,2));
	updateFares(1);
	$('.number-increment').on('click', function(e) {
		e.preventDefault();
		var field = $(this).prev('input');
		field.val(parseInt(field.val()) + 1).change();
	})
	$('.number-decrement').on('click', function(e) {
		e.preventDefault();
		var field = $(this).next('input');
		var newVal = (field.data('min') && parseInt(field.val()) > field.data('min')) ? parseInt(field.val()) - 1 : field.data('min');
		field.val(newVal).change();
	})
	$('.pax-number').on('change', function() {
		updateFares(parseInt($(this).val()));
	})

	$('.price').on('click', function(e) {
		e.preventDefault();
	});
});