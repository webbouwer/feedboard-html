<?php
header('Content-type: text/xml; charset=utf-8');

$url = $_GET['url'];
echo file_get_contents($url);

?>
