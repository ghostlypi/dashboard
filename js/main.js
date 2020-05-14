window.onload = () =>
{
	var user = {};

	// Your web app's Firebase configuration
	var firebaseConfig = {
		apiKey: "AIzaSyCPEZPVqnuhaZklOo7pt4QzVNtEuOBXJm4",
		authDomain: "dashb-64318.firebaseapp.com",
		databaseURL: "https://dashb-64318.firebaseio.com",
		projectId: "dashb-64318",
		storageBucket: "dashb-64318.appspot.com",
		messagingSenderId: "96183954238",
		appId: "1:96183954238:web:a1944bdf6add082be8da6f",
		measurementId: "G-27L0H86R4T"
	};
	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);
	firebase.analytics();

	function id(i){return document.getElementById(i);}
	function cls(c){return document.getElementsByClassName(c);}
	function tag(t){return document.getElementsByTagName(t);}

	function parseLen(text) { return (-1 < text && text < 10) ? '0' + text : text; }

	const months = [ 'Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug', 'Sep','Oct','Nov','Dec' ];

	const timeD = id('time');
	const dateD = id('date');
	setInterval(() =>
	{
		const year = new Date().getFullYear();
		const month = months[new Date().getMonth()];
		const day = new Date().getDate();
		dateD.innerHTML = month + ' ' + day + ' ' + year;

		const hour = parseLen(new Date().getHours());
		const minute = parseLen(new Date().getMinutes());
		const second = parseLen(new Date().getSeconds());
		timeD.innerHTML = hour + ':' + minute + ':' + second;
	},1000);

	function setColor(color)
	{
		[].forEach.call(cls('clr-bg'),
			elem => elem.style.backgroundColor = color);
		[].forEach.call(cls('clr-fg'),
			elem => elem.style.color = color);
		[].forEach.call(cls('prog-bar'),
			elem => elem.setAttribute('stroke',color))
	}

	id('change-color').onclick = () =>
	{
		setColor(id('color-value').value);
	};

	[].forEach.call(cls('color'),
		elem => elem.onclick = () =>
	{
		setColor(elem.textContent);
	});

	[].forEach.call(cls('add'),
		e => e.onclick = () =>
	{
		const elem = cls('percent')[[].indexOf.call(cls('add'),e)];
		elem.value = Math.min(parseInt(elem.value) + 1,100);
		const idx = [].indexOf.call(cls('percent'), elem);
		user.goals[idx]['progress'] = elem.value;
		firebase.firestore().collection('users').doc(user.email).set(user);
	});

	[].forEach.call(cls('sub'),
		e => e.onclick = () =>
	{
		const elem = cls('percent')[[].indexOf.call(cls('sub'),e)];
		elem.value = Math.max(parseInt(elem.value) - 1,0);
		const idx = [].indexOf.call(cls('percent'), elem);
		user.goals[idx]['progress'] = elem.value;
		firebase.firestore().collection('users').doc(user.email).set(user);
	});

	[].forEach.call(cls('goal'),
		e => e.onkeydown = evt =>
	{
		if(evt.keyCode === 13) { evt.preventDefault(); }
		const idx = [].indexOf.call(cls('goal'), e);
		user.goals[idx]['name'] = e.value;
		firebase.firestore().collection('users').doc(user.email).set(user);
	});

	[].forEach.call(cls('percent'),
		e => e.onkeydown = evt =>
	{
		if(evt.keyCode === 13)
		{
			const box = cls('progress')[[].indexOf.call(cls('percent'),e)];
			box.style.width = e.value + '%';
			evt.preventDefault();
		}
	});

	//==================================================================

	function revGeoCode(geocoder,lat,lng)
	{
		geocoder.geocode({'location':{'lat':lat,'lng':lng}},
			(results,status) =>
		{
			if(status === 'OK')
			{
				if(results[3])
				{
					id('city').textContent = results[3].formatted_address;
				}
			}
		});
	}

	if(navigator.geolocation)
	{
		const geocoder = new google.maps.Geocoder();
		navigator.geolocation.getCurrentPosition(
			ps =>
			{
				revGeoCode(geocoder,ps.coords.latitude,ps.coords.longitude);
			}
		);
	}

	//==================================================================

	[].forEach.call(cls('prog-bar'),
		elem =>
	{
		setInterval(() =>
		{
			let disp = cls('percent')[[].indexOf.call
			(
				cls('prog-bar'),
				elem
			)];
			let prog = Math.min(Math.max(isNaN(parseInt(disp.value)) ? 0 : parseInt(disp.value),0),100);
			if(prog <= 33.33)
			{
				const pX = 50 + 45 * prog / 33.33;
				const pY = 5 + 90 * prog / 33.33;
				elem.setAttribute('d','M50 5 L' + pX + ' ' + pY + ' Z');
			}
			else if(prog <= 66.66)
			{
				const pX = 95 - 90 * (prog - 33.33) / 33.33;
				elem.setAttribute('d','M50 5 L95 95 M95 95 L' + pX + ' 95 Z');
			}
			else
			{
				const pX = 5 + 45 * (prog - 66.66) / 33.33;
				const pY = 95 - 90 * (prog - 66.66) / 33.33;
				elem.setAttribute('d','M50 5 L95 95 M95 95 L5 95 M5 95 L'
					+ pX + ' ' + pY + ' Z');
			}
		},1000/100);
	});

	const save = _ => {
	    var dashboardData = {
	      'color': cls('clr-fg')[0].style.color || '#fff',
	      'notes': id('notes').childNodes[0].value || '',
	      'goals': [],
	      'tasks': []
	    };

		for (var i = 0; i < 10; i++) {
			dashboardData.goals.push({
				'name': cls('goal')[i].value || '',
				'data': cls('percent')[i].value || ''
			});
		}
		for (var i = 0; i < 10; i++) {
			dashboardData.tasks.push({
				'name': cls('task-name')[i].value || '',
			  'time': cls('task-time')[i].value || ''
			});
		}

		localStorage.dashboardData = JSON.stringify(dashboardData);
	};

	const load = _ => {
	    if (localStorage.dashboardData === undefined)
	      return;

	    var data = JSON.parse(localStorage.dashboardData);

	    setColor(data.color);
			id('notes').childNodes[0].value = data.notes || '';

	    for(var i = 0; i < 10; i++) {
	      cls('goal')[i].value = data.goals[i].name || '';
	      cls('percent')[i].value = data.goals[i].data || '';
	    }
	    for(var i = 0; i < 10; i++) {
	      cls('task-name')[i].value = data.tasks[i].name || '';
	      cls('task-time')[i].value = data.tasks[i].time || '';
	    }
  };
  load();
  setInterval(_ => save(), 1000);

	const tasks = ['0','0','0','0','0','0','0','0','0','0'];

	[].forEach.call(cls('task-name'),
		elem => elem.onkeydown = ev =>
	{
		const idx = [].indexOf.call(cls('task-name'),elem);
		user.tasks[idx]['name'] = cls('task-name')[idx].value;
		firebase.firestore().collection('users').doc(user.email).set(user);
		if(ev.keyCode === 13) { ev.preventDefault(); }
	});

	[].forEach.call(cls('task-start'),
		elem => elem.onclick = () =>
	{
		const idx = [].indexOf.call(cls('task-start'),elem);
		if(typeof tasks[idx] !== 'string') { return; }
		tasks[idx] = setInterval(() =>
		{
      if (cls('task-time')[idx].value === "") {
        cls('task-time')[idx].value = "00:10:00";
      }
			const dt = cls('task-time')[idx].value.split(':').map(v => parseInt(v));
			let h = dt[0];
			let m = dt[1];
			let s = dt[2] - 1;
			firebase.firestore().collection('users').doc(user.email).set(user);
			if(s < 0) {
				m--;
				s = 59;
			}
			if(m < 0) {
				h--;
				m = 59;
			}
			if(h < 0) {
				clearInterval(tasks[idx]);
        cls('task-time')[idx].value = '';
        return;
			}
			h = parseLen(h);
			m = parseLen(m);
			s = parseLen(s);
			cls('task-time')[idx].value = h + ':' + m + ':' + s;
			user.tasks[idx]['progress'] = h + ':' + m + ':' + s;
		},1000);
	});

	[].forEach.call(cls('task-stop'),
		elem => elem.onclick = () =>
	{
		const idx = [].indexOf.call(cls('task-stop'),elem);
		clearInterval(tasks[idx]);
		tasks[idx] = '0';
	});

	let ctrl = false;
	let settingsOpen = false;
	window.onkeyup = function(e){if(e.keyCode === 17){ctrl = false;}};
	window.onkeydown = function(e){
		if(e.keyCode === 17){ctrl = true;}
		else if(e.keyCode === 188 && ctrl){
			id('dashboard').style.filter = settingsOpen ? 'none' : 'blur(5px)';
			id('settings').style.visibility = settingsOpen ? 'hidden' : 'visible';
			settingsOpen = !settingsOpen;
		}
	};

	[].forEach.call(cls('background'),function(c){
		c.onkeydown = function(e){
			if(e.keyCode === 13){
				user.backgroundColor = id('background-1').value;
				user.mainBoxColor = id('background-2').value;
				user.subBoxColor = id('background-3').value;
				firebase.firestore().collection('users').doc(user.email).set(user);
				tag('html')[0].style.setProperty('--bg-color-a',id('background-1').value);
				tag('html')[0].style.setProperty('--bg-color-b',id('background-2').value);
				tag('html')[0].style.setProperty('--bg-color-c',id('background-3').value);
				e.preventDefault();
			}
		}
	});

	id('notes').onkeydown = function() {
		user.notes = id('notes').value;
		firebase.firestore().collection('users').doc(user.email).set(user);
	}

	id('foreground').onkeydown = function(e){
		user.textColor = id('foreground').value;
		firebase.firestore().collection('users').doc(user.email).set(user);
		if(e.keyCode === 13){
				[].forEach.call(cls('clr-fg'),function(f){f.style.color = id('foreground').value;});
				[].forEach.call(cls('clr-bg'),function(f){f.style.backgroundColor = id('foreground').value;});
				e.preventDefault();
			}
	};

	id('firebasecreateaccount').onclick = function() {
		var email = id('email').value;
		var passw = id('passw').value;
		firebase.auth().createUserWithEmailAndPassword(email, passw).then(function() {
			var temp_user = {
				'username':'Username',
				'email':email,
				'goals':[
					{'name':'','progress':0},
					{'name':'','progress':0},
					{'name':'','progress':0},
					{'name':'','progress':0},
					{'name':'','progress':0},
					{'name':'','progress':0},
					{'name':'','progress':0},
					{'name':'','progress':0},
					{'name':'','progress':0},
					{'name':'','progress':0}
				],
				'imageName':'',
				'notes':'',
				'backgroundColor':'',
				'mainBoxColor':'',
				'subBoxColor':'',
				'textColor':'',
				'shadows':true,
				'tasks':[
					{'name':'','progress':''},
					{'name':'','progress':''},
					{'name':'','progress':''},
					{'name':'','progress':''},
					{'name':'','progress':''},
					{'name':'','progress':''},
					{'name':'','progress':''},
					{'name':'','progress':''},
					{'name':'','progress':''},
					{'name':'','progress':''}
				],
			};
			firebase.firestore().collection('users').doc(email).set(temp_user);
			user = temp_user;
			id('signin').style.visibility = 'hidden';
			id('dashboard').style.visibility = 'visible';
			[].forEach.call(id('dashboard').children,function(c){c.style.visibility = 'visible';});
		}).catch(function(error) {
			alert(error.message);
		});
	};

	id('firebasesignin').onclick = function() {
		var email = id('email').value;
		var passw = id('passw').value;
		firebase.auth().signInWithEmailAndPassword(email, passw).then(function() {
			firebase.firestore().collection('users').doc(email).get().then(function(response) {
				if(response.exists) {
					user = response.data();
					id('username').innerHTML = user.username;
					[].forEach.call(cls('goal'), function(goal) {
						const idx = [].indexOf.call(cls('goal'), goal);
						if(idx < user.goals.length) {
							goal.value = user.goals[idx].name;
						}
					});
					[].forEach.call(cls('percent'), function(percent) {
						const idx = [].indexOf.call(cls('percent'), percent);
						if(idx < user.goals.length) {
							percent.value = '' + user.goals[idx].progress;
							var elem = [...cls('prog-bar')][idx];
							if(user.goals[idx].progress <= 33.33)
							{
								const pX = 50 + 45 * user.goals[idx].progress / 33.33;
								const pY = 5 + 90 * user.goals[idx].progress / 33.33;
								elem.setAttribute('d','M50 5 L' + pX + ' ' + pY + ' Z');
							}
							else if(user.goals[idx].progress <= 66.66)
							{
								const pX = 95 - 90 * (user.goals[idx].progress - 33.33) / 33.33;
								elem.setAttribute('d','M50 5 L95 95 M95 95 L' + pX + ' 95 Z');
							}
							else
							{
								const pX = 5 + 45 * (user.goals[idx].progress - 66.66) / 33.33;
								const pY = 95 - 90 * (user.goals[idx].progress - 66.66) / 33.33;
								elem.setAttribute('d','M50 5 L95 95 M95 95 L5 95 M5 95 L'
									+ pX + ' ' + pY + ' Z');
							}
						}
					});
					id('notes').value = user.notes;
					id('background-1').value = user.backgroundColor;
					id('background-2').value = user.mainBoxColor;
					id('background-3').value = user.subBoxColor;
					tag('html')[0].style.setProperty('--bg-color-a',id('background-1').value);
					tag('html')[0].style.setProperty('--bg-color-b',id('background-2').value);
					tag('html')[0].style.setProperty('--bg-color-c',id('background-3').value);
					id('shadows').firstChild.data = user.shadows ? 'Off' : 'On';
					if(id('shadows').firstChild.data === 'Off'){
						[].forEach.call(cls('cell'),function(c){c.style.boxShadow = 'none';});
					}else{
						[].forEach.call(cls('cell'),function(c){c.style.boxShadow = '5px 5px rgba(0, 0, 0, 0.3)';});
					}
					[].forEach.call(cls('task-name'), function(taskName) {
						const idx = [].indexOf.call(cls('task-name'), taskName);
						if(idx < user.tasks.length) {
							taskName.value = user.tasks[idx].name;
						}
					});
					[].forEach.call(cls('task-time'), function(taskTime) {
						const idx = [].indexOf.call(cls('task-time'), taskTime);
						if(idx < user.tasks.length) {
							taskTime.value = user.tasks[idx].progress;
						}
					});
					firebase.storage().ref().child(user.imageName).getDownloadURL().then(function(url) {
						id('profile-image').src = url;
					});
				}
			});
			id('signin').style.visibility = 'hidden';
			id('dashboard').style.visibility = 'visible';
			[].forEach.call(id('dashboard').children,function(c){c.style.visibility = 'visible';});
		}).catch(function(error) {
			alert(error.message);
		});
	};

	/*
	id('signingoogle').onclick = function(){
		id('signin').style.visibility = 'hidden';
		id('dashboard').style.visibility = 'visible';
		[].forEach.call(id('dashboard').children,function(c){c.style.visibility = 'visible';});
	};
	*/

	id('shadows').onclick = function(){
		user.shadows = !user.shadows;
		firebase.firestore().collection('users').doc(user.email).set(user);
		id('shadows').firstChild.data = id('shadows').firstChild.data === 'On' ? 'Off' : 'On';
		if(id('shadows').firstChild.data === 'Off'){
			[].forEach.call(cls('cell'),function(c){c.style.boxShadow = 'none';});
		}else{
			[].forEach.call(cls('cell'),function(c){c.style.boxShadow = '5px 5px rgba(0, 0, 0, 0.3)';});
		}
	};

	id('username').onclick = function() {
		id('username').contentEditable = true;
	};

	id('username').onkeydown = function(ev) {
		if(ev.keyCode === 13) {
			ev.preventDefault();
			user.username = id('username').innerHTML;
			console.log(user);
			firebase.firestore().collection('users').doc(user.email).set(user);
			id('username').contentEditable = false;
		}
	};

	id('user-settings').onclick = function() {
		id('dashboard').style.filter = settingsOpen ? 'none' : 'blur(5px)';
		id('settings').style.visibility = settingsOpen ? 'hidden' : 'visible';
		settingsOpen = !settingsOpen;
	};

	id('user-logout').onclick = function() {
		user = {};
		id('email').value = '';
		id('passw').value = '';
		firebase.auth().signOut();
		id('signin').style.visibility = 'visible';
		id('dashboard').style.visibility = 'hidden';
		[].forEach.call(id('dashboard').children,function(c){c.style.visibility = 'hidden';});
	};

	id('profile-upload').onchange = function(ev) {
		var reader = new FileReader();
		reader.onload = function(e) {
			id('profile-image').src = e.target.result;
		};
		reader.readAsDataURL(ev.target.files[0]);
		firebase.firestore().collection('num_images').doc('num_images').get().then(function(response) {
			if(response.exists) {
				var num_images = response.data();
				user.imageName = 'images/' + num_images.num_images.toString() + '.png';
				firebase.storage().ref().child(user.imageName).put(ev.target.files[0]);
				firebase.firestore().collection('users').doc(user.email).set(user);
				num_images.num_images++;
				firebase.firestore().collection('num_images').doc('num_images').set(num_images);
			}
		});
	}

	id('profile-image').onclick = function() {
		id('profile-upload').click();
	};
};
