const ticketTypes = ['single', 'return', 'week', 'month', 'quarter'];
$(document).ready(() => {
    $('#sjt-km').val(Math.round(Math.random()*200));
    $('#calc-results, #gen-results').hide();
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
        $('#gen-results').empty();
        generatePricelist(cls, fare);
        $('#gen-results').slideDown();
    });
})
    
function calculatePrice(dist, cls = 2, type = 'single', pass = false, year = false) {
	const base = 1.3554;
    const fee = (type == 'return') ? 11.935 : 11.498;
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
    const prisc = {
        2018: 1,
        2019: 2.1
    }
    if (!year) {
        year = new Date().getFullYear();
    }

    if (pass) {
        if (passes[type]) {
            fare = passes[type][cls];
        } else {
            return false;
        }
    } else {
        var fare = (type == 'return') ? 2 * (base * dist + fee) * 0.95 : base * dist + fee;
    
        switch (type) {
            case 'week':
                fare = 8 * fare;
                break;
            case 'month':
                fare = 28 * fare;
                break;
            case 'quarter':
                fare = 74 * fare;
                break;
        }
        
        if (cls == 1) {
            fare = (type == 'single' || type == 'return') ? fare * 1.3 : fare * 1.2;
        }
    }

    for (inflate in prisc) {
        fare = fare * ((100 + prisc[inflate]) / 100);
    }
    return Math.round(fare);
}

function generatePricelist(cls = 2, fare = 100, maxkm = 1000, year = false) {
    if (cls == 1 && fare != 100) {
        $('#gen-results').append($('<p></p>').text('Na 1. třídu se nevztahují státem nařízené slevy.'));
        return false;
    }
    const labels = ['km','jednosměrná','zpáteční','traťová 7d','traťová 30d','traťová 90d'];
    const genTable = $('<table></table>');
    var firstRow = $('<tr></tr>');
    genTable.append(firstRow);
    labels.forEach((label) => {
        $('<th></th>').text(label).appendTo(firstRow);
    });
    $('#gen-results').append(genTable);
    console.log(fare);
    for (var i = 1; i <= maxkm; i++) {
        var currentRow = $('<tr></tr>').appendTo(genTable);
        currentRow.append($('<td></td>').text(i));
        ticketTypes.forEach((type) => {
            var price = Math.round(calculatePrice(i, cls, type) * fare / 100);
            currentRow.append($('<td></td>').text(price));
        });  
    }
}