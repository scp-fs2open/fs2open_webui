$(document).ready(function(){
	var poller = new Poller(webui.auth);

	var tabsCode = new function() {
		this.tabLogin = new TabLogin(webui.auth, poller);
		this.tabServer = new TabServer(webui.auth);
		this.tabMission = new TabMission(webui.auth);
		this.tabChat = new TabChat(webui.auth, poller);
		this.tabDebug = new TabDebug(poller);
	}();

	var tabContainer = $('#tabContainer').tabs({
		activate: function(event, ui) {
			var oldPanelId = ui.oldPanel.attr('id');
			var newPanelId = ui.newPanel.attr('id');

			$.each(tabsCode, function(index, value) {
				if(index == oldPanelId) {
					value.stop();
				}
			});

			$.each(tabsCode, function(index, value) {
				if(index == newPanelId) {
					value.start();
				}
			});
		}
	});

	$('#tabContainer').tabs('option', 'disabled', [1, 2, 3, 4, 5]);
	webui.events.subscribe('login', function() {
		$('#tabContainer').tabs('enable');
	});

	// close icon: removing the tab on click
	$('#tabContainer span.ui-icon-close').live('click', function() {
		var panelId = $(this).closest('li').remove().attr('aria-controls');
		$('#' + panelId).remove();
		tabContainer.tabs('refresh');
	});
});
