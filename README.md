InvaNode-mongo
==============

CMS based on Node.js and MongoDB.

InvaNode official site: [invanode.org](http://www.invanode.org)

## Description

InvaNode is a simple CMS. It has base functionality for simple web-site with manageable content and template engine.

It is light and easy customizable.


## Instalation

You have to install [node.js](https://github.com/joyent/node) with npm first. Just make sure you have lates version of node.js.

You will need to install MongoDB native driver (OR there is <a href="https://github.com/i-vetrov/InvaNode/">mysql version of InvaNode CMS</a>):

      npm install mongodb

And iskvs lib: 

      npm install iskvs

(Or just enter folder with Invanode and install package dependencies: `npm install`)

Then clone InvaNode sources:
    
      git clone git://github.com/i-vetrov/InvaNode-mongo.git

Edit options.js to set up database connection and some site description.

Add some info to your database (mongodb console):
      
      use invanode

      db.users.save({ "_id" : 1, "level" : 0, "name" : "admin", "password" : "21232f297a57a5a743894a0e4a801fc3", "penname" : "John Doe", "session_hash" : "98c839b79146591f366d7d87421ab949" })

      db.counters.save({ "_id" : "users", "num" : 1 })

      db.counters.save({ "_id" : "pages", "num" : 0 })

      db.counters.save({ "_id" : "posts", "num" : 0 })

      db.counters.save({ "_id" : "categories", "num" : 0 })


 to create empty database with user "admin" and password "admin". Don't forget to change password when instalation is done!

## More information

Visit [invanode.org](http://www.invanode.org) website to read some news and get help.

## Who uses InvaNode

[invatechs.com](http://www.invatechs.com/)

[invanode.org](http://www.invanode.org/)

## Licence ##

The MIT License

Copyright (c) 2013 Ivan Vetrau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.