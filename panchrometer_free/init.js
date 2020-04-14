window.onload = function() {
	['Sun','Sat','Fri','Thu','Wed','Tue','Mon'].forEach(function(v) {
		var h1 = document.createElement('h1');
		h1.innerHTML = v;
		document.getElementById('calendar').children[0].appendChild(h1);
	});
	['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM', '12:00 PM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM', '06:00 AM'].forEach(function(time) {
		var el = document.createElement('div');
		el.classList.add('time');
		el.innerHTML = time;
		document.getElementById('times').appendChild(el);
	});
	for(var i=0;i<7;i++) {
		var row = document.createElement('div');
		row.classList.add('row');
		row.appendChild(document.createElement('ul'));
		document.getElementById('screenrows').appendChild(row);
	}
}
