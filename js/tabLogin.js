function TabLogin(auth, poller) {
	$('#loginForm').submit(function(e) {
		e.preventDefault();

		var username = $('#loginUsername').attr('value');
		var password = $('#loginPassword').attr('value');

		auth.do(username, password);
	});

	this.start = function() {
	};

	this.stop = function() {
	};
}
