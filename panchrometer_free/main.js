// Initialize Firebase with Panchrometer's Firebase configuration
firebase.initializeApp({
	apiKey: "AIzaSyAb7tGMNSwnWG7wfunTsALR8kjLAaYpZys",
	authDomain: "panchrometer-1572060606056.firebaseapp.com",
	databaseURL: "https://panchrometer-1572060606056.firebaseio.com",
	projectId: "panchrometer-1572060606056",
	storageBucket: "panchrometer-1572060606056.appspot.com",
	messagingSenderId: "933084642880",
	appId: "1:933084642880:web:5192c4172a3b93479229a5",
	measurementId: "G-4XS0YK3WS2"
});

// https://developers.google.com/calendar/quickstart/js?pli=1
var CLIENT_ID = '535314204354-n7fsagpmgq6jb9i5rv62b4a6ksea1pbn.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAcvgdpDvimSAdVN4oPZwqLJwKOJ2keobk';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var panchrometer_settings = {
	'minTodoStartTime':new Date(),
	'maxTodoStartTime':new Date(),
	'reservedTimes':[[],[],[],[],[],[],[]]
};

var panchrometer_calendar_ids = [];
var panchrometer_events = [];

var panchrometer_add_event;
var panchrometer_add_event_starttime;
var panchrometer_add_event_endtime;

panchrometer_settings.minTodoStartTime.setHours(11);
panchrometer_settings.minTodoStartTime.setMinutes(0);
panchrometer_settings.maxTodoStartTime.setHours(22);
panchrometer_settings.maxTodoStartTime.setMinutes(0);

var lastHalfOnTheLeft = true;

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
	gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
	gapi.client.init({
		apiKey: API_KEY,
		clientId: CLIENT_ID,
		discoveryDocs: DISCOVERY_DOCS,
		scope: SCOPES
	}).then(function () {
		// Listen for sign-in state changes.
		gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

		// Handle the initial sign-in state.
		updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
		document.getElementById('signingoogle').onclick = handleAuthClick;
	}, function(error) {
		console.err(error);
	});
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
	if (isSignedIn) {
		document.getElementById('signingoogle').style.visibility = 'hidden';
		document.getElementById('signingoogle').style.height = '0px';
		var profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
		firebase.firestore().collection('users').doc(profile.getEmail()).get().then(function(doc) {
			if(!doc.exists) {
				firebase.firestore().collection('users').doc(profile.getEmail()).set({'calendar_names':[]});
			}
		});
		//panchrometerFetchEvents();
		document.getElementById('signin').classList.remove('active');
		document.getElementById('calendar-import').classList.add('active');
		panchrometerLoadCalendarOptions();
	}
}

document.getElementById('go').onclick = function() {
	if(document.getElementById('calendar-import').classList.contains('active')) {
		document.getElementById('calendar-import').classList.remove('active');
		document.getElementById('product').classList.add('active');
		var panchrometer_calendar_names = [];
		[...document.getElementsByClassName('calendar-option')].forEach(function(v) {
			if(v.classList.contains('selected')) {
				panchrometer_calendar_names.push(v.innerHTML);
				panchrometer_calendar_ids.push(v.id);
			}
		});
		var profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
		firebase.firestore().collection('users').doc(profile.getEmail()).set({
			'calendar_names':panchrometer_calendar_names
		});
		panchrometerFetchEvents();
	}
};

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
	gapi.auth2.getAuthInstance().signIn();
}

function parseTime(time) {
	var hours = parseInt(time.split(':')[0]);
	var minutes = parseInt(time.split(':')[1]);
	return hours * 60 + minutes;
}

function panchrometerLoadCalendarOptions() {
	var profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
	var used_calendar_names = [];
	firebase.firestore().collection('users').doc(profile.getEmail()).get().then(function(v) {
		if(v.exists) {
			for(var i=0;i<v.data()['calendar_names'].length;i++) { used_calendar_names.push(v.data()['calendar_names'][i]); }
		}
	});
	gapi.client.calendar.calendarList.list().execute(function(resp) {
		var el;
		for(var i=0;i<resp.items.length;i++) {
			el = document.createElement('button');
			el.classList.add('calendar-option');
			el.classList.add('selected');
			el.innerHTML = resp.items[i].summary;
			el.id = resp.items[i].id;
			if(used_calendar_names.length > 0 && used_calendar_names.indexOf(resp.items[i].summary) === -1) {
				el.classList.remove('selected');
			}
			el.onclick = function() {
				if(this.classList.contains('selected')) { this.classList.remove('selected'); }
				else { this.classList.add('selected'); }
			};
			document.getElementById('calendar-import').insertBefore(el, document.getElementById('go'));
		}
	});
}

