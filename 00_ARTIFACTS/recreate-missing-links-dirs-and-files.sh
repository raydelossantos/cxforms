#!/bin/bash
echo 'Execution....'

echo 'Make a symlink for PHINX Migration settings:'
echo `sudo ln -s /var/www/phinx.yml ../api/`

echo 'Make sure all required folders exists, with write permission creating/uploading files, make symlinks';
echo `sudo ln -s /var/www/logs ../api/`
echo `sudo ln -s /var/www/uploaded_images  ../api/public/`
echo `sudo ln -s /var/www/uploaded_files   ../api/public/`
echo `sudo ln -s /var/www/settings.php ../api/src/`


echo 'Finished....'
