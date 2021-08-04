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
var mongoose = require('mongoose');
var axios = require('axios');
var api_url = "http://api.discogs.com/releases/";
var start_id;
var recordSchema = new mongoose_1.Schema({
    link: String,
    api_link: String,
    cover_art: String,
    release_year: String,
    artist_name: String,
    genres: Array,
    styles: Array,
    title: String,
    date_added: String,
    number_for_sale: String,
    lowest_price: String
}, { timestamps: { createdAt: 'created_at' } });
var db = mongoose.connect('mongodb://localhost/new_record_purchasable', { useNewUrlParser: true });
var db2 = mongoose.createConnection('mongodb://localhost/new_record_all', { useNewUrlParser: true });
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
    beginCollection();
});
function beginCollection() {
    return __awaiter(this, void 0, void 0, function () {
        var interval;
        return __generator(this, function (_a) {
            initialCollection();
            interval = setInterval(function () {
                return __awaiter(this, void 0, void 0, function () {
                    var data;
                    return __generator(this, function (_a) {
                        start_id += 3;
                        data = fs.readFileSync('./currentID', 'utf8');
                        data = String(start_id);
                        fs.writeFileSync('./currentID', data);
                        try {
                            getData();
                        }
                        catch (err) {
                            setTimeout(function () { getData(); }, 600000);
                        }
                        return [2 /*return*/];
                    });
                });
            }, 3000);
            return [2 /*return*/];
        });
    });
}
function initialCollection() {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            data = fs.readFileSync('./currentID', 'utf8');
            start_id = Number(data.toString());
            getData();
            return [2 /*return*/];
        });
    });
}
function getData() {
    return __awaiter(this, void 0, void 0, function () {
        var recordModelBuy, recordModelAll, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    recordModelBuy = db.model('new_record_purchasable', recordSchema);
                    recordModelAll = db2.model('new_record_all', recordSchema);
                    return [4 /*yield*/, axios.get(api_url + String(start_id))];
                case 1:
                    response = _a.sent();
                    console.log(response.data);
                    if (response.data["num_for_sale"] === 0) {
                        recordModelAll.create({
                            link: response.data["uri"],
                            api_link: response.data["resource_url"],
                            cover_art: "test",
                            release_year: response.data["year"],
                            artist_name: response.data["artists"]["name"],
                            genres: response.data["genres"],
                            styles: response.data["styles"],
                            title: response.data["title"],
                            date_added: response.data["date_added"],
                            number_for_sale: response.data["num_for_sale"],
                            lowest_price: response.data["lowest_price"],
                        }, function (err, release) {
                            if (err)
                                return console.error(err);
                        });
                    }
                    else {
                        recordModelBuy.create({
                            link: response.data["uri"],
                            api_link: response.data["resource_url"],
                            cover_art: "test",
                            release_year: response.data["year"],
                            artist_name: response.data["artists"]["name"],
                            genres: response.data["genres"],
                            styles: response.data["styles"],
                            title: response.data["title"],
                            date_added: response.data["date_added"],
                            number_for_sale: response.data["num_for_sale"],
                            lowest_price: response.data["lowest_price"],
                        }, function (err, release) {
                            if (err)
                                return console.error(err);
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=discogs_tracker.js.map