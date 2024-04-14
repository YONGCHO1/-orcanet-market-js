/**
 * Note: This is a centralized server implementation where there is only 1 instance of a grpc server
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);

var PROTO_PATH = './market.proto';

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
var market_proto = grpc.loadPackageDefinition(packageDefinition).market;

// Map that stores User and hash
var userFileMap = new Map()


// Function that prints the HashMap
function printMarket() {
  console.log("---------------inside printMarket-------------------");  
  
    userFileMap.forEach(function (value, key) {
      console.log(key + ": { id: " + value[0].id
        + ", name: " + value[0].name
        + ", ip: " + value[0].ip
        + " port: " + value[0].port
        + " price: " + value[0].price + " }");
    })
  }
  
  function printHolders(hold) {
    console.log("---------------inside printHolders--------------------");
    console.log(hold);
  }

// This function registers a file and user into the servers HashMap 
function registerFile(call, callback) {

    let newUser = call.request.user;
    let fileHash = call.request.fileHash;
    console.log("------------------register file---------------------");
  
    let multi = [];
    multi.push(newUser);
  
    
    // old way to add data
    if (userFileMap.has(fileHash)) {
      console.log("File already exist");
      
      let newMap = multi.concat(userFileMap.get(fileHash));
      
      userFileMap.set(fileHash, newMap);
    }
    else {
      console.log("File doesn't exist");
      userFileMap.set(fileHash, multi);
    }
  
    printMarket();
    callback(null, {
      message: "File " + fileHash + " from " + newUser.name + "'s "
        + newUser.ip + ":" + newUser.port + " with price: $"
        + newUser.price + " per MB added successfully"
    }); // ?
  
  }
  
  
  // CheckHolders should take a fileHash and looks it up in the hashmap and returns the list of users
  function checkHolders(call, callback) {
    console.log("------------------check holders----------------------");
    const fileHash = call.request.fileHash;
    const user = userFileMap.get(fileHash);
    
    const holders = [];
  
    user.forEach(x => {
      holders.push(x);
    })
  
    console.log("Users Found");
    printHolders(holders);
    callback(null, {holders: holders});
  }

/**
 * Creates and starts a GRPC server
 * Note: This function has not been tested yet but should work since its taken from the centralized version we complete
 */
function createCentralizedGrpcServer(){
    const server = new grpc.Server();
    server.addService(market_proto.Market.service, { RegisterFile: registerFile, CheckHolders: checkHolders });
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    //   server.start();
    });
    return server;
}

// Export the function
export {createCentralizedGrpcServer};