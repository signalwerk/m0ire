<?php 

	$remoteImage = $_GET['url'];
	$imginfo = getimagesize($remoteImage);
	header("Content-type: ". $imginfo['mime']);
	readfile($remoteImage);

?>