function panchrometerDetectTimeCollision(min, max, time) {
	var minTime = min.getHours() * 60 + min.getMinutes();
	var timeTime = time.getHours() * 60 + time.getMinutes();
	var maxTime = max.getHours() * 60 + max.getMinutes();
	return minTime <= timeTime && timeTime <= maxTime;
}

function panchrometerSortEvents() {
	var rows = [...document.getElementsByClassName('row')].map(function(v) {
		return v.children[0];
	});
	for(var i=0;i<rows.length;i++) {
		var children = [...rows[i].children];
		children.sort(function(a, b) {
			return (parseTime(a.startTime) + parseTime(a.endTime)) / 2 -
			       (parseTime(b.startTime) + parseTime(b.endTime)) / 2;
		});
		while(rows[i].firstChild) { rows[i].removeChild(rows[i].firstChild); }
		for(var j=0;j<children.length;j++) { rows[i].appendChild(children[j]); }
	}
}

function panchrometerDeployTodo(name, length) {
	var hours, minutes, start = new Date(), end = new Date();
	var minStartTime = panchrometer_settings.minTodoStartTime.getHours() * 60 + panchrometer_settings.minTodoStartTime.getMinutes();
	var maxStartTime = panchrometer_settings.maxTodoStartTime.getHours() * 60 + panchrometer_settings.maxTodoStartTime.getMinutes();
	outermost: for(var day=0;day<7;day++) {
		outer: for(var time=minStartTime;time<maxStartTime;time+=30) {
			hours = Math.floor(time / 60) - 1;
			minutes = time % 60;
			start.setHours(hours);
			start.setMinutes(minutes);
			start.setSeconds(0);
			end.setHours(hours + length.getHours());
			end.setMinutes(minutes + length.getMinutes());
			end.setSeconds(0);
			for(var i=0;i<panchrometer_settings.reservedTimes[day].length;i++) {
				if(panchrometerDetectTimeCollision(panchrometer_settings.reservedTimes[day][i].startTime, panchrometer_settings.reservedTimes[day][i].endTime, start) ||
				   panchrometerDetectTimeCollision(panchrometer_settings.reservedTimes[day][i].startTime, panchrometer_settings.reservedTimes[day][i].endTime, end)) {
					continue outer;
				}
			}
			// https://stackoverflow.com/questions/11789647/setting-day-of-week-in-javascript
			start.setDate(new Date().getDate() + (day - new Date().getDay()));
			start.setDate(start.getDate() === 6 ? 0 : start.getDate() + 1);
			end.setDate(new Date().getDate() + (day - new Date().getDay()));
			end.setDate(end.getDate() === 6 ? 0 : end.getDate() + 1);
			panchrometerAddEvent(name, start, end, half=false, type='generated');
			panchrometerSortEvents();
			break outermost;
		}
	}
}

function panchrometerDeployTodos() {
	var todo;
	for(var i=0;i<document.getElementById('todo-list').children.length;i++) {
		todo = document.getElementById('todo-list').children[i];
		var d = new Date();
		d.setHours(parseInt(todo.children[3].value.split(':')[0]));
		d.setMinutes(parseInt(todo.children[3].value.split(':')[1]));
		panchrometerDeployTodo(todo.children[0].value, d);
	}
}

/*
document.getElementById('deploy-todos').onclick = function() {
	panchrometerDeployTodos();
};
*/

function format(number) {
	return (number < 10) ? '0' + number : '' + number;
}

