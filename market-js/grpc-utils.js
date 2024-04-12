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


// This function registers a file and user into the servers HashMap 
async function registerFile(call, callback) {
    console.log(call.request);
    let newUser = call.request.user;
    let cid = call.request.fileHash;
    console.log("------------------register file---------------------");
    console.log(`New User: ${newUser}`);
    console.log(`CID: ${cid}`);
    console.log("----------------end register file-------------------");
    callback(null, {});
}


async function checkHolders(call, callback) {
    const cid = call.request.fileHash;
    console.log("------------------check holders---------------------");

    try {
        console.log("key in the checkholders is "+cid);

        
        const keyEncoded = new TextEncoder('utf8').encode(cid);
        const value = await node.contentRouting.get(keyEncoded);
        const message = new TextDecoder('utf8').decode(value);
        const values = message.split('\n');

        const holders = [];

        values.forEach(user => {
            const userInfo = user.split('/')

            const foundUser = {
                id: userInfo[0],
                name: userInfo[1],
                ip: userInfo[2],
                port: userInfo[3],
                price: userInfo[4],
            };

            holders.push(foundUser);
        })

        // console.log(value);

        // console.log("PID of peer who has the file: " + values[0]);

        

        // console.log("PeerFound: ", node.peerRouting.findPeer(values[0]));

        
        

        // console.log("Users Found");
        // printHolders(holders);
        await callback(null, { holders: holders });

    } catch (error) {
        console.log("Wrong filehash or there is no file you may want");
        // console.log(error);
    }

}

  /**
   *  Creates a Grpc server with given target, registerFilefunction and checkHoldersFunction
   *  Params: target("ip:port"), registerFileFunction(function), checkHolderFunction(function)
   *  Return: grpc server
   */
function createGrpcServer(target, registerFileFunction , checkHoldersFunction){
    const server = new grpc.Server();
    server.addService(market_proto.Market.service, { RegisterFile: registerFileFunction, CheckHolders: checkHoldersFunction });
    server.bindAsync(target, grpc.ServerCredentials.createInsecure(), (error) => {
        // server.start();
        
    });

    return server;
}

  /**
   *  Creates a Grpc client with the given target("ip:port")
   *  Params: target("ip:port")
   *  Return: grpc client
   */
function createGrpcClient(target){
    return new market_proto.Market(target, grpc.credentials.createInsecure());
}


// Export the function
export {createGrpcServer, createGrpcClient};