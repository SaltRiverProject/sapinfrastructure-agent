# ESO Agent
A node.js powered agent which runs on redhat/ubuntu systems to control SAP applications to start/stop them properly.
## Introduction

## Requirements
* node.js 6.9.1
* Ubuntu 14.04 or newer
* Redhat/Centos 6 or newer


## Usage
The agent has a series of commands you can run the command followed by -h flag to see its options.

```
  setup [options]      sets up the agent for the first time
  register [options]   registers an agent with sapinfrastructure
  run                  runs the agent
```

You will need to first run setup, and provide the backend details, then you will need to register the agent and enable it in the panel. Only then can the agent connect and run properly.

## Getting Started
This assumes the agent is being installed to /opt/esoagent,

### Installing from npm
First make sure your registry for npm is set to the corporate registry. `npm set registry http://npm.srp.gov` then just run `npm install -g esoagent`

### Installing from source
```bash
cd /opt;
git clone https://github.com/SaltRiverProject/sapinfrastructure-agent.git esoagent;
cd esoagent;
npm install;
npm link; # this allows you to run the script as esoagent instead of node index.js
```

### Setup the agent
```bash
esoagent setup;
esoagent register;
esoagent run;
```

## Run as a service
### systemd
The following systemd assumes you're using nvm as root user and the esoagent is installed to `/opt/apps/esoagent` path


create a `esoagent.service` systemd file
`vim /path/to/systemd/esoagent.service`

```bash
[Unit]
Description=ESO Agent Collector
[Service]
ExecStart="/root/.nvm/versions/node/v6.9.1/bin/node /opt/apps/esoagent/index.js run"
Restart=always
RestartSec=10
SyslogIdentifier=esoagent
Environment="NODE_ENV=production"
[Install]
WantedBy=multi-user.target
```

Once the script is installed you cant enable it by issuing the following commands:

```bash
systemctl daemon-reload
systemctl enable esoagent.service
systemctl start esoagent.service
```
