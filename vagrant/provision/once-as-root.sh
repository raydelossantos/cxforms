#!/usr/bin/env bash

#== Bash helpers ==

function info {
  echo " "
  echo "--> $1"
  echo " "
}

Update () {
    echo "-- Update OS packages --"
    apt-get update
    apt-get upgrade
}
Update

#== Provision script ==

info "Provision-script user: `whoami`"

export DEBIAN_FRONTEND=noninteractive

info "-- Configure PHP7.2 repos --"
add-apt-repository ppa:ondrej/php

info "-- Prepare configuration for MySQL --"
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password password root"
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password_again password root"

info "-- Install tools and helpers --"
sudo apt-get install -y --force-yes python-software-properties vim htop curl git npm build-essential libssl-dev

info "-- Install PPA's --"
sudo add-apt-repository ppa:ondrej/php
Update

info "-- Install packages --"
apt-get install -y --force-yes apache2 mysql-server-5.7 git-core nodejs
apt-get install -y --force-yes php7.1-common php7.1-dev php7.1-json php7.1-opcache php7.1-cli libapache2-mod-php7.1
apt-get install -y --force-yes php7.1 php7.1-mysql php7.1-fpm php7.1-curl php7.1-gd php7.1-mcrypt php7.1-mbstring php7.1-xml
apt-get install -y --force-yes php7.1-bcmath php7.1-zip php7.1-ldap
Update

info "-- Configure PHP & Apache --"
sed -i "s/error_reporting = .*/error_reporting = E_ALL/" /etc/php/7.1/apache2/php.ini
sed -i "s/display_errors = .*/display_errors = On/" /etc/php/7.1/apache2/php.ini
a2enmod rewrite

info "-- Creating virtual hosts --"
ln -fs /app /var/www/app
cat > /etc/apache2/sites-available/default.conf <<EOF
<Directory "/var/www/">
    AllowOverride All
</Directory>

<VirtualHost *:80>
    DocumentRoot /var/www/html/public
    ServerName $1
</VirtualHost>
EOF

a2ensite default.conf

info "-- Create PHINX config file --"
if [ ! -f /var/www/html/phinx.yml ]; then
    cp /var/www/html/phinx.yml.sample /var/www/html/phinx.yml
fi

info "-- Create APP config file --"
if [ ! -d /var/www/html/src/settings.php ]; then
    cp /var/www/html/src/settings.php.sample /var/www/html/src/settings.php
fi

info "-- Make sure uploaded_images folder is accessible --"
if [ ! -d /var/www/html/public/uploaded_images ]; then
    mkdir -m 777 /var/www/html/public/uploaded_images
fi
if [ -d /var/www/html/public/uploaded_images ]; then
    chmod 777 /var/www/html/public/uploaded_images
fi

info "-- Make sure uploaded_files folder is accessible --"
if [ ! -d /var/www/html/public/uploaded_files ]; then
    mkdir -m 777 /var/www/html/public/uploaded_files
fi
if [ -d /var/www/html/public/uploaded_files ]; then
    chmod 777 /var/www/html/public/uploaded_files
fi

info "-- Make sure log file exists --"
if [ ! -f /var/www/html/logs/app.log ]; then
    install -m 777 /dev/null /var/www/html/logs/app.log
fi

info "-- Restart Apache --"
/etc/init.d/apache2 restart

info "-- Install composer --"
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

info "-- Install app requirements --"
cd /var/www/html
composer install

info "-- Setup databases --"
mysql -uroot -proot -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'root' WITH GRANT OPTION; FLUSH PRIVILEGES;"
mysql -uroot -proot -e "CREATE DATABASE cx_forms";

info "-- Execute database migration --"
cd /var/www/html
php vendor/bin/phinx migrate -e development
php vendor/bin/phinx seed:run

info "-- Remove strict conf from MySQL --"
echo "sql_mode = 'ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'" >> /etc/mysql/mysql.conf.d/mysqld.cnf