function TabMission(auth, poller) {
	var selector = $('#tabMission');

	var foo2 = new EntityEditor(auth, selector.children().eq(0), 'api/1/mission');

	var goalsTable = $('#missionGoalsTable').dataTable({
		"bJQueryUI": true,
		"bFilter": false,
		"bPaginate": false,
		"bLengthChange": false,
		"aoColumns": [
			{ "mData": "name",},
			{ "mData": "team" },
			{ "mData": "status" },
			{ "mData": "type" },
			{ "mData": "message" },
		]
	});

	var pollGoalsTableActive = false;
	function pollGoalsTable() {
		$.ajax(auth.ajax({
			url: '/api/1/mission/goals',
			type: 'GET',
			cache: false,
			success: function(data){
				goalsTable.fnClearTable();
				for (var u = 0; u < data.length; u++) {
					goalsTable.fnAddData(data[u]);
				}
			},
			error: function() {
			},
			complete: function() {
				if(pollGoalsTableActive) {
					setTimeout(pollGoalsTable, 1000);
				}
			}
		}));
	}

	this.start = function() {
		pollGoalsTableActive = true;
		pollGoalsTable();
	};

	this.stop = function() {
		pollGoalsTableActive = false;
	};
}
