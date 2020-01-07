# oe-cloud-cli

![logo](https://rawgit.com/EdgeVerve/oe-cloud-cli/master/img/title.JPG)

***CLI for scaffolding oe-cloud based applications.***

> This project is modification of original project [yeoman/yo](https://github.com/yeoman/yo)

> This project is changed from original project for,

* Changing the route
* Adding organisation specific documentation in help section
* Changing code to make it work with corporate proxy
* Organisation branding added

Please visit [yeoman/yo](https://github.com/yeoman/yo) for original documentation.

## Installation

```sh

# install oe-cloud-cli
$ npm install -g oe-cloud-cli

# start cli
$ oe

```

## Usage

![usage](https://rawgit.com/EdgeVerve/oe-cloud-cli/master/img/usage.JPG)

## Steps to Build an Oe-Cloud Starter Application

* Select **Search/Build a Starter App**
* Select **Starter App** from the command line.
### Build Oe-Cloud 1.0 Starter Application
![oe-cloud1x](http://evgit/oecloud.io/oe-cloud-cli/raw/master/img/oe-cloud1x.PNG)
### Build Oe-Cloud 2.0 Starter Application
![oe-cloud2x](http://evgit/oecloud.io/oe-cloud-cli/raw/master/img/oe-cloud2x.PNG)
### Build Oe-Cloud UI Application
![oe-cloudui](http://evgit/oecloud.io/oe-cloud-cli/raw/master/img/oe-cloudui.PNG)

On completion of npm install, change your directory to the application folder and execute **npm start** command.

![start-server](http://evgit/oecloud.io/oe-cloud-cli/raw/master/img/start-server.PNG)

## What's oe-cloud-cli?

oe-cloud-cli helps you to kickstart new projects, prescribing best practices and tools to help you stay productive.

## Advanced CLI options

oe-cloud-cli provides the option to create model, datasource, property, relation, acl and middleware.

```sh
# cli to create datasource
$ oe create datasource

# cli to create model
$ oe create model

# cli to create property
$ oe create property

# cli to create relation
$ oe create relation

# cli to create acl
$ oe create acl

# cli to create middleware
$ oe create middleware

```

oe-cloud-cli also enables the user to perform few basic oe cloud functionalities from command line.

* default-ui: Allows the user the generate default UIRoute,NavigationLink and UIComponent for the selected Model.
* ui-route: Allows the user to enter initial data for UIRoute model
* navigation-link: Allows the user to enter initial data for NavigationLink model
* workflow: Allow user the attach workflow to a model from the selected list
* business-rules: Allow user to attach the business-rules to the model.

```sh
# cli to define default UI
$ oe define default-ui

# cli to define UI route
$ oe define ui-route

# cli to define navigation link
$ oe define navigation-link

# cli to attach workflow to model
$ oe attach workflow

# cli to attach business rule to model
$ oe attach business-rules

```