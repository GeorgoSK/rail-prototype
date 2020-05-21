//Typy jízdenek podle časové platnosti
//Jednotlivé, zpáteční a traťové jízdenky - cena se počítá podle km:
const ticketTypes = ['single', 'return', 'week', 'month', 'quarter'];

//Síťové jízdenky - cena je dána fixně:
const passTypes = ['week','month','quarter','half','year'];

//Aktuálně používané slevové kategorie [% z ceny obyčejného jízdného]
const discountFares = [25,50];

//Indexy růstu spotřebitelských cen za dobu existence tarifu, klíč představuje ceníkový rok - v ceníkovém roce 2018 jízdné nebylo valorizováno
const prisc = {
	2018: 0,
	2019: 2.5,
	2020: 2.1,
	2021: 2.8
	// Nutno doplnit podle PRISC za prosinec 2020 pro ceníkový rok 2022 atd.
}

/**  
 * Pomocná funkce pro zjištění začátku následujícího grafikonu v kalendářním roce
  * @param	(string)	year	Kalendářní rok, pro který se zjišťuje začátek následujícího ceníkového roku
 * @returns (Date)		Datum začátku ceníkového roku
 */
function getCalendarStart(year) {
	// Ceníkový rok je ohraničen vždy platností vlakového grafikonu, který začíná vždy druhou neděli v prosinci
	var date = new Date(year, 11, 7);
	date.setDate(7 + (7 - date.getDay()));
	// Od tohoto data začíná nový ceníkový rok. V roce 2020 v tento den začíná ceníkový rok 2021
	return date;
}

// Cena jízdenky je valorizována podle toho, v jakém ceníkovém roku byla prodána
/**  
 * Funkce pro inflační valorizaci
 * @param	(float)		fare	Základní cena jízdenky v úrovni ceníkového roku 2018
 * @param	(string)	year	Ceníkový rok, pro který se cena počítá valorizovaná cena
 * @returns (float)		Valorizovaná cena jízdenky
*/
function inflate(fare, year) {
	//Pokud není specifikován ceníkový rok, zjistí se, jak se mají valorizovat ceny jízdenek vystavených dnes
	if (!year) {
		const currentDate = new Date();
		// Zjistíme, kdy v letošním roce začíná nový ceníkový rok (podle vlakového grafikonu)
		const calStart = getCalendarStart(currentDate.getFullYear());
		// Pokud dnešní datum spadá už do nového ceníkového roku, valorizujeme cenu podle toho
		year = (currentDate > calStart) ? currentDate.getFullYear()+1 : currentDate.getFullYear();
	}

	//Roční valorizace na základě inflace, iterativně
	for (yearValue in prisc) {
		if (yearValue <= year) {
			fare *= (100 + prisc[yearValue]) / 100;
		} else {
			break;
		}
	}
	return Math.round(fare);
}

/**  
 * Výpočet ceny z kilometrické vzdálenosti
 * @param	(int) 		dist	Tarifní vzdálenost v km
 * @param	(int) 		cls		Cestovní třída (1 nebo 2)
 * @param	(string)	type	Typ jízdenky ze seznamu ticketTypes
 * @param	(string)	year	Ceníkový rok, pro který se cena počítá (kvůli valorizaci)
 * @returns (float)		Cena jízdenky
*/
function calculatePrice(dist, cls = 2, type = 'single', year = false) {
	//Základní kilometrická sazba
	const base = 1.3554;
	//Základní fixní sazba, odlišná pro jednosměrné a zpáteční jednotlivé jízdenky
	const fee = (type == 'return') ? 11.935 : 11.498;

	//Výpočet základní kilometrické hodnoty včetně fixní složky
	var kmValue = base * dist + fee;
	
	//U zpáteční jízdenky se zdvojí cena a aplikuje 5% sleva
	var fare = (type == 'return') ? 2 * (kmValue) * 0.95 : kmValue;

	//Valorizace ceny podle ceníkového roku a zaokrouhlení
	fare = Math.round(inflate(fare, year));

	//Multiplikátor pro traťové jízdenky
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

	//Násobení koeficientem pro 1. třídu, koeficient odlišný pro jednotlivé a traťové jízdenky
	if (cls == 1) {
		fare = (type == 'single' || type == 'return') ? fare * 1.3 : fare * 1.2;
		fare = Math.round(fare);
	}
	
	return fare;
}

/**  
 * Výpočet zlevněného jízdného podle státem nařízených slev
 * @param	(float) 	fullPrice	Obyčejné jízdné (plná cena)
 * @param	(int) 		fareLevel	Slevová kategorie ze seznamu discountFares
 * @returns (float)		Cena zlevněné jízdenky
*/
function getSpecificFare(fullPrice, fareLevel) {
	var price = Math.round(fullPrice * fareLevel / 100);
	// Cena zlevněné jízdenky nesmí přesáhnout % určená slevovou kategorií
	// Příklad: pro obyčejné jízdné 22 Kč by po aplikaci slevy (22 * 0.25) byla cena 5,50 Kč -> zaokrouhleně 6 Kč, což je víc než 25 % z 22 Kč. Proto dodatečná korekce.
	while (price > fullPrice * fareLevel / 100) {
		price--;
	}
	return price;
}

/**  
 * Výpočet ceny síťové jízdenky
 * @param	(string) 	type		Typ síťové jízdenky ze seznamu passTypes
 * @param	(int) 		cls			Cestovní třída (1 nebo 2)
 * @param	(string) 	year		Ceníkový rok, pro který se cena počítá
 * @returns (float)		Cena síťové jízdenky
*/
function getPassPrice(type, cls =  2, year = false) {
	//Základní výchozí ceny síťových jízdenek
	const passes = {
		year: 22500,
		half: 14500,
		quarter: 11000,
		month: 4500,
		week: 1500
	};
	//Fixní příplatky k základní ceně síťové jízdenky, nepodléhají valorizaci
	const supplements = {
		year: 5590,
		half: 3590,
		quarter: 2690,
		month: 1190,
		week: 390
	}
	if (passes[type]) {
		// Cena se počítá z fixní základu, jen se valorizuje
		var fare = Math.round(inflate(passes[type], year));
		// Pro 1. třídu se aplikuje fixní příplatek bez valorizace
		return (cls == 1) ? fare + supplements[type] : fare;
	} else {
		return false;
	}
}