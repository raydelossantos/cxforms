require 'yaml'
require 'fileutils'

# list all needed plugins
required_plugins = %w( vagrant-hostmanager vagrant-vbguest )

# make sure all required plugins are installed
required_plugins.each do |plugin|
    exec "vagrant plugin install #{plugin}" unless Vagrant.has_plugin? plugin
end

# get config file
config_file = File.dirname(__FILE__) + '/vagrant/vagrant-config.yml'

# read config file
options = YAML.load_file config_file

config = {
  local: './api/phinx.yml',
  sample: './api/phinx.yml.sample'
}

# copy PHINX config file from example if local config not exists
FileUtils.cp config[:sample], config[:local] unless File.exist?(config[:local])

# # create app.log file and make it writable
# FileUtils.touch 'api/logs/app.log'
# File.chmod(0777,'api/logs/app.log')

# # make sure upload directories exist and writeable
# FileUtils.mkdir 'api/public/uploaded_files' unless File.exist?('api/public/uploaded_files')
# File.chmod(0777,'api/public/uploaded_files')
# FileUtils.mkdir 'api/public/uploaded_images' unless File.exist?('api/public/uploaded_images')
# File.chmod(0777,'api/public/uploaded_images')

# vagrant configurate
Vagrant.configure(2) do |config|
  # select the box
  config.vm.box = 'bento/ubuntu-16.04'

  # should we ask about box updates?
  config.vm.box_check_update = options['box_check_update']

  config.vm.provider 'virtualbox' do |vb|
    # machine cpus count
    vb.cpus = options['cpus']
    # machine memory size
    vb.memory = options['memory']
    # machine name (for VirtualBox UI)
    vb.name = options['machine_name']
  end

  # machine name (for vagrant console)
  config.vm.define options['machine_name']

  # machine name (for guest machine console)
  config.vm.hostname = options['machine_name']

  # network settings
  config.vm.network 'private_network', ip: options['ip']

  # sync: root (host machine) -> folder '/app' (guest machine)
  config.vm.synced_folder './api', '/var/www/html', owner: 'vagrant', group: 'vagrant'

  # disable folder '/vagrant' (guest machine)
  config.vm.synced_folder '.', '/vagrant', disabled: true

  # hosts settings (host machine)
  config.vm.provision :hostmanager
  config.hostmanager.enabled            = true
  config.hostmanager.manage_host        = true
  config.hostmanager.ignore_private_ip  = false
  config.hostmanager.include_offline    = true
  config.hostmanager.aliases            = options['domain']

  # quick fix for failed guest additions installations
  # config.vbguest.auto_update = false

  # provisioners
  config.vm.provision 'shell', path: './vagrant/provision/once-as-root.sh', args: [options['domain']]
  config.vm.provision 'shell', path: './vagrant/provision/once-as-vagrant.sh', privileged: false
  config.vm.provision 'shell', path: './vagrant/provision/always-as-root.sh', run: 'always'

  # post-install message (vagrant console)
  config.vm.post_up_message = "QA GOLD API ENDPOINT: http://#{options['domain']}
  
  You can also connect your MySQL Workbench to: #{options['ip']}"
end
