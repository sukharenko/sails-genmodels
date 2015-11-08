## Sails Models Generator from Existing MySQL Database


### Before use

Please, make sure you have following:

In file **\<projectDir\>/config/connections.js**:
~~~json
localMySQL: {
    adapter: 'sails-mysql',
    host: 'localhost',
    user: 'superuser',
    password: 'superpassword',
    database: 'your_database'
},
~~~

In file **\<projectDir\>/config/models.js**:
~~~json
connection: 'localMySQL',
migrate: 'safe'
~~~

Actual name of your connection may vary, but both must be set!


### Install and use

~~~bash
cd <your_project_dir>
git clone git@github.com:sukharenko/sails-genmodels.git
cd sails-genmodels
npm install
cd ..
node sails-genmodels/genmodels.js
~~~

That's it!

As result you will get files in api/models and api/controllers named according to your tables. For example for table named 'countries' you will get:
* api/controllers/CountriesController.js
* api/models/Countries.js

If for some reason you already have model with same name - it will be ignored!
As same time - if you already have controller with same name, but don't have model - model will be created and controller will be overridden!


### Contributions

Please, fell free to fork project and send me a pull-requests.


### Copyright

Yevgen 'Scorp' Sukharenko <<ysukharenko@gmail.com>>
http://sukharenko.com


