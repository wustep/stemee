// Creates a CORS request in a cross-browser manner (from teamup API website)
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

// Sends the actual CORS request, (from teamup API website)
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

function generateDCD(data) { // Get events from teamup calendar and add them to the iframe
	$.each(data, function (item, value) {
		if (item == "events") {
			$.each(value, function (i, object) {
				// Get title, id, cal info
				var cal = "cal-" + object["subcalendar_id"];
				var id = object["id"];
				var title = object["title"];
				// Make event info line
				var info = "";
				var location = object["location"];
				var startDate = object["start_dt"].substring(0,19);
				var endDate = object["end_dt"].substring(0,19);
				if (startDate.length > 0) {
					var allday = object["all_day"] ? "" : ", h:sstt";
					var date = Date.parse(startDate).toString("dddd, MMMM d" + allday);
					if (startDate.substring(0, 10) == endDate.substring(0, 10)) { // If end date (mm/dd/yy) is same
						if (!object["all_day"]) { // If not all day
							date = date + "-" + (Date.parse(endDate).toString("h:sstt")) || "<b>Invalid date</b>"; // Add end-time
						}
					} else { // If end date is different, display whole end date
						date = date + "-" + (Date.parse(endDate).toString("dddd, MMMM d" + allday)) || "<b>Invalid date</b>"; // Add end date/time
					}
					info = date.replace(/(AM)/g, "am").replace(/(PM)/g, "pm").replace(/(:00)/g,"") + ((location.length > 0) ? ", " + location : "");
				}
				// Get notes and add event
				var notes = object["notes"];
				addEvent(cal, id, title, info, notes);
			});
		}
	});
}

