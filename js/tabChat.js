function TabChat(auth, poller) {
	poller.addAppend('/api/1/chat', function(data){
		var existingText = $('#chatLog').val();
		$('#chatLog').val(existingText + '\n' + data.source + ' : ' + data.message);
	});

	$('#chatNewMessage').submit(function(e) {
		$.ajax(auth.ajax({
			url: '/api/1/chat',
			type: 'POST',
			data: JSON.stringify({message: $('#chatNewMessageText').val() }),
			success: function(result) {
				$('#chatNewMessageText').val('');
			}
		}));

		return e.preventDefault();
	});

	this.start = function() {
		poller.start('/api/1/chat');
	};

	this.stop = function() {
		poller.stopAll();
	};
}
