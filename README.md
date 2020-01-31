Telugu Premier League
========================

Simple project to generate profiles based on categories 

 * generate simple database of players registered for the tournament
 * get image data, player strengths, stats and availability  
 * Advance features ability to conduct auctions 



Prerequisites
-------------

The server relies on mongodb for persistent storage.

Running
-------

    npm install
    npm start

Access http://localhost:8001


Wiping the catalogue
--------------------

For test purposes, the catalogue may be wiped with

    node dropdb.js

