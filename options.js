/**
 * @license InvaNode CMS v0.1.2
 * https://github.com/i-vetrov/InvaNode
 * https://github.com/i-vetrov/InvaNode-mongo
 *
 * Author: Ivan Vetrau (http://www.invatechs.com/)
 *
 * Copyright (C) 2013 Ivan Vetrau 
 * Licensed under the MIT license (MIT)
 **/

// InvaNode core options
//
// Fill in pretty standard options with your web site name, title, description,
// and don't forget to add information about your database 
//
exports.vars = new Object({
      title: 'InvaNode CMS',
      appName: 'InvaNode CMS',
      siteUrl: 'http://192.168.0.102/',
      indexDescription: 'IvaNode - open source blogging content management system based on Node.js',
      dbHost: 'localhost',
      dbName: 'invanode',
      dbUser: '',
      dbPass: '',
      dbPort: 27017,
      serverListenPort: 80,
      serverListenIP: '192.168.0.102' 
});

//
// Possible variables in routing graph:
//
// :alias      - post alias
// :id         - post id
// :year       - the year of post creating (e.g. '2013')
// :monthnum   - the month number of post creating (e.g. '03' for march)
// :day        - the day of the month when post was created
// :category   - category name
// 
// ****N.B.!     Routing graph has to finish with :alias!      N.B.!****
//
exports.routingGraph = ':category/:year/:monthnum/:day/:alias';


//
// Set up the number of posts per page for pagination
// (set to Infinity to avoid limitation, if you really need this):
//
exports.numPostPerPage = 5;

//
// Set up the filename of script which is loaded for admin panel
// Standart options: 'a_template.html', 'a_template-adv.html'
// a_template.html      - with WYSIWYG editor for pages and posts
// a_template-adv.html  - with splid HTML editor for pages and posts
//

exports.adminTemplate = 'a_template.html';