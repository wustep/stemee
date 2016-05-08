<!DOCTYPE html>
<html lang="en">
<head>
<title>STEM EE Tools</title>
<link rel="stylesheet" href="scripts/jquery-ui.min.css">
<link href="css/normalize.css" rel="stylesheet">
<style>
.fluid { /* from bymichaellancaster.com */
    position: relative;
    padding-bottom: 56.25%; 
    padding-top: 30px;
    height: 0;
    overflow: hidden;
	border: 1px solid black;
}

.fluid iframe {
    position: absolute;
    top: 0; 
    left: 0;
    width: 100%;
    height: 100%;
}

body {
	font-family: Helvetica, Arial;
	margin: 5px;
}
</style>
</head>
<body>
	<h1>DCD Generator</h1><br>
	Date: <input type="text" id="dcd-start"> to 
	<input type="text" id="dcd-end"><br>
	<div style="display:none">Template: <select id="template"><option id="stemee" selected>STEM EE</option></select></div><br><br>
	<input type="button" id="submit" value="Submit">&nbsp;<input type="button" id="select-all" value="Copy"/><br><br>
	<div id="data" class="fluid" style="display:none">
		<iframe id="output">
		</iframe>
	</div>
	<script src="scripts/jquery.js"></script>
	<script src="scripts/jquery-ui.js"></script>
	<script src="scripts/dcd.js"></script>
	<script src="scripts/date.js"></script>
	<script>
	$(function() {
		$( "#dcd-start" ).datepicker({
		  defaultDate: "+1w",
		  changeMonth: true,
		  dateFormat: "yy-mm-dd",
		  numberOfMonths: 2,
		  onClose: function( selectedDate ) {
			$( "#dcd-end" ).datepicker( "option", "minDate", selectedDate );
		  }
		});
		$( "#dcd-end" ).datepicker({
		  defaultDate: "+1w",
		  changeMonth: true,
		  dateFormat: "yy-mm-dd",
		  numberOfMonths: 2,
		  onClose: function( selectedDate ) {
			$( "#dcd-start" ).datepicker( "option", "maxDate", selectedDate );
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
			var startDate = $("#dcd-start").prop('value');
			var endDate = $("#dcd-end").prop('value');
			var template = $("#template option:selected").attr('id');
			makeCorsRequest(
				'https://api.teamup.com/kse89a84dcb543ed5e/events?startDate='+startDate+'&endDate='+endDate,
				function(xhr) {
					var data = JSON.parse(xhr.responseText);
					$('#data').show();
					$('iframe#output').attr('src', 'templates/' +template+'.html');
					$('iframe#output').load(function() {
							generateDCD(data, $("iframe#output").contents().find("#content"), template);
							var jQueryUICSS = "<link rel='stylesheet' href='../scripts/jquery-ui.min.css'>";
							var eventsCSS = "<link rel='stylesheet' href='events.css'>";
							$("iframe#output").contents().find("head").append(jQueryUICSS + eventsCSS);
							$("iframe#output").contents().find(".toc").sortable({ 
								connectWith: ".toc", 
								placeholder: "ui-state-highlight", 
								stop: function(event, ui) {
									numberEvents();
									console.log(event);
								}
							}).disableSelection();
							var $sortIcon = $("<span class='ui-icon ui-icon-arrowthick-2-n-s'></span>");
							$("iframe#output").contents().find(".toc-event").hover(function() {
								$(this).prepend($sortIcon);
							}, function() {
								$sortIcon.remove();
							});
							numberEvents();
					});
				},
				function(xhr) {
					var data = JSON.parse(xhr.responseText);
					$('#data').show();
					$('iframe#output').html('Request failed with code '+ xhr.status +': ' + JSON.stringify(data));
				}
			);
		});
		$("#select-all").button().click(function() {
			var iframe = $('iframe#output')[0];
			iframe.contentWindow.focus();
			iframe.contentDocument.execCommand('selectAll');
			iframe.contentDocument.execCommand('copy');
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
	</script>
</body>
</html>	