function numberEvents() { // (Re)number events based on .count and .count-reset classes in <div>s and <ul>s
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

function getNewEventId() { // Get an unused event ID
	var id = 1;
	while ($("iframe#output").contents().find("li.event-"+id+", span.event-"+id).length > 0) {
		id++;
	}
	return id;
}

function addEvent(set, eventId, eventName, eventInfo, eventNotes) { // Populate <ul>s and <div>s with corresponding <li>s and <span>s according to the right sets of events
	$("iframe#output").contents().find("ul." + set).first().append("<li class='toc-event event-"+eventId+" ui-sortable-handle'>"+eventName+"</li>");
	var info = (!$("iframe#output").contents().find("div." + set).hasClass("no-info") && eventInfo.length > 0) ? "<br>" + eventInfo : ""; // If div has no-info class, then don't add location and date
	var notes = (eventNotes && eventNotes.length > 0) ? "<br><span class='info-event-notes'>"+eventNotes+"</span>" : "";
	$("iframe#output").contents().find("div." + set).first().append("<span id='event-"+eventId+"' class='info-event event-"+eventId+"'><br><span class='info-event-desc'><span class='info-event-title "+set+"'>"+eventName+"</span>"+info+'</span>'+notes+"<br></span>");
	numberEvents();
}

$(function() {
	$("#dcd-start").datepicker({ // Set up #date-start input element
	  defaultDate: "+1w",
	  changeMonth: true,
	  dateFormat: "yy-mm-dd",
	  numberOfMonths: 2,
	  onClose: function( selectedDate ) {
			$("#dcd-end").datepicker( "option", "minDate", selectedDate );
	  }
	});
	$("#dcd-end").datepicker({ // Set up #date-end input element
	  defaultDate: "+1w",
	  changeMonth: true,
	  dateFormat: "yy-mm-dd",
	  numberOfMonths: 2,
	  onClose: function( selectedDate ) {
		$("#dcd-start").datepicker( "option", "maxDate", selectedDate );
	  }
	});
	
	// Set pre-established week 4-11 to 4-17 for now until next year
	// var nextMonday = Date.parse("2016-04-11").toString("yyyy-MM-dd");
	// var sundayAfter = Date.parse("2016-04-17").toString("yyyy-MM-dd");
	/* Populate inputs with next week Mon--Sun */
	var nextMonday =  Date.today().toString("yyyy-MM-dd");
	var sundayAfter = Date.today().add(7).day().toString("yyyy-MM-dd");
	$("#dcd-start").attr('value', nextMonday);
	$("#dcd-end").attr('value', sundayAfter);

	// Set up buttons
	$("#copy").button().button("disable");
	$("#reset").button().button("disable");
	$("#submit").button().click(function() {
		$("#submit").button("disable");
		$("#copy").button("enable");
		$("#reset").button("enable");
		$("#dcd-start").datepicker("option", "disabled", "true");
		$("#dcd-end").datepicker("option", "disabled", "true");
		
		var startDate = $("#dcd-start").prop('value');
		var endDate = $("#dcd-end").prop('value');
		makeCorsRequest('https://api.teamup.com/ksbde4a1fb106e963c/events?startDate='+startDate+'&endDate='+endDate,
			function(xhr) { // Success on making API request
				var data = JSON.parse(xhr.responseText);
				$('#data').show();
				$('iframe#output').attr('src', 'resources/templates/stemee.html');
				$('iframe#output').load(function() {
					var iframe = $(this).contents();
					
					generateDCD(data); // Generate DCD
					
					// Add jQueryUI, Event CSS (for icons and sortables)
					var jQueryUICSS = "<link rel='stylesheet' href='../../lib/jquery/jquery-ui.min.css'>";
					var eventsCSS = "<link rel='stylesheet' href='events.css'>";
					iframe.find("head").append(jQueryUICSS + eventsCSS);
					
					// Add sort and delete icons on hover
					var $sortIcon = $("<span id='event-drag' class='ui-icon ui-icon-arrowthick-2-n-s'></span>");
					var $deleteIcon = $("<span id='event-delete' class='ui-icon ui-icon-closethick'></span>")
					iframe.find(".toc").on("mouseenter", "li.toc-event", function() {
						$(this).prepend($sortIcon);
						$(this).append($deleteIcon);
						var self = $(this);
						$deleteIcon.click(function() { // Make delete icon open delete dialog with name and id transfered to form
							var eventId = self.attr("class").match(/event\-\w{1,}/)[0];
							var node = self.contents().filter(function() { return this.nodeType == 3 })[0]; // Get text of element as node
							var eventName = (node && node.length > 0) ? node.nodeValue : ""; // Get node value and deal with null case
							$('span#event-delete-name').html(eventName.length > 0 ? " " + eventName : "");
							$('span#event-delete-id').html(eventId);
							eventDelete.dialog("open");
						});
					});
					iframe.find(".toc").on("mouseleave", "li.toc-event", function() { 
						$sortIcon.remove();
						$deleteIcon.remove();
					});
					
					// Make TOC events sortable
					iframe.find("ul.toc").sortable({ 
						connectWith: ".toc", 
						placeholder: "ui-state-highlight",
						start: function(event, ui) {
							$deleteIcon.remove();
							$sortIcon.addClass("event-drag-active");
						},
						stop: function(event, ui) {
							// Fix icons 
							$sortIcon.remove();
							$(ui["item"][0]).prepend($sortIcon); // Fix sort icon location
							$sortIcon.removeClass("event-drag-active");
							$(ui["item"][0]).append($deleteIcon); // Re-add delete icon
							
							// Give destination set class to change colors
							var movedEvent = $(ui["item"][0]).attr("class").match(/event\-\w{1,}/)[0];
							var movedEventTitleClass = iframe.find("span#" + movedEvent).find(".info-event-title").attr("class").match(/(cal|set)\-\w{1,}/)[0];
							var setDestination = $(ui["item"][0]["parentElement"]).attr("class").match(/set\-\w{1,}/)[0];
							iframe.find("span#" + movedEvent).find(".info-event-title").removeClass(movedEventTitleClass);
							iframe.find("span#" + movedEvent).find(".info-event-title").addClass(setDestination);
							
							// Place event info element in correct new position
							var index = $(ui["item"][0]).index();
							if (index == 0) { // Prepend to div if it is now the first element
								iframe.find("div." + setDestination).prepend(iframe.find("span#" + movedEvent));
							} else  { // Otherwise add it to the right index position
								iframe.find("div." + setDestination + " span.info-event:nth-child(" + index + ")").after(iframe.find("span#" + movedEvent));
							}
							iframe.find("div." + setDestination).find(".counter").remove(); // Remove counter so non-counted sections will not show counts
							
							numberEvents();
						}
					}).disableSelection();
					numberEvents();
					
					// Add add event option on hover
					var $addEvent = $("<div id='event-add'><a id='event-add-link'><span class='ui-icon ui-icon-plusthick'></span>Add event<br></a></div>");
					iframe.find("ul.toc").hover(function(e) {
						//var $target = $(e.currentTarget);
						var set = $(this).attr("class").match(/set\-\w{1,}/)[0];
						$(this).after($addEvent);
						$addEvent.click(function() {
							eventAdd.dialog("open");
							$("#event-add-form").removeClass();
							$("#event-add-form").addClass(set); // Let the dialog know which set to put the event in through classes
						});
					}, function() {
						$sortIcon.remove();
					});
					
				});
			},
			function(xhr) { // Report failure
				var data = JSON.parse(xhr.responseText);
				$('#data').show();
				$('iframe#output').html('Request failed with code '+ xhr.status +': ' + JSON.stringify(data));
			}
		);
	});
	
	// Copy and reset button functions 
	$("#copy").button().click(function() {
		var iframe = $('iframe#output')[0];
		$('iframe#output').contents().find("#event-drag, #event-add").remove(); // Get rid of sort and add event buttons
		iframe.contentWindow.focus();
		iframe.contentDocument.execCommand('selectAll');
		iframe.contentDocument.execCommand('copy');
		alert("DCD copied to clipboard!\n\nIf that didn't work, use Ctrl+C or Command+C after pressing this button!")
	});
	$("#reset").button().click(function() {
		eventReset.dialog("open");
	});
	
	// Event add dialog
	var eventAdd = $("#event-add-dialog").dialog({
		modal: true,
		height: 600,
		width: 700,
		autoOpen: false,
		buttons: {
			Create: function() {
				var set = $("#event-add-form").attr("class"); // Assumes set is ONLY class of #event-add-form
				if (set.length > 3) {
					addEvent(set, getNewEventId(), $("#event-add-name").val(), $("#event-add-info").val(), $("#event-add-notes").val());
					$(this).dialog("close");
				} // Otherwise something probably went wrong
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		}
	});

	// Event delete dialog
    var eventDelete = $("#event-delete-dialog").dialog({
		modal: true,
		autoOpen: false,
		height: 250,
		width: 500,
		buttons: {
			"Delete": function() { // Delete <span>s and <li>s corresponding to class .event-number
				var eventId = $("#event-delete-id").html(); // Assumes .event-number is the only class of #event-delete-id
				$("iframe#output").contents().find("span." + eventId + ", li." + eventId).remove();
				numberEvents();
				$(this).dialog("close");
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		}
	});
	
	// Reset DCD dialog
	var eventReset = $("#reset-dialog").dialog({
		modal: true,
		autoOpen: false,
		height: 230,
		width: 420,	
		buttons: {
			"Reset": function() {
				location.reload();
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		}		
	});
});
