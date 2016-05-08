<!DOCTYPE html>
<html lang="en">
<head>
<title>STEM EE Tools</title>
<link rel="stylesheet" href="lib/jquery/jquery-ui.min.css">
<link href="resources/css/normalize.css" rel="stylesheet">
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