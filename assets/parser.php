<?php 
/**
 * Parse document in correct content type
 * returns js, xml or json 
 */
 
if($_GET['url']){

// get extension by checking last 4 characters (enough for an extension)
$url = $_GET['url'];
$length = strlen($url);
$characters = 4;
$start = $length - $characters;
$url = substr($time , $start ,$characters);
$ext = explode(".", $url); // drop the dot
$type = $ext[1]; 


if($type == 'js'){
// set javascript headers
header("Content-Type: application/javascript");
}


if($type == 'xml'){
// set xml headers
header('Content-type: text/xml; charset=utf-8');
}


if($type == 'json'){
// set json (default)
header('Content-type: text/json; charset=utf-8');
}

echo file_get_contents($_GET['url']);

}else{

echo 'nothing here..';

}

?>