function createEvent(name, startTime, endTime, day, half, type__) {
	var template = document.getElementById('calendar-event');
	var node = document.importNode(template.content, true);
	var event = node.querySelectorAll('li')[0];
	var yPos = (startTime.getHours() * 60 + startTime.getMinutes()) / 60;
	if(yPos >= 7) { yPos -= 7; }
	else if(yPos < 7) { yPos += 17; }
	if(half) {
		event.style.width = 'calc(5vw - 20px)';
		if(lastHalfOnTheLeft) {
			event.style.marginLeft = 'calc(5vw + 10px)';
		}
		lastHalfOnTheLeft = !lastHalfOnTheLeft;
	}
	event.style.top = (20 * yPos) + '%';
	var size = (endTime.getHours() * 60 + endTime.getMinutes()) - (startTime.getHours() * 60 + startTime.getMinutes());
	size = Math.max(20, size);
	event.style.height = 'calc(' + (20 * size / 60) + '% - 4px)';
	event.children[0].innerHTML = name + ((type__ === 'generated') ? ' (generated)' : '');
	//event.children[1].onclick = function() { this.parentElement.parentElement.removeChild(this.parentElement); }
	event.startTime = format(startTime.getHours()) + ':' + format(startTime.getMinutes());
	event.endTime = format(endTime.getHours()) + ':' + format(endTime.getMinutes());
	event.day = day;
	event.onclick = function() {
		document.getElementById('event-name').innerHTML = name;
		document.getElementById('event-day').innerHTML = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
		document.getElementById('event-start').value = this.startTime;
		document.getElementById('event-end').value = this.endTime;

		document.getElementById('event-information').classList.remove('hidden');
		document.getElementById('event-information').classList.add('shown');
	};
	if(type__ === 'generated') {
		event.children[0].classList.add('generated');
	}
	panchrometer_events.push(event);
	return event;
}

function panchrometerAddEvent(name, startTime, endTime, half=false, type='normal') {
	var day = (startTime.getDay() === 0) ? 6 : startTime.getDay() - 1;
	[...document.getElementsByClassName('row')][day].children[0].appendChild(createEvent(name, startTime, endTime, day, half, type));
}

function panchrometerCheckTimeCollisions() {
	var e1, e1_start, e1_end, e2, e2_start, e2_end;
	for(var i=0;i<panchrometer_events.length;i++) {
		for(var j=i+1;j<panchrometer_events.length;j++) {
			e1 = panchrometer_events[i];
			e2 = panchrometer_events[j];
			if(e1.day !== e2.day) { continue; }
			e1_start = parseTime(e1.startTime);
			e1_end = parseTime(e1.endTime);
			e2_start = parseTime(e2.startTime);
			e2_end = parseTime(e2.endTime);

			if((e1_start <= e2_start && e2_start <= e1_end) ||
			   (e1_start <= e2_end && e2_end <= e1_end) ||
			   (e2_start <= e1_start && e1_start <= e2_end) ||
				 (e2_start <= e1_end && e1_end <= e2_end)) {
				if(e1.right) {
					e2.right = false;
					e2.style.width = 'calc(5vw - 4px)';
				}
				else {
					if(typeof e1.right === 'undefined') {
						e1.right = false;
						e1.style.width = 'calc(5vw - 4px)';
					}
					e2.right = true;
					e2.style.width = 'calc(5vw - 4px)';
					e2.style.marginLeft = 'calc(5vw + 2px)';
				}
			}
		}
	}
}

function panchrometerAddEvents(response) {
	var events = response.result.items;
	for(var i=0;i<events.length;i++) {
		var startTime = new Date(events[i].start.dateTime || events[i].start.date);
		var endTime = new Date(events[i].end.dateTime || events[i].end.date);
		startTime.setHours(startTime.getHours() + 1);
		endTime.setHours(endTime.getHours() + 1);
		panchrometer_settings.reservedTimes[startTime.getDay()===0?6:startTime.getDay()-1].push({'startTime':startTime, 'endTime':endTime});
		panchrometerAddEvent(events[i].summary, startTime, endTime);
	}
	panchrometerCheckTimeCollisions();
}

function panchrometerFetchEvents() {
	// https://lifelongprogrammer.blogspot.com/2014/06/js-get-first-last-day-of-current-week-month.html
	var day = new Date().getDay();
	var d = new Date();
	// https://stackoverflow.com/questions/29974011/try-to-display-calendar-list-from-google-api-using-java-script
	for(var i=0;i<panchrometer_calendar_ids.length;i++) {
		gapi.client.calendar.events.list({
			'calendarId':panchrometer_calendar_ids[i],
			'timeMin':(new Date(d.getFullYear(), d.getMonth(), d.getDate() + (day == 0?-6:1)- day)).toISOString(),
			'timeMax':(new Date(d.getFullYear(), d.getMonth(), d.getDate() + (day == 0?0:7) - day)).toISOString(),
			'maxResults':100,
			'showDeleted':false,
			'singleEvents':true,
			'orderBy':'startTime'
		}).then(function(response) {
			panchrometerAddEvents(response);
		});
	}
}

