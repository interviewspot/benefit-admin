<?php
/*
 * jQuery File Upload Plugin PHP Example
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

error_reporting(E_ALL | E_STRICT);
require('UploadHandler.php');

$options = array(
            'user_dirs' => true,
            'accept_file_types' => '/\.(gif|jpe?g|png)$/i',
            'mkdir_mode' => 0755,
           );
$upload_handler = new UploadHandler($options);
print_r($upload_handler);
