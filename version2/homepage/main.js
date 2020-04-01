window.onload = function() {
	var pages = ['pages/about/index.html','pages/calendar/index.html','pages/ourteam/index.html','pages/contact/index.html'];
	var idx = 0;
	
	[...document.getElementsByTagName('a')][0].classList.add('selected');
	document.getElementById('content').src = pages[0];

	[...document.getElementsByTagName('a')].forEach(function(v) {
		v.page = pages[idx++];
		v.onclick = function() {
			[...document.getElementsByClassName('selected')].forEach(function(e) {
				e.classList.remove('selected');
			});
			this.classList.add('selected');
			document.getElementById('content').src = this.page;
		}
	});
};
