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
						ev = "<b>" + ev + "</b><br>" + subObject.replace(/(<p[^>]+?>|<p>|<\/p>)/img, "").replace(/\n/g, "<br>");
					}
					console.log(subI + "=" + subObject);
				});
				results = results + ev + "<br><br>";
			});
		}
	});
	return results;
}
