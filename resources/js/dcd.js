// Creates a CORS request in a cross-browser manner
function createCORSRequest(method, url) {
    var apiKey = '5668a0a6945a3199ababf3e17fe4cea817fb6d44520379d6a9515b5eb24d74ce';
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari/IE10+.
        xhr.open(method, url, true);
        xhr.setRequestHeader('Teamup-Token', apiKey);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE8/IE9.
        xhr = new XDomainRequest();
        // XDomainRequest does not support querying HTTPS from HTTP pages
        if (window.location.protocol === 'http:') {
            url = url.replace('https://', 'http://');
        }
        if (-1 === ['GET', 'POST'].indexOf(method)) {
            alert('XDomainRequest only supports GET and POST methods');
            return;
        }
        if (-1 === url.indexOf('?')) {
            url += '?_teamup_token=' + apiKey;
        } else {
            url += '&_teamup_token=' + apiKey;
        }
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }
    return xhr;
}

// Sends the actual CORS request.
function makeCorsRequest(url, successCallback, errorCallback) {
    var xhr = createCORSRequest('GET', url);
    if (!xhr) {
        alert('CORS not supported');
        return;
    }

    // Response handlers.
    xhr.onload = function (xhr) {
        if (xhr.target.status < 400) {
            if (successCallback) successCallback(xhr.target);
        } else if (errorCallback) {
            errorCallback(xhr.target);
        }
    };
    xhr.onerror = function (xhr) {
        if (errorCallback) {
            errorCallback(xhr.target);
        }
    };

    xhr.send();
}

function generateDCD(data, body) {
	var results = "";
	body.find('ul.fetch, div.fetch').each(function() {
		if ($(this).hasClass("toc")) {
			var self = this;
			$.each(data, function (item, value) {
				if (item == "events") {
					$.each(value, function (i, object) {
						var calendar = "c" + object["subcalendar_id"];
						if ($(self).hasClass(calendar)) {
							$(self).append("<li class='toc-event e" + object["id"] +"'>" + object["title"] + "</li>")
						}
					}); 
				}
			});
		} else if ($(this).hasClass("info")) {
			var self = this;
			$.each(data, function (item, value) {
				if (item == "events") {
					$.each(value, function (i, object) {
						var calendar = "c" + object["subcalendar_id"];
						if ($(self).hasClass(calendar)) {
							var ev = "";
							var cal = 0;
							var startDate = "";
							var endDate = "";
							var id = "";
							$.each(object, function (subI, subObject) { // TODO: Recode to just use object["subI"] instead of loop
								if (subI == "subcalendar_id") {
									cal = subObject;
								} else if (subI == "id") {
									id = subObject;
								} else if (subI == "title") {
									ev = "<span class='c"+cal+" info-event-title'>" + subObject + '</span><br>' + ev;
								} else if (subI == "start_dt") {
									startDate = subObject.substring(0,19);	
								} else if (subI == "end_dt") {
									endDate = subObject.substring(0,19);
								} else if (subI == "all_day") {
									//alert(subObject + " " + startDate);
									if (startDate.length > 0) {
										var allday = (subObject) ? "" : ", h:sstt";
										var date = Date.parse(startDate).toString("dddd, MMMM d" + allday);
										//alert(startDate.substring(0, 10));
										if (startDate.substring(0, 10) == endDate.substring(0, 10)) { // if end date (mm/dd/yy) is same
											if (!subObject) { // If not all day
												date = date + "-" + (Date.parse(endDate).toString("h:sstt")) || "<b>Invalid date</b>"; // Add end-time
											}
										} else { // Otherwise
											date = date + "-" + (Date.parse(endDate).toString("dddd, MMMM d" + allday)) || "<b>Invalid date</b>"; // Add end date/time
										}
										ev = ev + date;
									}
								} else if (subI == "location" && subObject.length > 0) {
									ev = ev + ", " + subObject;
								} else if (subI == "notes") {
									ev = "<span class='info-event-desc'>" + ev + "</span><br><span class='info-event-notes'>" + subObject.replace(/(<p[^>]+?>|<p>|<\/p>)/img, "").replace(/\n/g, "<br>") + "</span>";
								}
							});
							$(self).append("<span class='info-event e"+id+"'>"+ev+"</span><br><br>");
						}
					});
				}
			});		
		} else if ($(this).hasClass("output")) {
			$(this).html(generateDCD(data));
		}
	});
	return results;
}

