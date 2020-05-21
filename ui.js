$(document).ready(() => {
	$('#sjt-km').val(Math.round(Math.random()*200));
	$('#calc-results, #pass-prices').hide();
	$('section:not(first-of-type').hide();
	$('#calculate').on('click', function() {
		for (var cls = 2; cls >= 1; cls--) {
			var dist = parseInt($('#sjt-km').val());
			var year = parseInt($('#calcPriceYear').val());
			ticketTypes.forEach((type) => {
				$('#cr-' + cls + '-' + type).html(calculatePrice(dist, cls, type, year) + " Kč");
			});
		}
		ticketTypes.forEach((type) => {
			$('#cr-d-' + type).html(getSpecificFare(calculatePrice(dist, 2, type, year), 25) + " Kč");
		});
		$('#calc-results').slideDown();
	});
	$('#generate-table').on('click', function() {
		var cls = $('input[name=gen-class]:checked').val();
		var fare = $('#fareClass').val();
		var year = $('#priceYear').val();
		$('#gen-results').empty();
		generatePricelist(cls, fare, 1000, year);
	});
	$('#get-passes').on('click', function() {
		var year = $('#passYear').val();
		for (var cls = 2; cls >= 1; cls--) {
			passTypes.forEach((type) => {
				$('#cp-' + cls + '-' + type).html(getPassPrice(type, cls, year) + " Kč");
			});
		}
		$('#pass-prices').slideDown();		
	});

	const currentDate = new Date();
	const calStart = getCalendarStart(currentDate.getFullYear());
	var currentYear = (currentDate > calStart) ? currentDate.getFullYear()+1 : currentDate.getFullYear();
	$('#currentPriceYear').text((currentYear-1).toString() + "/" + currentYear.toString());
	$('select.yearSelect').val(currentYear);

	$('nav input[name=tabs]').on('change', function() {
		$('section').hide();
		$('#' + $(this).val()).show();
	});
	$('nav input[name=tabs]').first().click();
	$('nav input[name=tabs]').last().on('click', () => {
		$('#get-passes').click();
	});
});

function generatePricelist(cls = 2, fare = 100, maxkm = 1000, year = false) {
	//Ošetření nepřípustné kombinace třídy a tarifu
	if (cls == 1 && fare != 100) {
		$('#gen-results').append($('<p></p>').text('Na 1. třídu se nevztahují státem nařízené slevy.'));
		return false;
	}
	//Hlavičky výstupní tabulky
	const labels = ['km','jednosměrná','zpáteční','traťová 7d','traťová 30d','traťová 90d'];
	const genTable = $('<table></table>').attr('id','fareTable');
	const firstRow = $('<tr></tr>');
	genTable.append(firstRow);
	labels.forEach((label) => {
		$('<th></th>').text(label).appendTo(firstRow);
	});
	$('#gen-results').append(genTable);
	//Výpočet cen pro jednotlivé kilometrické vzdálenosti
	for (var i = 1; i <= maxkm; i++) {
		var currentRow = $('<tr></tr>');
		currentRow.append($('<td></td>').text(i));
		ticketTypes.forEach((type) => {
			//Zaokrouhlení finální ceny po aplikaci slevy
			var fullPrice = calculatePrice(i, cls, type, year);
			var price = getSpecificFare(fullPrice, fare);
			currentRow.append($('<td></td>').text(price));
		});
		genTable.append(currentRow);
	}
}