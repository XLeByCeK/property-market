"use strict";
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var prisma_1 = require("./prisma");
function fixTransactionTypes() {
    return __awaiter(this, void 0, void 0, function () {
        var existingTypes, saleType, newSaleType, updatedSaleType, rentType, newRentType, updatedRentType, updatedTypes, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting transaction type fix script...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 14, , 15]);
                    console.log('Checking transaction types...');
                    return [4 /*yield*/, prisma_1.default.transaction_type.findMany()];
                case 2:
                    existingTypes = _a.sent();
                    console.log('Existing transaction types:', existingTypes);
                    saleType = existingTypes.find(function (type) {
                        return type.name.toLowerCase() === 'продажа' ||
                            type.name.toLowerCase() === 'sale';
                    });
                    console.log('Found sale type:', saleType);
                    if (!!saleType) return [3 /*break*/, 4];
                    console.log('Creating "Продажа" transaction type');
                    return [4 /*yield*/, prisma_1.default.transaction_type.create({
                            data: { name: 'Продажа' }
                        })];
                case 3:
                    newSaleType = _a.sent();
                    console.log('Created new sale type:', newSaleType);
                    return [3 /*break*/, 7];
                case 4:
                    if (!(saleType.name.toLowerCase() === 'sale')) return [3 /*break*/, 6];
                    console.log('Updating "Sale" to "Продажа"');
                    return [4 /*yield*/, prisma_1.default.transaction_type.update({
                            where: { id: saleType.id },
                            data: { name: 'Продажа' }
                        })];
                case 5:
                    updatedSaleType = _a.sent();
                    console.log('Updated sale type:', updatedSaleType);
                    return [3 /*break*/, 7];
                case 6:
                    console.log("Sale type already exists as '".concat(saleType.name, "', no changes needed"));
                    _a.label = 7;
                case 7:
                    rentType = existingTypes.find(function (type) {
                        return type.name.toLowerCase() === 'аренда' ||
                            type.name.toLowerCase() === 'rent';
                    });
                    console.log('Found rent type:', rentType);
                    if (!!rentType) return [3 /*break*/, 9];
                    console.log('Creating "Аренда" transaction type');
                    return [4 /*yield*/, prisma_1.default.transaction_type.create({
                            data: { name: 'Аренда' }
                        })];
                case 8:
                    newRentType = _a.sent();
                    console.log('Created new rent type:', newRentType);
                    return [3 /*break*/, 12];
                case 9:
                    if (!(rentType.name.toLowerCase() === 'rent')) return [3 /*break*/, 11];
                    console.log('Updating "Rent" to "Аренда"');
                    return [4 /*yield*/, prisma_1.default.transaction_type.update({
                            where: { id: rentType.id },
                            data: { name: 'Аренда' }
                        })];
                case 10:
                    updatedRentType = _a.sent();
                    console.log('Updated rent type:', updatedRentType);
                    return [3 /*break*/, 12];
                case 11:
                    console.log("Rent type already exists as '".concat(rentType.name, "', no changes needed"));
                    _a.label = 12;
                case 12: return [4 /*yield*/, prisma_1.default.transaction_type.findMany()];
                case 13:
                    updatedTypes = _a.sent();
                    console.log('Updated transaction types:', updatedTypes);
                    console.log('Transaction types fixed successfully!');
                    return [3 /*break*/, 15];
                case 14:
                    error_1 = _a.sent();
                    console.error('Error fixing transaction types:', error_1);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
// Execute the function
fixTransactionTypes().then(function () {
    console.log('Script completed');
    process.exit(0);
}).catch(function (error) {
    console.error('Script failed:', error);
    process.exit(1);
});
