$(document).ready(() => {
    if ($('body').hasClass('calculator')) {
        $('#sjt-km').val(Math.round(Math.random()*200));
        $('#calc-results').hide();
        $('#calculate').on('click', function() {
            var cls = $('input[name=class]:checked').val();
            var dist = parseInt($('#sjt-km').val());
            $('#calc-results').slideDown();
            $('#single').html(calculatePrice(dist, cls) + " Kč");
            $('#return').html(calculatePrice(dist, cls, 'single', true) + " Kč");
            $('#weekly').html(calculatePrice(dist, cls, 'week') + " Kč");
            $('#monthly').html(calculatePrice(dist, cls, 'month') + " Kč");
            $('#quarterly').html(calculatePrice(dist, cls, 'quarter') + " Kč");
        });
    }
})
    
    function calculatePrice(dist, cls = 2, type = 'single', ret = false, pass = false) {
	const base = 1.3354;
    const fee = ret ? 11.935 : 11.498;
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
        2019: 2.1
    }

    if (pass) {
        if (passes[type]) {
            fare = passes[type][cls]
        } else {
            return false;
        }
    } else {
        var fare = ret ? 2 * (base * dist + fee) * 0.95 : base * dist + fee;
    
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
            switch (type) {
                case 'single':
                    fare = fare * 1.3;
                    break;
                default:
                    fare = fare * 1.2;
            }
        }
    }

    for (inflate in prisc) {
        console.log(fare + ' * ' + prisc[inflate]);
        fare = fare * ((100 + prisc[inflate]) / 100);
    }
    return Math.round(fare);
}