/**
 * Sails Models generator from existing MySQL Database
 *
 * @description :: Generate Models files for Sails App from MySQL Database
 * @docs        :: http://sailsjs.org/#!documentation/models
 * @copyright   :: Yevgen 'Scorp' Sukharenko <ysukharenko@gmail.com> http://sukharenko.com
 */

var appDir = process.cwd();

var mysql = require('mysql'), // https://github.com/felixge/node-mysql
    fs = require('fs'),
    sailsConnections = require(appDir + '/config/connections.js'),
    sailsModels = require(appDir + '/config/models.js');

var myTables = [];

var myConnection = sailsModels.models.connection || false;
if (!myConnection) {
    throw new Error('Error: No connection defined in config/models.js!');
}

var connectionConfig = sailsConnections.connections[myConnection];
if (!connectionConfig) {
    throw new Error('Error: No connection found in config/connections.js!');
}

var connection = mysql.createConnection(connectionConfig);

connection.connect();

function ucwords(str) {
    return (str + '')
        .replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
            return $1.toUpperCase();
        });
}

function storeModel(tableName, attributes) {

    // TODO: De-Pluralize here
    // tableName = tableName.replace(/s$/, '');
    var modulePath = appDir + '/api/models/' + ucwords(tableName) + '.js';
    var controllerPath = appDir + '/api/controllers/' + ucwords(tableName) + 'Controller.js';

    if (fs.existsSync(modulePath)) {
        console.log('  ! Model ' + modulePath + ' exist!');
    } else {

        console.log('  + Creating: ' + modulePath);
        var exports = {
            attributes: attributes,
            tableName: tableName,
            migrate: 'safe',
            schema: true,
            autoCreatedAt: false,
            autoUpdatedAt: false
        };

        var fileContent = '/**\n' + '* ' + ucwords(tableName) + '.js\n' + '*\n' + '* @description :: CRUD Operations on \'users\' table\n' + '* @docs        :: http://sailsjs.org/#!documentation/models\n' + '*/\n\nmodule.exports = ' + JSON.stringify(exports, null, "\t").replace(/\"([^(\")"]+)\":/g, "$1:");
        //console.log(fileContent);
        fs.writeFile(modulePath, fileContent, function(err) {
            if (err) return console.log(err);
            console.log('  . Model ' + tableName + ' created');
        });

        var controllerContent = '/**\n' + '* ' + ucwords(tableName) + 'Controller\n' + '*\n' + '* @description :: Server-side logic\n' + '* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers\n' + '*/\n\n' + 'module.exports = {\n\n\n};\n';
        fs.writeFile(controllerPath, controllerContent, function(err) {
            if (err) return console.log(err);
            console.log('  . Controller ' + tableName + 'Controller created');
        });

    }
}

function describeTables() {
    var allTypes = [],
        typesMap = {
            int: 'integer',
            char: 'string',
            varchar: 'string',
            double: 'float'
        };
    myTables.forEach(function(tableName, index) {
        connection.query('describe ' + tableName, function(err, rows, fields) {
            if (err) throw err;
            console.log('*** Found: ' + tableName);
            var attributes = {};
            rows.forEach(function(row, index) {
                // console.log(row);
                fieldName = row.Field;
                var fieldType = 'string';
                var fieldSize = null;
                if (type = row.Type.match(/^(.+)\((.+)\)$/)) {
                    fieldType = type[1];
                    fieldSize = type[2] * 1;
                } else {
                    fieldType = row.Type;
                }
                if (typesMap[fieldType]) {
                    fieldType = typesMap[fieldType];
                }
                var fieldObject = {
                    type: fieldType
                };
                if (fieldType == 'enum') {
                    fieldObject.type = 'string';
                    fieldObject.enum = eval('[' + fieldSize + ']');
                    fieldSize = null;
                }
                if (fieldSize) {
                    fieldObject.size = fieldSize;
                }
                if (row.Default) {
                    fieldObject.defaultsTo = row.Default;
                }
                if (row.Null == 'NO') {
                    fieldObject.required = true;
                }
                if (row.Key == 'PRI') {
                    fieldObject.primaryKey = true;
                    fieldObject.unique = true;
                }
                if (row.Extra == 'auto_increment') {
                    fieldObject.autoIncrement = true;
                }
                if (fieldName.indexOf('email') > -1) {
                    fieldObject.type = 'email';
                }
                // console.log(fieldObject);
                if (allTypes.indexOf(fieldType) == -1) {
                    allTypes.push(fieldType);
                }
                attributes[fieldName] = fieldObject;
            });
            storeModel(tableName, attributes);
        });
    });
    connection.end();
}

function showTables() {
    connection.query('show tables', function(err, rows, fields) {
        if (err) throw err;
        var fieldName = fields[0].name;
        rows.forEach(function(val, index) {
            var tableName = val[fieldName];
            myTables.push(tableName);
        });
        describeTables();
    });
}

showTables();