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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("./prisma"));
function fixTransactionTypes() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting transaction type fix script...');
        try {
            console.log('Checking transaction types...');
            // First get all existing transaction types
            const existingTypes = yield prisma_1.default.transaction_type.findMany();
            console.log('Existing transaction types:', existingTypes);
            // Check if we have a type with name 'Продажа'
            const saleType = existingTypes.find(type => type.name.toLowerCase() === 'продажа' ||
                type.name.toLowerCase() === 'sale');
            console.log('Found sale type:', saleType);
            // If no sale type exists, create it
            if (!saleType) {
                console.log('Creating "Продажа" transaction type');
                const newSaleType = yield prisma_1.default.transaction_type.create({
                    data: { name: 'Продажа' }
                });
                console.log('Created new sale type:', newSaleType);
            }
            // If we have a "Sale" type but need to rename it to Russian
            else if (saleType.name.toLowerCase() === 'sale') {
                console.log('Updating "Sale" to "Продажа"');
                const updatedSaleType = yield prisma_1.default.transaction_type.update({
                    where: { id: saleType.id },
                    data: { name: 'Продажа' }
                });
                console.log('Updated sale type:', updatedSaleType);
            }
            else {
                console.log(`Sale type already exists as '${saleType.name}', no changes needed`);
            }
            // Check if we have a type with name 'Аренда'
            const rentType = existingTypes.find(type => type.name.toLowerCase() === 'аренда' ||
                type.name.toLowerCase() === 'rent');
            console.log('Found rent type:', rentType);
            // If no rent type exists, create it
            if (!rentType) {
                console.log('Creating "Аренда" transaction type');
                const newRentType = yield prisma_1.default.transaction_type.create({
                    data: { name: 'Аренда' }
                });
                console.log('Created new rent type:', newRentType);
            }
            // If we have a "Rent" type but need to rename it to Russian
            else if (rentType.name.toLowerCase() === 'rent') {
                console.log('Updating "Rent" to "Аренда"');
                const updatedRentType = yield prisma_1.default.transaction_type.update({
                    where: { id: rentType.id },
                    data: { name: 'Аренда' }
                });
                console.log('Updated rent type:', updatedRentType);
            }
            else {
                console.log(`Rent type already exists as '${rentType.name}', no changes needed`);
            }
            // Get the updated list to confirm changes
            const updatedTypes = yield prisma_1.default.transaction_type.findMany();
            console.log('Updated transaction types:', updatedTypes);
            console.log('Transaction types fixed successfully!');
        }
        catch (error) {
            console.error('Error fixing transaction types:', error);
        }
    });
}
// Execute the function
fixTransactionTypes().then(() => {
    console.log('Script completed');
    process.exit(0);
}).catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
});
