<!DOCTYPE html>
<html lang="en">
<head>
<title>STEM EE Tools</title>
<link rel="stylesheet" href="lib/jquery/jquery-ui.min.css">
<link href="resources/css/normalize.css" rel="stylesheet">
<link href="resources/css/dcd.css" rel="stylesheet">
</head>
<body>
	<h1>DCD Generator</h1><br>
	Date: <input type="text" id="dcd-start"> to 
	<input type="text" id="dcd-end"><br>
	<div style="display:none">Template: <select id="template"><option id="stemee" selected>STEM EE</option></select></div><br><br>
	<input type="button" id="submit" value="Submit">&nbsp;<input type="button" id="copy" value="Copy"/><br><br>
	<div id="data" class="fluid" style="display:none">
		<iframe id="output">
		</iframe>
	</div>
	<script src="lib/jquery/jquery.min.js"></script>
	<script src="lib/jquery/jquery-ui.min.js"></script>
	<script src="lib/date.js"></script>
	<script src="resources/js/dcd.js"></script>
</body>
</html>	