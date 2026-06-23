const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/test_db');
  const db = mongoose.connection.db;
  await db.collection('test').deleteMany({});
  await db.collection('test').insertMany([
    { distance: "1.5 km" },
    { distance: "500 m" },
    { distance: "~ 2.1km" },
    { distance: "3.2 km" }
  ]);
  
  const results = await db.collection('test').aggregate([
    {
      $addFields: {
        rawStr: { $toLower: "$distance" }
      }
    },
    {
      $addFields: {
        isKm: { $ne: [{ $indexOfCP: ["$rawStr", "km"] }, -1] },
        cleanStr: { 
          $trim: { 
            input: { 
              $replaceAll: { 
                input: { $replaceAll: { input: { $replaceAll: { input: "$rawStr", find: "~", replacement: "" } }, find: "km", replacement: "" } },
                find: "m", replacement: "" 
              } 
            }
          } 
        }
      }
    },
    {
      $addFields: {
        numericVal: { $convert: { input: "$cleanStr", to: "double", onError: 999, onNull: 999 } }
      }
    },
    {
      $addFields: {
        finalDistance: {
          $cond: {
            if: { $eq: ["$isKm", false] },
            then: { $divide: ["$numericVal", 1000] },
            else: "$numericVal"
          }
        }
      }
    },
    { $sort: { finalDistance: 1 } }
  ]).toArray();
  
  console.log(results);
  process.exit(0);
}
test().catch(console.error);
