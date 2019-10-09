function updateFares(pax, currency = "Kč") {
	$('.result').each((i, el) => {
		$(el).find('.amount').each(function() {
			var price = pax * calculatePrice($(el).data('distance'), $(this).data('travelclass'));
			$(this).html(price + "&nbsp;" + currency);
		});
	});
}

function calculatePrice(dist, cls = 2, val = 'single', ret = false) {
	const base = 1.3354;
	const fee = ret ? 11.935 : 11.498;
	var fare = ret ? Math.round(2 * (base * dist + fee) * 0.95) : Math.round(base * dist + fee);

	switch (val) {
		case 'single':
			return (cls == 1) ? Math.round(fare * 1.3) : fare;
		case 'weekly':
			fare = 8 * fare;
			return (cls == 1) ? Math.round(fare * 1.2) : fare;
		case 'monthly':
			fare = 28 * fare;
			return (cls == 1) ? Math.round(fare * 1.2) : fare;
		case 'quarterly':
			fare = 74 * fare;
			return (cls == 1) ? Math.round(fare * 1.2) : fare;
	}
}

function typeIn(text, field) {
	setTimeout(() => {
		if (text.length) {
			field.val(field.val() + text[0])
			typeIn(text.slice(1), field);
		}
	}, 80);
}

$(() => {
	
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
		$('#search h1').slideUp();
		$('#search').addClass('compact');
		$('#search-results').slideDown();
		updateFares(1);
		$('#search-results h2 time').text(currentDate.toLocaleDateString('cs-CZ', {day: 'numeric', month: 'long', year: 'numeric'}));
	});

	$('#search-results article').on('click', function() {
		$('#selected-result').prop('id','');
		$(this).prop('id', 'selected-result')
		var detailToggle = $(this).children('.detail-toggle').first();
		if (!detailToggle.prop('checked')) {
			$('#search-results article').addClass('minimal');
			$(this).removeClass('minimal').addClass('detailed');
			$('#travelClass-second').prop('checked', true);
			$(this).children('.price').after($('#classes-fares'));
			detailToggle.prop('checked', true);
			updateFares(paxNumber);
		}
	})
	
	$('.travel-class').on('click', function() {
		$(this).find('input[type=radio]').prop('checked', true);
	})

	$('#result-continue').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		$('#search-results h2').slideUp();
		$('#pax-section').slideUp();
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

	var origin = 'Praha';
	var destination = 'Hradec Králové'

	typeIn(origin, $('#search-origin'));
	setTimeout(() => {
		typeIn(destination, $('#search-destination'));
	}, 1000);
	/*
	$('.search-submit').click();
	$('#search-results article')[1].click();
	$('#result-continue').click();
	*/

	if ($('body').hasClass('calculator')) {
		$('#sjt-km').val(Math.round(Math.random()*200));
		$('#results').hide();
		$('#calculate').on('click', function() {
			var cls = $('input[name=class]:checked').val();
			var dist = parseInt($('#sjt-km').val());
			$('#results').slideDown();
			$('#single').html(calculatePrice(dist, cls) + " Kč");
			$('#return').html(calculatePrice(dist, cls, 'single', true) + " Kč");
			$('#weekly').html(calculatePrice(dist, cls, 'weekly') + " Kč");
			$('#monthly').html(calculatePrice(dist, cls, 'monthly') + " Kč");
			$('#quarterly').html(calculatePrice(dist, cls, 'quarterly') + " Kč");
		});
	}
});