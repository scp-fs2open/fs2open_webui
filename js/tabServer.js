function kickPlayer(playerId) {
	$.ajax(webui.auth.ajax({
		url: '/api/1/player/' + playerId,
		type: 'DELETE',
		success: function(result) {
			alert('Kicked: ' + playerId);
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			alert('Kick failed');
		}
	}));
}

function showPlayerPanel(playerId) {
	var playerTab = $('<li><a href="#tabPlayer'+playerId+'">Player '+playerId+'</a><span class="ui-icon ui-icon-close">Close</span></li>');

	var content = instanciateTemplate($('#PlayerPanel'));
	content.attr('id', 'tabPlayer' + playerId);

	var tabs = $('#tabContainer');
	tabs.find('.ui-tabs-nav').append(playerTab);
	tabs.append(content);
	tabs.tabs('refresh');

	var statsAlltime = new EntityEditor(webui.auth, content.find('form').eq(0), 'api/1/player/'+playerId+'/score/alltime');
	var statsMission = new EntityEditor(webui.auth, content.find('form').eq(1), 'api/1/player/'+playerId+'/score/mission');

	statsAlltime.updateView();
	statsMission.updateView();
}

function TabServer(auth) {

	var serverEntityEditor = new EntityEditor(auth, $('#serverEntityForm'), 'api/1/server');

	var netgameInfoEE = new EntityEditor(auth, $('#netgameInfoForm'), 'api/1/netgameInfo');

	// ====================================================
	var playerTable = $('#clientsTable').dataTable({
		"bJQueryUI": true,
		"bFilter": false,
		"bPaginate": false,
		"bLengthChange": false,
		"aoColumns": [
			{ "mData": "id",},
			{ "mData": "address" },
			{ "mData": "ping" },
			{ "mData": "host" },
			{ "mData": "observer" },
			{ "mData": "callsign" },
			{ "mData": "ship" },
			{
				"bSortable": false,
				"mData": function (data) {
					return '<input type="button" value="Kick" onclick="kickPlayer('+data.id+')"/>';
				}
			},
			{
				"bSortable": false,
				"mData": function (data) {
					return '<input type="button" value="Details" onclick="showPlayerPanel('+data.id+')"/>';
				}
			}
		]
	});

	var pollTableActive = false;
	function pollTable() {
		$.ajax(auth.ajax({
			url: '/api/1/player',
			type: 'GET',
			cache: false,
			success: function(data){
				playerTable.fnClearTable();
				for (var u = 0; u < data.length; u++) {
					playerTable.fnAddData(data[u]);
				}
			},
			error: function() {
			},
			complete: function() {
				if(pollTableActive) {
					setTimeout(pollTable, 2000);
				}
			}
		}));
	}

	this.start = function() {
		serverEntityEditor.updateView();

		pollTableActive = true;
		pollTable();
	};

	this.stop = function() {
		pollTableActive = false;
	};
}
