"use strict";
var api_url = "http://api.discogs.com/releases/";
var mongoose = require('mongoose');
var db;
var newRecordAllModel;
var newRecordAllSchema = mongoose.Schema({
    link: String,
    cover_art: String,
    release_year: String,
    artist_name: String,
    title: String,
    date_added: String,
    number_for_sale: String,
}, { timestamps: { createdAt: 'created_at' } });
var db2 = mongoose.createConnection('mongodb://localhost/new_record_all', { useNewUrlParser: true });
var newRecordPurchasableModel;
var newRecordPurchasableSchema = mongoose.Schema({
    link: String,
    cover_art: String,
    release_year: String,
    artist_name: String,
    title: String,
    date_added: String,
    number_for_sale: String,
}, { timestamps: { createdAt: 'created_at' } });
mongoose.connect('mongodb://localhost/new_record_purchasable', { useNewUrlParser: true });
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
    //beginCollection();
});
//# sourceMappingURL=discogs_tracker.js.map