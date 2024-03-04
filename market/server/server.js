/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

var PROTO_PATH = '../market.proto';

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
var userFileMap = new Map();

// Function that prints the HashMap
function printMarket() {
console.log("---------------inside printMarket--------------------");  
  // Market.forEach(file => {
  //   console.log(file);
  // })
  // console.log("\n");
  // console.log("\n");
  userFileMap.forEach(function (value, key) {
    console.log(key + ": { id: " + value[0].id
      + ", name: " + value[0].name
      + ", ip: " + value[0].ip
      + " port: " + value[0].port
      + " price: " + value[0].price + " }");
  })

  console.log(userFileMap);

  // for (let [key, value] of userFileMap) {
  //   console.log(key + ": { id: " + value.id
  //     + ", name: " + value.name
  //     + ", ip: " + value.ip
  //     + " port: " + value.port
  //     + " price: " + value.price + " }");
  // }
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

  // console.log("test");
}

// CheckHolders should take a fileHash and looks it up in the hashmap and returns the list of users
function checkHolders(call, callback) {
  console.log("-----------------check holders----------------------");
  const fileHash = call.request.fileHash;

  const user = userFileMap.get(fileHash)
  
  const holders = []
  holders.push(user);

  for (let [key, value] of userFileMap) {
    console.log(key + " is " + value[0].name);
}

  // const response = new market_proto.HoldersResponse();
  // response.holders = user; 
  // console.log(`User got: ${user}`);
  console.log("Users Found");
  printHolders(holders);
  callback(null, {holders: holders});
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  const server = new grpc.Server();
  server.addService(market_proto.Market.service, { RegisterFile: registerFile, CheckHolders: checkHolders });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });

  // TODO: Might need to change map into a multiMap that allows multiple values for keys so that there are 
  // multiple users for the same hash if those users also own the file 

}


main();
