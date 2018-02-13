/**
 *
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */
'use strict';
const chalk = require('chalk');
const namespaceToName = require('oe-environment').namespaceToName;
var nopt = require('nopt');
var path = require('path');
var fs = require('fs-extra');
const inquirer = require('inquirer');
var workspace = require('loopback-workspace');
var debug = require('debug')('oe:generate');

var commands = ["default-ui", "create-route", "create-navigation", "attach-workflow", "attach-rules"];

module.exports = (app, name) => {
    // console.log("app", app, "name", name);
    var self = this;
    debug("name: ", name);
    var cmd = name[1];

    if (commands.indexOf(cmd) === -1) {
        console.log(chalk.yellow('\nAvailable options are ' + commands.join(', ') + '.\n'));
        app.env.error(chalk.red( cmd + ' is not a valid generate command.\n'));
        return;
    }

    console.log(chalk.yellow('\nMake sure you are in the directory you want to scaffold into.'));

    var version = "1.0.0";
    if(fs.existsSync('package.json')){
        var packageJson = fs.readJsonSync('package.json');
        version = packageJson.version || version;
    }
    
    var bootPath = "db/"+version;
    var metaFilePath = path.join(bootPath, "meta.json");
    var defaultMeta = {
        "contexts": {
            "default": {
                "id": 0,
                "tenantId": "default",
                "remoteUser": "upload"
            }
        },
        "files": []
    }
    if (!fs.existsSync(metaFilePath)) {
        fs.ensureFileSync(metaFilePath);
        fs.writeFileSync(metaFilePath, JSON.stringify(defaultMeta, null, 2));
    }
    var fnGetModels = function (done) {
        workspace.models.ModelDefinition.find(function (err, results) {
            if (err) return done(err);
            var modelNames = results.map(function (m) {
                return m.name;
            });
            done(modelNames);
        }.bind(this));
    };


    function getModelBootPath(modelName, autoInject) {
        var meta = fs.readJsonSync(metaFilePath);
        if (!meta.files) {
            meta.files = [];
        }
        var modelIndex = meta.files.findIndex(function getBootFilePath(file) {
            return file && (file.model === modelName);
        })
        if (modelIndex === -1) {
            if (!autoInject) {
                return;
            }
            var defaultFilePath = {
                "model": modelName,
                "enabled": true,
                "file": modelName + ".json",
                "ctxId": "default"
            }
            meta.files.push(defaultFilePath);
            fs.writeFileSync(metaFilePath, JSON.stringify(meta, null, 2));
            return path.join(bootPath, defaultFilePath.file);
        }
        return path.join(bootPath, meta.files[modelIndex].file);
    }

    function upsertBootData(path, data, uniqueField) {
        if (!fs.existsSync(path)) {
            fs.ensureFileSync(path);
            fs.writeFileSync(path, JSON.stringify([]));
        }
        var bootData = fs.readJsonSync(path);
        var dataIndex = bootData.findIndex(function getUniqueRecord(d) {
            return d[uniqueField] === data[uniqueField]
        });
        if (dataIndex === -1) {
            bootData.push(data);
        } else {
            bootData[dataIndex] = data;
        }
        fs.writeFileSync(path, JSON.stringify(bootData, null, 4));
    }

    function getModelBootData(modelName) {
        var modelBootPath = getModelBootPath(modelName);
        if (!fs.existsSync(modelBootPath)) {
            return [];
        }
        return fs.readJsonSync(modelBootPath);
    }

    function writeBootDataToModel(modelName, data, uniqueField) {
        var modelBootPath = getModelBootPath(modelName, true);
        upsertBootData(modelBootPath, data, uniqueField)
    }

    function generateDefaultUI() {
        fnGetModels(function (modelsList) {
            inquirer.prompt([{
                name: 'modelName',
                type: 'list',
                message: `Select the model to generate default UI`,
                choices: modelsList
            }]).then(answer => {
                var modelName = answer.modelName;
                var lowerCaseModelName = modelName.toLowerCase();
                var uiRouteData = {
                    type: 'elem',
                    name: lowerCaseModelName + '-default',
                    path: '/' + lowerCaseModelName + '-default',
                    import: 'api/UIComponents/component/' + lowerCaseModelName + '-default.html'
                };
                var uiComponentData = {
                    name: lowerCaseModelName + '-default',
                    templateName: 'default-form.html',
                    modelName: modelName
                };
                var navigationLinkData = {
                    name: lowerCaseModelName + '-default',
                    url: '/' + lowerCaseModelName + '-default',
                    label: modelName,
                    group: 'root'
                };
                writeBootDataToModel('UIComponent', uiComponentData, 'name');
                writeBootDataToModel('UIRoute', uiRouteData, 'path');
                writeBootDataToModel('NavigationLink', navigationLinkData, 'name');
                app.navigate('home');
            });
        })
    }

    function generateUIRoute() {
        inquirer.prompt([{
            name: 'path',
            type: 'input',
            message: `Enter the url path for the route`
        }, {
            name: 'type',
            type: 'list',
            message: `Select the type of component`,
            choices: ['elem', 'page', 'meta']
        }, {
            name: 'name',
            type: 'input',
            message: `Enter the name of the component`
        }, {
            name: 'import',
            type: 'input',
            message: `Enter the import path for the component`
        }, {
            name: 'retainInstance',
            type: 'list',
            message: `Retain instance of route on navigation`,
            choices:['Y','N']
        }]).then(answer => {
            var uiRouteData = {
                type: answer.type,
                name: answer.name,
                path: answer.path,
                import: answer.import,
                retainInstance:(answer.retainInstance === 'Y')
            }
            writeBootDataToModel('UIRoute', uiRouteData, 'path');
            app.navigate('home');
        });
    }

    function generateNavigationLink() {
        inquirer.prompt([{
            name: 'name',
            type: 'input',
            message: `Enter the name of the Navigation Link`
        }, {
            name: 'url',
            type: 'input',
            message: `Enter the url to navigate`
        }, {
            name: 'label',
            type: 'input',
            message: `Enter a label to display`
        }, {
            name: 'group',
            type: 'input',
            message: `Enter a group for the navigation Link`
        }]).then(answer => {
            var navigationLinkData = {
                name: answer.name,
                url: answer.url,
                label: answer.label,
                group: answer.group
            };
            writeBootDataToModel('NavigationLink', navigationLinkData, 'name');
            app.navigate('home');
        });
    }

    function attachWorkFlowToModel() {
        fnGetModels(function (modelsList) {
            var workFlows = getModelBootData('WorkflowDefinition');
            var workflowPrompt = {
                name: 'workflow',
                type: 'list',
                message: `Select the workflow`,
                choices: workFlows
            }

            if(workFlows.length == 0){
                workflowPrompt = {
                    name: 'workflow',
                    type: 'input',
                    message: `Enter the name of the workflow`
                }
            }

            inquirer.prompt([{
                name: 'modelName',
                type: 'list',
                message: `Select the model to attach Workflow`,
                choices: modelsList
            }, workflowPrompt ,{
                name: 'wfDependent',
                type: 'list',
                message: `Workflow Dependent`,
                choices: ['Y','n']
            }]).then(answer => {
                var attachWorkflowDef = {
                    "modelName": answer.modelName,
                    "workflowBody": {
                      "workflowDefinitionName": answer.workflow
                    },
                    "operation": "create",
                    "wfDependent": answer.wfDependent == 'Y'
                };
                writeBootDataToModel('WorkflowManager', attachWorkflowDef, 'modelName');
                app.navigate('home');
            });
        })
    }

    function attachRuleToModel() {
        fnGetModels(function (modelsList) {
            var decisionRules = getModelBootData('DecisionTable');
            var decisionRulePrompt = {
                name: 'rule',
                type: 'list',
                message: `Select the Business rule`,
                choices: decisionRules
            }

            if(decisionRules.length == 0){
                decisionRulePrompt = {
                    name: 'rule',
                    type: 'input',
                    message: `Enter the name of the Business rule`
                }
            }

            inquirer.prompt([{
                name: 'modelName',
                type: 'list',
                message: `Select the model to attach Business rule`,
                choices: modelsList
            }, decisionRulePrompt ,{
                name: 'isDefaultRule',
                type: 'list',
                message: `Set rule as default rule of the model ?`,
                choices: ['Y','n']
            }]).then(answer => {
                var attachModelRule = {
                    "modelName": answer.modelName,
                    "defaultRules": [],
                    "validationRules": []
                };

                if(answer.isDefaultRule == 'Y'){
                    attachModelRule.defaultRules.push(answer.rule);
                }else{
                    attachModelRule.validationRules.push(answer.rule);
                }

                writeBootDataToModel('ModelRule', attachModelRule, 'modelName');
                app.navigate('home');
            });
        })
    }

    switch (cmd) {
        case "default-ui": generateDefaultUI(); break;
        case "create-route": generateUIRoute(); break;
        case "create-navigation": generateNavigationLink(); break;
        case "attach-workflow": attachWorkFlowToModel(); break;
        case "attach-rules": attachRuleToModel(); break;
    }


};