function addTodo() {
	var template = document.getElementById('todo');
	var node = document.importNode(template.content, true);
	var todo = node.querySelectorAll('li')[0];
	todo.children[0].value = document.getElementById('todo-name').value;
	todo.children[1].onclick = function() {
		this.parentElement.parentElement.removeChild(this.parentElement);
	}
	document.getElementById('todo-list').appendChild(todo);
	document.getElementById('todo-name').value = '';
}

document.getElementById('schedule-events-button').onclick = function() {
	document.getElementById('schedule-events').style.visibility = 'visible';
};

document.getElementById('repeating-select').onchange = function() {
	if(document.getElementById('repeating-select').value == 'D') {
		[...document.getElementById('check-container').children].forEach(function(v) {
			v.checked = true;
		});
	}
};

document.getElementById('event-information-exit').onclick = function() {
	document.getElementById('schedule-events').style.visibility = 'hidden';
}

function panchrometer_parse_timestring(timestring) {
	parts = timestring.split(":").map(function(v) { return parseInt(v); });
	return parts[0] * 60 + parts[1];
}

function panchrometer_parse_time(time) {
	return Math.floor(time / 60) + ":" + (time % 60);
}

function __panchrometer_check_time_collision(s1, e1, s2, e2) {
	return (s1 <= s2 && s2 <= e1) || (s1 <= e2 && e2 <= e1);
}

function panchrometer_time_collision(startTime, endTime) {
	var t1 = (typeof startTime === 'string') ? panchrometer_parse_timestring(startTime) : startTime;
	var t2 = (typeof endTime === 'string') ? panchrometer_parse_timestring(endTime) : endTime;
	for(var i=0;i<panchrometer_events.length;i++) {
		var ev = panchrometer_events[i];
		var t3 = (typeof ev.startTime === 'string') ? panchrometer_parse_timestring(ev.startTime) : ev.startTime;
		var t4 = (typeof ev.endTime === 'string') ? panchrometer_parse_timestring(ev.endTime) : ev.endTime;
		if(panchrometer_add_event.days[ev.day] === true && __panchrometer_check_time_collision(t1, t2, t3, t4)) {
			return false;
		}
	}
	return true;
}

function panchrometer_find_time(t1, t2) {
	var duration = panchrometer_parse_timestring(panchrometer_add_event.duration)
	var startTime, endTime;
	if(typeof t1 !== 'undefined' && typeof t2 !== 'undefined') {
		startTime = t1 + duration;
		endTime = t2 + duration;
	}
	else {
		startTime = 420;
		endTime = 420 + duration;
	}
	while(endTime <= 1260 && panchrometer_time_collision(startTime, endTime)) {
		startTime += duration;
		endTime += duration;
	}
	if(endTime > 1260) {
		return [NaN, NaN];
	}
	return [startTime, endTime]
}

document.getElementById('event-information-next').onclick = function() {
	document.getElementById('event-information-subwindow').classList.remove('active');
	[...document.getElementById('event-information-subwindow').children].forEach(function(v) {
		v.style.visibility = 'hidden';
	});
	document.getElementById('event-options').classList.add('active');

	var select = document.getElementById('repeating-select');
	if(select.options[select.selectedIndex].value == 'D') {
		[...document.getElementById('check-container').children].forEach(function(v) {
			v.checked = true;
		});
	}

	panchrometer_add_event = {
		'name':document.getElementById('event-information-name').value || 'Name',
		'duration':document.getElementById('event-time').value || '01:00',
		'days':[...document.getElementById('check-container').children].map(function(v) { return v.checked }),
		'repeating':select.options[select.selectedIndex].value
	};

	[panchrometer_add_event_starttime, panchrometer_add_event_endtime] = panchrometer_find_time();
	if(panchrometer_add_event_starttime == NaN || panchrometer_add_event_endtime == NaN) {
		// TODO: this
	}
	else {
		panchrometer_display_temporary_event();
	}
};

