"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var fs = __importStar(require("fs"));
var cheerio = __importStar(require("cheerio"));
var mongoose = require('mongoose');
var axios = require('axios');
require('dotenv').config({ path: '../.env' });
var api_url = "http://api.discogs.com/releases/";
var start_id;
var getNextAlbumErrorCount = 0;
var recordSchema = new mongoose_1.Schema({
    link: String,
    api_link: String,
    cover_art: String,
    release_year: Number,
    artist_name: String,
    genres: Array,
    styles: Array,
    title: String,
    date_added: String,
    number_for_sale: Number,
    lowest_price: Number
}, { timestamps: { createdAt: 'created_at' } });
var db = mongoose.connect(process.env.PURCHASABLE, { useNewUrlParser: true });
var db2 = mongoose.createConnection(process.env.NON_PURCHASABLE, { useNewUrlParser: true });
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
var recordModelBuy = db.model('new_record_purchasable', recordSchema);
var recordModelAll = db2.model('new_record_all', recordSchema);
db.once('open', function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            beginCollection();
            return [2 /*return*/];
        });
    });
});
function beginCollection() {
    return __awaiter(this, void 0, void 0, function () {
        var data, nextAlbum;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getStartID();
                    data = String(start_id);
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 8];
                    data = String(start_id);
                    fs.writeFileSync('./currentID', data);
                    return [4 /*yield*/, getNextAlbum()
                            .catch(function (errors) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log('Error in getdata(), waiting 5 minutes and trying again' + ' start_id = ' + start_id);
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(function () {
                                                //If caught up to the latest new ID, there will be a waiting period before the ID has been generated.
                                                //If trying the newest ID for 15 minutes does not work, add 3 to the ID.
                                                getNextAlbumErrorCount++;
                                                console.log("Error count: " + getNextAlbumErrorCount);
                                                if (getNextAlbumErrorCount >= 5)
                                                    start_id += 3;
                                                resolve(resolve);
                                            }, 300000); })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    nextAlbum = _a.sent();
                    if (!(nextAlbum !== undefined && nextAlbum["response"]["status"] === 200)) return [3 /*break*/, 7];
                    getNextAlbumErrorCount = 0;
                    start_id += 3;
                    console.log('Status 200: adding ' + nextAlbum["response"]["data"]["uri"] + ' ' + nextAlbum["response"]["data"]["title"] + ' ' + (nextAlbum["response"]["data"]["genres"] ? nextAlbum["response"]["data"]["genres"] : '') + (nextAlbum["cover"] !== "" ? ' with cover' : ' without cover') + ' and ' + nextAlbum["response"]["data"]["num_for_sale"] + ' for sale. ' + start_id);
                    console.log(nextAlbum["cover"]);
                    if (!(nextAlbum["response"]["data"]["num_for_sale"] === 0)) return [3 /*break*/, 4];
                    //Check latest record to see if it is now buyable. Add to buyable records if able.
                    //Maintain the total size of 5000 non-buyable records.
                    return [4 /*yield*/, retestTrimNotForSale()
                            .catch(function (errors) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        //If error, then the API link of the last record has been removed causing a 404 error, delete the record.
                                        console.log("Retest API link not found. Deleting record.");
                                        return [4 /*yield*/, recordModelAll.findOneAndDelete().sort({ "created_at": 1 })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 3:
                    //Check latest record to see if it is now buyable. Add to buyable records if able.
                    //Maintain the total size of 5000 non-buyable records.
                    _a.sent();
                    addAlbumToNotForSale(nextAlbum);
                    return [3 /*break*/, 7];
                case 4: return [4 /*yield*/, trimNotForSale()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, addAlbumToForSale(nextAlbum)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [3 /*break*/, 1];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function getStartID() {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            data = fs.readFileSync('./currentID', 'utf8');
            start_id = Number(data.toString());
            return [2 /*return*/];
        });
    });
}
function getNextAlbum() {
    return __awaiter(this, void 0, void 0, function () {
        var returnVars, _a, getCover, $;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    returnVars = {
                        "response": {},
                        "cover": ""
                    };
                    _a = returnVars;
                    return [4 /*yield*/, axios.get(api_url + String(start_id))];
                case 1:
                    _a.response = _b.sent();
                    if (!(returnVars.response !== null)) return [3 /*break*/, 3];
                    return [4 /*yield*/, axios.get(returnVars["response"]["data"]["uri"])];
                case 2:
                    getCover = _b.sent();
                    $ = cheerio.load(getCover.data);
                    returnVars.cover = $('picture').children('img').eq(0).attr('src');
                    if (returnVars.cover === undefined)
                        returnVars.cover = "";
                    _b.label = 3;
                case 3: return [2 /*return*/, returnVars];
            }
        });
    });
}
function retestTrimNotForSale() {
    return __awaiter(this, void 0, void 0, function () {
        var findCountNotForSale, latestNotForSaleRecord, purchasableResponse, getCoverRetry, $, cover;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, recordModelAll.collection.countDocuments({})];
                case 1:
                    findCountNotForSale = _a.sent();
                    console.log("findCountNotForSale: " + findCountNotForSale);
                    if (!(findCountNotForSale > 10000)) return [3 /*break*/, 10];
                    return [4 /*yield*/, recordModelAll.findOne().sort({ "created_at": 1 })];
                case 2:
                    latestNotForSaleRecord = _a.sent();
                    console.log("Retest checking: " + latestNotForSaleRecord["link"] + ' ' + latestNotForSaleRecord["created_at"]);
                    return [4 /*yield*/, axios.get(latestNotForSaleRecord["api_link"])];
                case 3:
                    purchasableResponse = _a.sent();
                    if (!(purchasableResponse["data"]["num_for_sale"] > 0)) return [3 /*break*/, 7];
                    console.log("Retest found new quantity: " + purchasableResponse["data"]["title"] + ' ' + purchasableResponse["data"]["num_for_sale"]);
                    return [4 /*yield*/, trimNotForSale()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, axios.get(purchasableResponse.data["uri"])];
                case 5:
                    getCoverRetry = _a.sent();
                    $ = cheerio.load(getCoverRetry.data);
                    cover = $('picture').children('img').eq(0).attr('src');
                    if (cover === undefined)
                        cover = "";
                    console.log(cover);
                    return [4 /*yield*/, recordModelBuy.create({
                            link: purchasableResponse["data"]["uri"],
                            api_link: purchasableResponse["data"]["resource_url"],
                            cover_art: (cover !== undefined) ? cover : ' ',
                            release_year: purchasableResponse["data"]["year"],
                            artist_name: purchasableResponse["data"]["artists"]["name"],
                            genres: purchasableResponse["data"]["genres"],
                            styles: purchasableResponse["data"]["styles"],
                            title: purchasableResponse["data"]["title"],
                            date_added: purchasableResponse["data"]["date_added"],
                            number_for_sale: purchasableResponse["data"]["num_for_sale"],
                            lowest_price: purchasableResponse["data"]["lowest_price"],
                        }, function (err, release) {
                            if (err)
                                return console.error(err);
                        })];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    console.log("Retest still shows 0 available: " + purchasableResponse["data"]["title"] + ' ' + purchasableResponse["data"]["num_for_sale"]);
                    _a.label = 8;
                case 8: return [4 /*yield*/, recordModelAll.findOneAndDelete().sort({ "created_at": 1 })];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    });
}
function addAlbumToNotForSale(nextAlbum) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, recordModelAll.create({
                        link: nextAlbum["response"]["data"]["uri"],
                        api_link: nextAlbum["response"]["data"]["resource_url"],
                        cover_art: (nextAlbum["cover"] !== undefined) ? nextAlbum["cover"] : ' ',
                        release_year: nextAlbum["response"]["data"]["year"],
                        artist_name: nextAlbum["response"]["data"]["artists"]["name"],
                        genres: nextAlbum["response"]["data"]["genres"],
                        styles: nextAlbum["response"]["data"]["styles"],
                        title: nextAlbum["response"]["data"]["title"],
                        date_added: nextAlbum["response"]["data"]["date_added"],
                        number_for_sale: nextAlbum["response"]["data"]["num_for_sale"],
                        lowest_price: nextAlbum["response"]["data"]["lowest_price"],
                    }, function (err, release) {
                        if (err)
                            return console.error(err);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function addAlbumToForSale(nextAlbum) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, recordModelBuy.create({
                        link: nextAlbum["response"]["data"]["uri"],
                        api_link: nextAlbum["response"]["data"]["resource_url"],
                        cover_art: (nextAlbum["cover"] !== undefined) ? nextAlbum["cover"] : ' ',
                        release_year: nextAlbum["response"]["data"]["year"],
                        artist_name: nextAlbum["response"]["data"]["artists"]["name"],
                        genres: nextAlbum["response"]["data"]["genres"],
                        styles: nextAlbum["response"]["data"]["styles"],
                        title: nextAlbum["response"]["data"]["title"],
                        date_added: nextAlbum["response"]["data"]["date_added"],
                        number_for_sale: nextAlbum["response"]["data"]["num_for_sale"],
                        lowest_price: nextAlbum["response"]["data"]["lowest_price"],
                    }, function (err, release) {
                        if (err)
                            return console.error(err);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function trimNotForSale() {
    return __awaiter(this, void 0, void 0, function () {
        var findCountForSale;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, recordModelBuy.collection.countDocuments({})];
                case 1:
                    findCountForSale = _a.sent();
                    if (findCountForSale > 5000) {
                        recordModelBuy.findOneAndDelete().sort({ "created_at": 1 });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=discogs_tracker.js.map