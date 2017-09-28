window.onload = () =>
{
	function id(i){return document.getElementById(i);}
	function cls(c){return document.getElementsByClassName(c);}
	function tag(t){return document.getElementsByTagName(t);}

	function parseLen(text)
	{
		return (-1 < text && text < 10) ? '0' + text : text;
	}

	const months =
	[
		'Jan','Feb','Mar','Apr',
		'May','Jun','Jul','Aug',
		'Sep','Oct','Nov','Dec'
	];

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
		elem.value = Math.min(parseInt(elem.value) + 1,360);
	});

	[].forEach.call(cls('sub'),
		e => e.onclick = () =>
	{
		const elem = cls('percent')[[].indexOf.call(cls('sub'),e)];
		elem.value = Math.max(parseInt(elem.value) - 1,0);
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
			let disp = cls('percent')
			[[].indexOf.call
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

	id('save').onclick = () =>
	{
		const data =
		{
			'color':cls('clr-fg')[0].style.color || '#fff',
			'note1':id('note1').childNodes[0].value || '',
			'note2':id('note2').childNodes[0].value || '',
			'goal0':
			{
				'name':cls('goal')[0].value || '',
				'data':cls('percent')[0].value || ''
			},
			'goal1':
			{
				'name':cls('goal')[1].value || '',
				'data':cls('percent')[1].value || ''
			},
			'goal2':
			{
				'name':cls('goal')[2].value || '',
				'data':cls('percent')[2].value || ''
			},
			'goal3':
			{
				'name':cls('goal')[3].value || '',
				'data':cls('percent')[3].value || ''
			},
			'goal4':
			{
				'name':cls('goal')[4].value || '',
				'data':cls('percent')[4].value || ''
			},
			'goal5':
			{
				'name':cls('goal')[5].value || '',
				'data':cls('percent')[5].value || ''
			},
			'goal6':
			{
				'name':cls('goal')[6].value || '',
				'data':cls('percent')[6].value || ''
			},
			'goal7':
			{
				'name':cls('goal')[7].value || '',
				'data':cls('percent')[7].value || ''
			},
			'goal8':
			{
				'name':cls('goal')[8].value || '',
				'data':cls('percent')[8].value || ''
			},
			'goal9':
			{
				'name':cls('goal')[9].value || '',
				'data':cls('percent')[9].value || ''
			},
			'task0':
			{
				'name':cls('task-name')[0].value || '',
				'time':cls('task-time')[0].value || ''
			},
			'task1':
			{
				'name':cls('task-name')[1].value || '',
				'time':cls('task-time')[1].value || ''
			},
			'task2':
			{
				'name':cls('task-name')[2].value || '',
				'time':cls('task-time')[2].value || ''
			},
			'task3':
			{
				'name':cls('task-name')[3].value || '',
				'time':cls('task-time')[3].value || ''
			},
			'task4':
			{
				'name':cls('task-name')[4].value || '',
				'time':cls('task-time')[4].value || ''
			},
			'task5':
			{
				'name':cls('task-name')[5].value || '',
				'time':cls('task-time')[5].value || ''
			},
			'task6':
			{
				'name':cls('task-name')[6].value || '',
				'time':cls('task-time')[6].value || ''
			},
			'task7':
			{
				'name':cls('task-name')[7].value || '',
				'time':cls('task-time')[7].value || ''
			},
			'task8':
			{
				'name':cls('task-name')[8].value || '',
				'time':cls('task-time')[8].value || ''
			},
			'task9':
			{
				'name':cls('task-name')[9].value || '',
				'time':cls('task-time')[9].value || ''
			},
		};
		const text = JSON.stringify(data);
		const dl = document.createElement('a');
		dl.setAttribute('href','data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		dl.setAttribute('download','abhi.dashB');
		dl.style.display = 'none';
		document.body.appendChild(dl);
		dl.click();
		document.body.removeChild(dl);
	};

	id('fileid').onchange = () =>
	{
		const fl = id('fileid').files[0];
		const reader = new FileReader();
		reader.onload = (e) =>
		{
			const data = JSON.parse(e.target.result);
			setColor(data.color);
			id('note1').childNodes[0].value = data.note1 || '';
			id('note2').childNodes[0].value = data.note2 || '';
			for(let i=0;i<10;i++)
			{
				cls('goal')[i].value = data['goal' + i].name || '';
				cls('percent')[i].value = data['goal' + i].data || '';
				cls('task-name')[i].value = data['task' + i].name || '';
				cls('task-time')[i].value = data['task' + i].time || '';
			}
		};
		reader.readAsText(fl);
	};

	id('load').onclick = () => {id('fileid').click();};

	const tasks = [0,0,0,0,0,0,0,0,0,0];

	[].forEach.call(cls('task-start'),
		elem => elem.onclick = () =>
	{
		const idx = [].indexOf.call(cls('task-start'),elem);
		let i = 0;
		tasks[idx] = setInterval(() =>
		{
			i++;
			const dt = cls('task-time')[idx].value.split(':').map(v => parseInt(v));
			let h = (i % 3600 === 0) ? dt[0] - 1 : dt[0];
			let m = (i % 60   === 0) ? dt[1] - 1 : dt[1];
			let s = dt[2] - 1;
			if(s === -1)
			{
				m--;
				s = 59;
			}
			if(m === -1)
			{
				h--;
				m = 59;
			}
			if(h === -1)
			{
				clearInterval(tasks[idx]);
			}
			h = parseLen(h);
			m = parseLen(m);
			s = parseLen(s);
			cls('task-time')[idx].value = h + ':' + m + ':' + s;
		},1000);
	});

	[].forEach.call(cls('task-stop'),
		elem => elem.onclick = () =>
	{
		const idx = [].indexOf.call(cls('task-stop'),elem);
		clearInterval(tasks[idx]);
	});
};