function generateDCD2(data) { // Dump ALL the events! -- Old version
	var results = '';
	$.each(data, function (item, value) {
		if (item == "events") {
			$.each(value, function (i, object) {
				var ev = "";
				var cal = 0;
				var startDate = "";
				var endDate = "";
				var id = "";
				$.each(object, function (subI, subObject) {
					if (subI == "subcalendar_id") {
						cal = subObject;
					} else if (subI == "id") {
						id = subObject;
					} else if (subI == "title") {
						// temporary test
						ev = "<span class='c"+cal+"'>" + subObject + '</span><br>' + ev;
					} else if (subI == "start_dt") {
						startDate = subObject.substring(0,19);	
					} else if (subI == "end_dt") {
						endDate = subObject.substring(0,19);
					} else if (subI == "all_day") {
						//alert(subObject + " " + startDate);
						if (startDate.length > 0) {
							var allday = (subObject) ? "" : ", h:sstt";
							var date = Date.parse(startDate).toString("dddd, MMMM d" + allday);
							//alert(startDate.substring(0, 10));
							if (startDate.substring(0, 10) == endDate.substring(0, 10)) { // if end date (mm/dd/yy) is same
								if (!subObject) { // If not all day
									date = date + "-" + (Date.parse(endDate).toString("h:sstt")) || "<b>Invalid date</b>"; // Add end-time
								}
							} else { // Otherwise
								date = date + "-" + (Date.parse(endDate).toString("dddd, MMMM d" + allday)) || "<b>Invalid date</b>"; // Add end date/time
							}
							ev = ev + date;
						}
					} else if (subI == "location" && subObject.length > 0) {
						ev = ev + ", " + subObject;
					} else if (subI == "notes") {
						ev = ev + "<br>" + subObject.replace(/(<p[^>]+?>|<p>|<\/p>)/img, "").replace(/\n/g, "<br>");
					}
					console.log(subI + "=" + subObject);
				});
				results = results + ev + "<br><br>";
			});
		}
	});
	return results;
}

$(function() {
	$("#copy").button().button("disable");
	$("#dcd-start").datepicker({
	  defaultDate: "+1w",
	  changeMonth: true,
	  dateFormat: "yy-mm-dd",
	  numberOfMonths: 2,
	  onClose: function( selectedDate ) {
			$("#dcd-end").datepicker( "option", "minDate", selectedDate );
	  }
	});
	$("#dcd-end").datepicker({
	  defaultDate: "+1w",
	  changeMonth: true,
	  dateFormat: "yy-mm-dd",
	  numberOfMonths: 2,
	  onClose: function( selectedDate ) {
		$("#dcd-start").datepicker( "option", "maxDate", selectedDate );
	  }
	});
	var nextMonday = Date.parse("2016-04-11").toString("yyyy-MM-dd");
	var sundayAfter = Date.parse("2016-04-17").toString("yyyy-MM-dd");
	//var nextMonday =  Date.today().next().monday().toString("yyyy-MM-dd");
	//var sundayAfter = Date.today().next().monday().add(6).day().toString("yyyy-MM-dd");
	$("#dcd-start").attr('value', nextMonday);
	$("#dcd-end").attr('value', sundayAfter);

	var startDate = $("#dcd-start").attr('value');
	var endDate = $("#dcd-end").attr('value');
	$("#submit").button().click(function() {
		$("#submit").button("disable");
		$("#copy").button("enable");
		var startDate = $("#dcd-start").prop('value');
		var endDate = $("#dcd-end").prop('value');
		var template = $("#template option:selected").attr('id');
		makeCorsRequest(
			'https://api.teamup.com/kse89a84dcb543ed5e/events?startDate='+startDate+'&endDate='+endDate,
			function(xhr) {
				var data = JSON.parse(xhr.responseText);
				$('#data').show();
				$('iframe#output').attr('src', 'resources/templates/' +template+'.html');
				$('iframe#output').load(function() {
					generateDCD(data, $("iframe#output").contents().find("#content"), template);
					var jQueryUICSS = "<link rel='stylesheet' href='../../lib/jquery/jquery-ui.min.css'>";
					var eventsCSS = "<link rel='stylesheet' href='events.css'>";
					$("iframe#output").contents().find("head").append(jQueryUICSS + eventsCSS);
					$("iframe#output").contents().find("ul.toc").sortable({ 
						connectWith: ".toc", 
						placeholder: "ui-state-highlight", 
						stop: function(event, ui) {
							numberEvents();
							console.log(event);
						}
					}).disableSelection();
					numberEvents();
					
					var $sortIcon = $("<span class='event-drag ui-icon ui-icon-arrowthick-2-n-s'></span>");
					$("iframe#output").contents().find(".toc-event").hover(function() {
						$(this).prepend($sortIcon);
					}, function() {
						$sortIcon.remove();
					});
					
					var $addEvent = $("<div class='event-add'><a class='event-add-link'><span class='ui-icon ui-icon-plusthick'></span> Add event<br></a></div>");
					$("iframe#output").contents().find("ul.toc").hover(function() {
						$(this).after($addEvent);
					}, function() {
						$sortIcon.remove();
					});
					
					$("iframe#output").contents().find("a.event-add-link").click(function() {
						console.log("test");
					});
				});
			},
			function(xhr) {
				var data = JSON.parse(xhr.responseText);
				$('#data').show();
				$('iframe#output').html('Request failed with code '+ xhr.status +': ' + JSON.stringify(data));
			}
		);
	});
	$("#copy").button().click(function() {
		var iframe = $('iframe#output')[0];
		$('iframe#output').contents().find(".event-drag, .event-add").remove(); // Get rid of sort and add event buttons
		iframe.contentWindow.focus();
		iframe.contentDocument.execCommand('selectAll');
		iframe.contentDocument.execCommand('copy');
		alert("DCD copied to clipboard!\n\nIf that didn't work, use Ctrl+C or Command+C after pressing this button!")
	});
	function numberEvents() {
		var count = 1;
		$("iframe#output").contents().find("ul.count, div.count").each(function() {
			if ($(this).hasClass("count-reset")) count = 1;
			$(this).find("li.toc-event, span.info-event-title").each(function() {
				var i = 0;
				$(this).find("span.counter").remove();
				$(this).prepend("<span class='counter'>"+ count + ".&nbsp;</span>"); // first time numbering
				count++;
			});
		});
	}
});
