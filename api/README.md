# Connext Forms - cxForms

This project is being built and maintained using PHP SLIM Framework with Eloquent ORM and Phinx migration tool for PHP. MySQL is used as a back-end database. 

This API provides functionalities for existing chat bot(s) intended for different purposes.

## Pull this repository to get started

Clone this repo then enter your AgileBoard password on prompt:

	git clone https://your_user_name@gitlab.com/jmlgmn/cxforms.git


## Install/Prepare requirements to begin working with this awesome project

### VAGRANT (RECOMMENDED)
* `Vagrant` makes it easy to provision a server and is isolates it from the host machine by creating a guest machine that will run all the necessary requirements this API Server needs.
* This method is recommended to eliminate cumbersome installations and configurations.
* This vagrant server will consist of: Ubuntu OS 16.04, PHP 7.1, Apache, MySQL 5.7 server
* All configurations for the abovementioned software requirements are satisfied and server should be up and running as expected once done provisioning.
* NOTE: Vagrant server though portable and disposable, consumes a lot of overhead in system resources. This vagrant server has 1GB of RAM & 1 vCPU configuration.

Provision the vagrant server (this will take time 30mins-1.5hrs depending on your machine and internet connection)

	vagrant up

You can navigate to the domain specified on the browser to confirm that server has been well-created. http://cxforms.com

* API Server created should be usable on developers end by default, changes in DB `seeders` should be crafted, kindly head to `api/db/seeders` folder to check for your custom details.
* API has been populated with default users, user_info, admin_priivileges, clients, lines_of_business, teams, team_members sample data.
* Users can login via CS LDAP credentials. Default users are viewed in `api/db/seeders/UsersSeeder.php` file.

### COMPOSER
* Download composer, go to https://getcomposer.org/download/
* Make sure composer is an executable command to make simple executions

Go to folder

	cd qagold/api

### Linux-Apache-Mysql/MariaDB-PHP (LAMP)
* LAMP simplifies all your development environment setup and is easy to use. Kindly look for your platform (OS) requirements to install LAMP.
* You may need to relocate your files to Apache's working directory to enable the PHP server

### TEXT EDITOR/IDE
* You may use your favorite text editor or development toolkits for this project.


## Install dependencies and development requirements 

To begin, install all dependencies via composer

	composer install

## Start development using PHP Server

You can easily start the server by running:

	composer start

Then open a browser and navigate to this URL: http://localhost:8999

You can also overwrite the URL provided above by editing `composer.json` file and change the `scripts`.`start` contents

	"scripts": {
        "start": "php -S localhost:8999 -t public",
        "test": "phpunit"
    }

Change the `localhost:8999` based on your desired IP and port respectively.

You can also jsut start the PHP server by running (tailor based on your preferences):

	php -S localhost:8999 -t public

## Run a Docker container to start server

If you have a Docker installed on your computer, you can also begin running a Docker container by running:

	docker-compose up -d 

Start & stop container

	docker start <assigned_name_of_container>
	docker stop <assigned_name_of_container>

You can check existing docker container NAMES by running the command below:

	docker ps -a

## Development environment

You are free to use your favorite text editor or development environment, however, this project was built using `VS Code`, though it should be portable, it is recommended for its ease of use and extensibility by adding plugins like linters and it suggests a lot of extensions that you can use with this project.

## Eloquent ORM

This SLIM application is built with Eloquent ORM. https://laravel.com/docs/5.0/eloquent

## Phinx Migration tool for PHP

To minimize confusions and problems with database changes, Phinx was utilized in this project to version all databases changes. 

Create a copy of `phinx.yml.sample` and name it as `phinx.yml`

		cp phinx.yml.sample phinx.yml
	
To setup Phinx, open `phinx.yml` and update your development variables for MySQL connections. Change base on your local settings. 

		development:
		adapter: mysql
		host: 127.0.0.1
		name: cx_forms
		user: root
		pass: 'root'
		port: 3306
		charset: utf8

You may also configure other settings on this file to ready migrations on staging and production.

This Phinx uses `db` directory of this project to copy the `MigrationTemplate.php` when you create a new migration like:

	php vender/bin/phinx create <migration_name>

Example:

	php vender/bin/phinx create CreateBotConfigTable

This will generate new migration files at `db/migrations`.

Update the migration by removing or adding new contents based on the generated file. More information here http://docs.phinx.org/en/latest/migrations.html

You can then execute migration via:

	php vendor/bin/phinx migrate -e development

By default, Phinx will execute all existing migration files from the specified folder, to run individual migration use:

	php vender/bin/phinx migrate -e development -t <target_migration_epoch/datetime>

Rollback a migration command:

	php vender/bin/phinx rollback

## Phinx Seed - Populate the DB with sample contents

You may want to view sample database dumps from testing data. 

You can create your new seed files using:

	php vender/bin/phinx seed:create <seed_name>

Example:

	php vendor/bin/phinx seed:create BotConfigSeeder

Run the following to insert records to all tables:

	php vendor/bin/phinx seed:run

The above command is the default where it will execute all seeds found, to run individual seeder:

	php vendor/bin/phinx seed:run -s <seed_target_class_name>

Example:

	php vendor/bin/phinx seed:run -e development -s BotConfigSeeder
