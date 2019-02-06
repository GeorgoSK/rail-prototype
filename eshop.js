function updateFares(pax, currency = "Kč") {
	$('.result').each((i, el) => {
		$(el).find('.amount').each(function() {
			var price = pax * calculatePrice($(el).data('distance'), $(this).data('travelclass'));
			$(this).html(price + "&nbsp;" + currency);
		});
	});
}

function calculatePrice(dist, cls = 2) {
	var fare = Math.round(1.3354 * dist + 11.498);
	return (cls == 1) ? fare * 1.3 : fare;
}

$(document).ready(() => {
	
	var currentDate = new Date();
	var paxNumber = 1;
	$('#search-date').hide().val((currentDate.toISOString()).substr(0,10));
	
	$('#search-hour').val(("0" + new Date().getHours()).substr(-2,2));
	$('#search-minute').val(("0" + new Date().getMinutes()).substr(-2,2));

	$('.number-increment').on('click', function(e) {
		e.preventDefault();
		var field = $(this).prev('input');
		field.val(parseInt(field.val()) + 1).change();
	});
	$('.number-decrement').on('click', function(e) {
		e.preventDefault();
		var field = $(this).next('input');
		var newVal = (field.data('min') && parseInt(field.val()) > field.data('min')) ? parseInt(field.val()) - 1 : field.data('min');
		field.val(newVal).change();
	});
	$('.pax-number').on('change', function() {
		paxNumber = $(this).val();
		updateFares(parseInt($(this).val()));
	});


	$('#search-results, #fare-options, #purchase, #confirmation').hide();

	$('.search-submit').on('click', function(e) {
		e.preventDefault();
		$('#search-results').slideDown();
		$('header').slideUp();
		$('#searchForm').addClass('compact');
		updateFares(1);
		$('#search-results h2 time').text(currentDate.toLocaleDateString('cs-CZ', {day: 'numeric', month: 'long', year: 'numeric'}));
	});

	$('#search-results article').on('click', function() {
		$('#selected-result').prop('id','');
		$(this).prop('id', 'selected-result')
		var detailToggle = $(this).children('.detail-toggle').first();
		if (!detailToggle.prop('checked')) {
			$('#search-results article').removeClass('minimal');
			$('#search-results article').addClass('minimal');
			$(this).removeClass('minimal').addClass('detailed');
			$('#travelClass-second').prop('checked', true);
			$(this).children('.price').after($('#classes-fares'));
			detailToggle.prop('checked', !detailToggle.prop('checked'));
			updateFares(paxNumber);
			$('#pax-section').insertBefore('#classes-fares');
		}
	})
	
	$('.travel-class').on('click', function() {
		$(this).find('input[type=radio]').prop('checked', true);
	})

	$('#result-continue').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		$('#search-results h2').hide();
		$('#pax-section').hide();
		$('#search-results article.minimal').slideUp();
		var selectedPrice = $('#selected-result').find('input[name=travelClass]:checked').next('label').html();
		var selectedClass = parseInt($('#selected-result').find('input[name=travelClass]:checked').val());
		$('#search-results article.detailed').removeClass('detailed').find('.price a').html(selectedPrice).addClass('price-selected');
		$('#fare-options').slideDown();

		$('#search-results article').on('click', function() {
			$('#search-results article').slideDown().removeClass('price-selected');
			$("#fare-options, #purchase, #confirmation").slideUp();
			$('#pax-section').slideDown();
			$(this).addClass('detailed');
		})

		$('.seat-option').each(function() {
			var prerequisite = parseInt($(this).data('requiredclass'));
			if (prerequisite < selectedClass) {
				console.log(prerequisite, selectedClass);
				$(this).addClass('seat-unavailable');
			}
		});
		$('.seat-option').on('click', function() {
			if (!$(this).hasClass('seat-unavailable')) {
				$("#purchase, #confirmation").slideDown();
			}
		});
	})

	/*
	$('.search-submit').click();
	$('#search-results article')[1].click();
	$('#result-continue').click();
	*/
});