function TabDebug(poller) {
	poller.addAppend('/api/1/debug', function(data){
		var existingText = $('#debugLog').val();
		$('#debugLog').val(existingText + '\n' + data.message);
	});

	this.start = function() {
		poller.start('/api/1/debug');
	};

	this.stop = function() {
		poller.stopAll();
	};
}