document.getElementById('event-options-back').onclick = function() {
	document.getElementById('event-information-subwindow').classList.add('active');
	[...document.getElementById('event-information-subwindow').children].forEach(function(v) {
		v.style.visibility = 'inherit';
	});
	document.getElementById('event-options').classList.remove('active');
};

document.getElementById('event-options-yes').onclick = function() {
	panchrometer_apply_temporary_event();
};

document.getElementById('event-options-next').onclick = function() {
	[panchrometer_add_event_starttime, panchrometer_add_event_endtime] = panchrometer_find_time(panchrometer_add_event_starttime, panchrometer_add_event_endtime);
	if(panchrometer_add_event_starttime == NaN || panchrometer_add_event_endtime == NaN) {
		// TODO: this
	}
	else {
		panchrometer_display_temporary_event();
	}
};

document.getElementById('remove-events-button').onclick = function() {
	document.getElementById('remove-events').style.visibility = 'visible';
	[...document.getElementById('removal-info').children].forEach(function(v) {
		v.style.visibility = 'hidden';
	});
};

document.getElementById('removal-done').onclick = function() {
	document.getElementById('remove-events').style.visibility = 'hidden';
};

document.getElementById('removal-about').onclick = function() {
	document.getElementById('removal-options').classList.remove('active');
	[...document.getElementById('removal-options').children].forEach(function(v) {
		v.style.visibility = 'hidden';
	});
	document.getElementById('removal-info').classList.add('active');
	[...document.getElementById('removal-info').children].forEach(function(v) {
		v.style.visibility = 'inherit';
	});
};

document.getElementById('removal-back').onclick = function() {
	document.getElementById('removal-options').classList.add('active');
	[...document.getElementById('removal-options').children].forEach(function(v) {
		v.style.visibility = 'inherit';
	});
	document.getElementById('removal-info').classList.remove('active');
	[...document.getElementById('removal-info').children].forEach(function(v) {
		v.style.visibility = 'hidden';
	});
};

/*
document.getElementById('todo-add').onclick = function(ev) {
	addTodo();
};
*/

/*
document.getElementById('todo-name').onkeydown = function(ev) {
	if(ev.keyCode === 13) {
		ev.preventDefault();
		addTodo();
	}
}
*/

document.getElementById('event-quit').onclick = function(ev) {
	document.getElementById('event-information').classList.remove('shown');
	document.getElementById('event-information').classList.add('hidden');
}

/*
document.getElementById('time-optimization-button').onclick = function() {
	document.getElementById('time-optimization').classList.add('shown');
	document.getElementById('time-optimization-activities').classList.add('active');

	var names = {};
	for(var i=0;i<panchrometer_events.length;i++) {
		var ev = panchrometer_events[i];
		if(typeof names[ev.children[0].innerHTML] === 'undefined') {
			names[ev.children[0].innerHTML] = 0;
		}
		names[ev.children[0].innerHTML] += Math.abs(ev.endTime - ev.startTime) / 60000;
	}

	if(document.getElementById('activities').children.length === 0) {
		for(var i=0;i<Object.keys(names).length;i++) {
			var li = document.createElement('li');
			li.classList.add('activity');
			li.innerHTML = Object.keys(names)[i];
			document.getElementById('activities').appendChild(li);
		}
	}


	if(document.getElementById('activity-buttons').children.length === 0) {
		for(var i=0;i<Object.keys(names).length;i++) {
			var li = document.createElement('li');
			li.classList.add('activity');
			li.innerHTML = Object.keys(names)[i];
			li.onclick = function() {
				if(this.classList.contains('selected')) {
					this.classList.remove('selected');
				}
				else {
					this.classList.add('selected');
				}
			}
			document.getElementById('activity-buttons').appendChild(li);
		}
	}
};

[...document.getElementsByClassName('back')].forEach(function(v) {
	v.onclick = function() {
		this.parentElement.classList.remove('active');
		this.parentElement.parentElement.classList.remove('shown');
	};
});

[...document.getElementsByClassName('prev')].forEach(function(v) {
	v.onclick = function() {
		this.parentElement.classList.remove('active');
		this.parentElement.previousElementSibling.classList.add('active');
	};
});

[...document.getElementsByClassName('next')].forEach(function(v) {
	v.onclick = function() {
		this.parentElement.classList.remove('active');
		this.parentElement.nextElementSibling.classList.add('active');
	};
});*/
