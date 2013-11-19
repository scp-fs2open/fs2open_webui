function instanciateTemplate(selector) {
	var clone = selector.clone();

	clone.find('[template-data]').each(function() {
		var templateName = $(this).attr('template-data');
		var classes = $(this).attr('class');

		var childTemplate = instanciateTemplate($('#'+templateName));
		childTemplate.addClass(classes);
		$(this).replaceWith(childTemplate);
	});

	return clone;
}

// Global singeltons
var webui = new function() {
	this.events = new function() {
		this.subscribe = function(event, fn) {
			$(this).bind(event, fn);
		};
		this.publish = function(event) {
			$(this).trigger(event);
		};
	}();

	this.auth = new function() {
		var basicAuthData;

		this.ajax = function(settings) {
			jQuery.extend(settings, {
				beforeSend : function(req) {
					req.setRequestHeader('Authorization', 'Basic ' + basicAuthData);
				}
			});
			return settings;
		};

		this.do = function(username, password) {
			basicAuthData = base64.encode(username+':'+password);

			$.ajax(this.ajax({
				url: 'api/1/auth',
				type: 'GET',
				success: function(data){
					webui.events.publish('login');
				},
				error: function() {
					webui.events.publish('logout');
				}
			}));
		};
	}();
}();

function Poller(auth) {
	var pollTargets = [];
	var runningRequests = 0;

	function poll() {
		if(runningRequests > 0) {
			return;
		}

		var enabledTargets = [];
		for (var i = 0; i < pollTargets.length; i++) {
			if(pollTargets[i].pollEnabled) {
				enabledTargets.push(pollTargets[i]);
			}
		}

		runningRequests = enabledTargets.length;

		jQuery.each(enabledTargets, function (index, pollTarget) {
			(function () {
				$.ajax(auth.ajax({
					url: pollTarget.url,
					data: {after: pollTarget.nextTimestamp},
					type: 'GET',
					cache: false,
					success: function(data){
						console.log(pollTarget.url, data);
						if(data.length > 0) {
							pollTarget.nextTimestamp = data[data.length - 1].timestamp + 1;

							for (var u = 0; u < data.length; u++) {
								pollTarget.callback(data[u]);
							}
						}
					},
					error: function() {
						//pollErrorCount ++;
					},
					complete: function() {
						runningRequests --;
						if(runningRequests === 0) {
							setTimeout(poll, 2000);
						}
					}
				}));
			}());
		});
	}

	this.addAppend = function(url, callback) {
		if(callback === undefined || typeof callback !== 'function') {
			//error
		}

		pollTargets.push({url: url, callback: callback, nextTimestamp: 0, pollEnabled: false});
	};

	this.start = function(url) {
		for (var i = 0; i < pollTargets.length; i++) {
			var pollTarget = pollTargets[i];
			if(pollTarget.url == url) {
				pollTarget.pollEnabled = true;
			}
		}
		poll();
	};

	this.stopAll = function() {
		for (var i = 0; i < pollTargets.length; i++) {
			pollTargets[i].pollEnabled = false;
		}
	};
}

function EntityEditor(auth, selector, url) {

	var entity;

	var attributesParent = selector.find('.entityAttributes');

	// Autocreate missing input fields
	attributesParent.children('label').each(function () {
		var forValue = $(this).attr('for');

		if(!$(this).next().is('input')) {
			$('<input type="text" name="'+forValue+'"/><br/>').insertAfter(this);
		}
	});

	function updateUi() {
		for (var key in entity) {
			if (entity.hasOwnProperty(key)) {
				var value = entity[key];
				attributesParent.find('input[name='+key+']').val(value);
			}
		}
	}

	function readUi() {
		attributesParent.children('input').each(function () {
			var name = $(this).attr('name');
			var value = $(this).val();

			entity[name] = value;
		});
	}

	function get() {
		$.ajax(auth.ajax({
			url: url,
			type: 'GET',
			cache: false,
			success: function(result) {
				entity = result;

				updateUi();
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				//$("#serverProperties").append(XMLHttpRequest.responseText + ' '+ textStatus + ' '+ errorThrown);
			}
		}));
	}

	function put() {
		readUi();

		$.ajax(auth.ajax({
			url: url,
			type: 'PUT',
			data: JSON.stringify(entity),
			success: function(result) {
			}
		}));
	}

	function del() {
		$.ajax(auth.ajax({
			url: url,
			type: 'DELETE',
			success: function(result) {
				//alert(result);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {

			}
		}));
	}

	selector.find('.entityCommon input[name=get]').click(function(e){get(); return e.preventDefault();});
	selector.find('.entityCommon input[name=put]').click(function(e){put(); return e.preventDefault();});
	selector.find('.entityCommon input[name=delete]').click(function(e){
		var confirmationMessage = $(this).attr('confirm-data');

		if(!confirmationMessage || confirm(confirmationMessage)) {
			del();
		}

		return e.preventDefault();
	});

	this.updateView = function() {
		get();
	};
}
