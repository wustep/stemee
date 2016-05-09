<!DOCTYPE html>
<html lang="en">
<head>
<title>STEM EE Tools</title>
<link rel="stylesheet" href="lib/jquery/jquery-ui.min.css">
<link href="resources/css/normalize.css" rel="stylesheet">
<link href="resources/css/dcd.css" rel="stylesheet">
</head>
<body>
	<h1>DCD Generator</h1>
	Date: <input type="text" id="dcd-start"> to 
	<input type="text" id="dcd-end"><br><br>
	<input type="button" id="submit" value="Submit">&nbsp;<input type="button" id="copy" value="Copy"/><br><br>
	<div id="data" class="fluid" style="display:none">
		<iframe id="output">
		</iframe>
	</div>
	
	<div id="event-add-dialog" title="Add event" style="display:none;">
	  <form id="event-add-form">
		<fieldset id="event-add-fieldset">
		  <label for="name">Name</label><br>
		  <input type="text" name="name" id="event-add-name" value="" class="ui-widget-content" autocomplete="off"><br>
		  <label for="info">Info (Optional)</label><br>
		  <input type="text" name="info" id="event-add-info" placeholder="e.g. Tuesday, April 12, 5:20PM-6:00PM, Evans Lab Room 2004" value="" class="ui-widget-content" autocomplete="off"><br>
		  <label for="desc">Description</label><br>
		  <textarea name="desc" id="event-add-notes" value="" class="ui-widget-content" autocomplete="off"></textarea>
		</fieldset>
	  </form>
	</div>	

	<script src="lib/jquery/jquery.min.js"></script>
	<script src="lib/jquery/jquery-ui.min.js"></script>
	<script src="lib/date.js"></script>
	<script src="resources/js/dcd.js"></script>
</body>
</html>	