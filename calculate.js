//Typy jízdenek podle časové platnosti
const ticketTypes = ['single', 'return', 'week', 'month', 'quarter'];

$(document).ready(() => {
	$('#sjt-km').val(Math.round(Math.random()*200));
	$('#calc-results').hide();
	$('#calculate').on('click', function() {
		var cls = $('input[name=calc-class]:checked').val();
		var dist = parseInt($('#sjt-km').val());
		$('#calc-results').slideDown();
		ticketTypes.forEach((type) => {
			$('#cr-' + type).html(calculatePrice(dist, cls, type) + " Kč");
		});
	});
	$('#generate-table').on('click', function() {
		var cls = $('input[name=gen-class]:checked').val();
		var fare = $('#fareClass').val();
		var year = $('#priceYear').val();
		$('#gen-results').empty();
		generatePricelist(cls, fare, 1000, year);
	});
})
	
function calculatePrice(dist, cls = 2, type = 'single', year = false, pass = false) {
	//Základní kilometrická sazba
	const base = 1.3554;
	//Základní fixní sazba, odlišná pro zpáteční jednotlivé jízdenky
	const fee = (type == 'return') ? 11.935 : 11.498;
	//Základní výchozí ceny síťových jízdenek
	const passes = {
		'year': {
			1: 28090,
			2: 22500
		},
		'quarter': {
			1: 18090,
			2: 14500
		},
		'month': {
			1: 5690,
			2: 4500
		},
		'week': {
			1: 1890,
			2: 1500
		}
	};
	//Indexy růstu spotřebitelských cen za dobu existence tarifu
	const prisc = {
		2018: 0,
		2019: 2.1,
		2020: 2.7
	}
	//Pokud není specifikován ceníkový rok, použije se aktuální
	if (!year) {
		year = new Date().getFullYear();
	}

	//Mód výpočtu - síťová jízdenka vs kilometrický tarif
	if (pass) {
		if (passes[type]) {
			fare = passes[type][cls];
		} else {
			return false;
		}
	} else {
		//Výpočet základní kilometrické hodnoty včetně fixní složky
		var fare = (type == 'return') ? 2 * (base * dist + fee) * 0.95 : base * dist + fee;
	
		//Násobení koeficientem pro 1. třídu, koeficient odlišný pro jednotlivé a traťové jízdenky
		if (cls == 1) {
			fare = (type == 'single' || type == 'return') ? fare * 1.3 : fare * 1.2;
		}
	}

	//Roční valorizace na základě inflace, iterativně
	for (yearValue in prisc) {
		if (yearValue <= year) {
			fare *= (100 + prisc[yearValue]) / 100;
		} else {
			break;
		}
	}
	//Zaokrouhlení finální valorizované ceny
	fare = Math.round(fare);
	
	//Multiplikátor pro traťové jízdenky
	if (!pass) {
		switch (type) {
			case 'week':
				fare *= 8;
				break;
			case 'month':
				fare *= 28;
				break;
			case 'quarter':
				fare *= 74;
				break;
		}
	}
	return fare;
}

function generatePricelist(cls = 2, fare = 100, maxkm = 1000, year = false) {
	//Ošetření nepřípustné kombinace třídy a tarifu
	if (cls == 1 && fare != 100) {
		$('#gen-results').append($('<p></p>').text('Na 1. třídu se nevztahují státem nařízené slevy.'));
		return false;
	}
	//Hlavičky výstupní tabulky
	const labels = ['km','jednosměrná','zpáteční','traťová 7d','traťová 30d','traťová 90d'];
	const genTable = $('<table></table>');
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
			var price = Math.round(calculatePrice(i, cls, type, year) * fare / 100);
			currentRow.append($('<td></td>').text(price));
		});
		genTable.append(currentRow);
	}
}