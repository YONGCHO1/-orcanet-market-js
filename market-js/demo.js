import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { createLibp2p } from 'libp2p'
import { bootstrap } from '@libp2p/bootstrap'
import { tcp } from '@libp2p/tcp'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { kadDHT } from '@libp2p/kad-dht'
import { mdns } from '@libp2p/mdns'
import { multiaddr } from '@multiformats/multiaddr'
import {create} from 'ipfs-core';
import { CID } from 'multiformats/cid';
import * as Block from 'multiformats/block'
import * as codec from 'multiformats/codecs/json'

const bootstrapPeers = ['/dnsaddr/sg1.bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'];

// Imports from our js export files
import { createNewNode, getTargetFromNode, printNodeInfo} from "./market-utils.js";
import { createGrpcClient } from "./grpc-utils.js";

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

// Importing the built-in 'readline' module
const readline = require('readline');
// const CID = require('multiformats/cid');
const multihashing = require('multihashing-async');
var multihash = require('multihashes')

// Creating an interface for reading from the command line
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// This function registers a file and user into the servers HashMap 
async function registerFile(call, callback) {
    // console.log(node);
    console.log(call.request);
    // console.log(node);
    // console.log(call);

    let newUser = call.request.user;
    let cid = call.request.fileHash;
    console.log("------------------register file---------------------");
    

    // const keyEncoded = new TextEncoder('utf8').encode(cid);
    // // console.log("Encoded?");
    // const userInfo = `${newUser.id}/${newUser.name}/${newUser.ip}/${newUser.port}/${newUser.price}`;
    // const valueEncoded = new TextEncoder('utf8').encode(userInfo);
    // // console.log("Encoded2?");

    // // const hash = await multihash.encode(keyEncoded, 'sha2-256');

    // // // const hash = await multihashing(keyEncoded, 'sha2-256');
    // console.log("input value is "+ cid);

    // // store the key and value in kadDHT
    // try {
    //     const exist = await node.contentRouting.get(keyEncoded);

    //     console.log("The File already exist");
    //     const existingUserStr = new TextDecoder('utf8').decode(exist);
    //     const values = existingUserStr.split('/');

    //     // console.log(value);

    //     // console.log("PID of peer who has the file: " + values[0]);

    //     // Same User
    //     if (value[0] == node.Id) {
    //         console.log("Same User try to upload existing file");
    //         if (values[3] == newUser.price) {
    //             console.log("You already uploaded same file with same price");
    //         }
    //         else {
    //             // change the price in new User
    //         }
    //     }
        
    //     // Different User
    //     else {
    //         const newValue = existingUserStr+"\n"+userInfo;
    //         const newValueEncoded = new TextEncoder('utf8').encode(newValue);
    //         await node.contentRouting.put(keyEncoded, newValueEncoded);
    //         let multi = [];
    //         multi.push(newUser);

    //     }
    // }
    // catch (error) {
    //     console.log("First time to upload the file");
    //     await node.contentRouting.put(keyEncoded, valueEncoded);
    // }
    

    // const value = await node.contentRouting.get(keyEncoded);
    // const message = new TextDecoder('utf8').decode(value);


    //response.callback(newUser);

    // const hash = await multihashing(keyEncoded, 'sha2-256');
    // const cid = new CID(1, 'dag-pb', hash);
    // console.log(cid.toString());
    // console.log(cid.multihash);
    // console.log(cid.version);


    // console.log("Before Encode3");
    // await node.contentRouting.provide(cid);
    // console.log("Encoded3");

    // console.log("Key Encoded: ", keyEncoded);

    // console.log("Value you stored: \n" + message);
    // console.log("Successfully Registered File");

    // for await (const provider of providers) {
    //     console.log("Provider: ", provider);
    // }

    
    console.log(`New User: ${newUser}`);
    console.log(`CID: ${cid}`);
    console.log("----------------end register file-------------------");
    callback(null, {});

    // const keyEncoded = new TextEncoder().encode(cid)
    // const userInfo = `${newUser.id}/${newUser.name}/${newUser.ip}/${newUser.port}/${newUser.price}`;
    // // console.log(userInfo);
    // // Encode the userInfo as the value to be put in
    // const valueEncoded = new TextEncoder().encode(userInfo);
    // // call nodes put function to put k/v in thats encoded
    // await node.contentRouting.put(keyEncoded, valueEncoded);
    // // get the value back to see if it worked using the encoded key
    // const value = await node.contentRouting.get(keyEncoded);
    // const message = new TextDecoder().decode(value);
    // // Print the message after decoding it 
    // console.log("Value you stored: \n" + message);

    // putOrUpdateKeyValue(node, cid, multi);
}

// Put or update values to corresponding key
async function putOrUpdateKeyValue(node, cid, value) {
    const valueArr = new Uint8Array([value]);
    const cidArr = new Uint8Array([cid]);

    // await node.contentRouting.get(cidArr, async (err, existingValue) => {
    //     // The key(CID) doesn't exist in DHT node
    //     if (err) {
    //         console.log('First time to register the file');
    // node.contentRouting.put(cidArr, valueArr, (err) => {
    //     if (err) {
    //     console.error('Error registering value:', err);
    //     } 
    //     else {
    //     console.log('Value uploaded successfully for key', cid);
    //     }
    // })
    // } 

    // The key(CID) exists in DHT node
    // else {
    // Update existing value with new value (might be needed to change to add with existing value)
    //   const updatedValue = Array.isArray(existingValue) ? [...existingValue, ...value] : [existingValue, ...value];
    //   await node.contentRouting.put(cidArr, updatedValue, (err) => {
    //     if (err) {
    //       console.error('Error updating value:', err);
    //     } 
    //     else {
    //       console.log('Value updated successfully for key', cid);
    //     }
    //   });
    // }
    // });
}

// Check provider based on provided key
function checkProvider(node, cid) {
    node.contentRouting.get(cid, (err, existingValue) => {
        // The key(CID) doesn't exist in DHT node
        if (err) {
            console.error('Error retrieving existing value:', err);
            return;
        }

        // The key(CID) exists in DHT node
        else {
            return existingValue;
        }
    });
}


greet();


function greet() {

    // Prompting the user for input
    rl.question('Enter "start" to join the network\n', async (input) => {
        // Processing the user input
        if (input == "start") {
            // Create new node and start it
            const node = await createNewNode();
            let target = getTargetFromNode(node);
            // node.peerRouting.getClosestPeers


            // node.contentRouting.provide

            // node.peerStore
            // node.contentRouting



            // node.addEventListener('peer:connect', async (event) => {
            //     console.log(event.detail);
                
            //     console.log(event.detail.multihash);
            //     console.log(node.contentRouting.datastore);
            //     const peerInfo = event.detail;
            //     const peer = await node.peerRouting.findPeer(peerInfo);
            //     console.log(peer);
            //     // node.peerStore.save(peerInfo);
            //     // console.log('A Peer ID ' + peerInfo + ' Connected with us!');
                
            // });



            // node.getPeers
            // node.peerStore.save

            // node.contentRouting.provide

            const server = new grpc.Server();
            server.addService(market_proto.Market.service, { RegisterFile: registerFile, CheckHolders: checkHolders });
            server.bindAsync(target, grpc.ServerCredentials.createInsecure(), (error) => {
                // server.start();
                
            });

            // server.

            async function checkHolders(call, callback) {
                const cid = call.request.fileHash;
                console.log("------------------check holders---------------------");

                try {
                    console.log("key in the checkholders is "+cid);

                    // for await (const peer of node.peerRouting.getClosestPeers(key)) {
                    //     console.log(peer.id, peer.multiaddrs)
                    // }
                    
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
            // console.log(`Target is: ${target}`);

            console.log("Joined Network");
            // printNodeInfo(node);
            options(node, target);
            // rl.close();
        } else {
            console.log("Invalid Input: Try again!");
            greet();
        }

        // Closing the interface
    });
}

function options(node, target) {
    rl.question('Available options for user in Network:\n"info": displays node information\n"connect": connect to another node in the network\n"add": adds a file to the network\n"get": gets a file from the network\n"exit": exit the network\n', async (input) => {
        if (input == "info") {
            printNodeInfo(node);
            options(node, target);
        } 
        else if (input == "connect") {
            connect(node, target);
        } 
        else if (input == "add") {
            add(node, target);
        }
        else if (input == "get") {
            get(node, target);
        }
        else if (input == "exit") {
            console.log("Leaving Network");
            await node.stop();
            rl.close();
            process.exit(1);
        }
        else {
            console.log("Invalid Input: Try again!");
            options(node, target);
        }
    });
}

function connect(node, target) {
    rl.question('Enter address of node you want to connect to\n', async (input) => {
        //TODO: when address is entered dial that address and if it works say it was successful

        // const peers = [];

        bootstrapPeers.push(input);

        const bootstrapAddresses = await Promise.all(bootstrapPeers.map(async (addr) => {
            // console.log("get into bootstrap function");
            try {
                // console.log("get into try");
                // console.log(addr);
                const peerAddr = multiaddr(addr);
                const peerInfo = await node.dial(peerAddr, {
                    signal: AbortSignal.timeout(10_000)
                });

                console.log('Connected to bootstrap peer:', peerAddr.getPeerId()); //peerInfo.id.toString());
                return peerInfo;
            } catch (error) {
                console.error('Failed to connect to bootstrap peer:', error);
                return null;
            }
        }));
        options(node, target);
    });
}

// const CID = require('cids');
// // const multihashing = require('multihashing-async');
// var multihash = require('multihashes')

function add(node, target) {
    rl.question('Enter file that you want to add to the network\n', async (input) => {
        //TODO: have user input info to add file and use proto and grpc to add the file like we did in centralized i guess?
        var client = createGrpcClient(target);


        // console.log(`input value is ${input}`);

        let input_values = input.split(' ');
        // console.log(input_values[0]);

        let my_ip;
        let my_port;

        const multiaddresses = node.getMultiaddrs();
        multiaddresses.forEach(addr => {
            let addrs = addr.toString();
            let addr_info = addrs.split('/');
            my_ip = addr_info[2];
            my_port = addr_info[4];
        });

        var newUser = {
            id: node.peerId, // will be replaced by id given from Peer Node team
            name: input_values[1],
            ip: my_ip,
            port: my_port,
            price: input_values[2],
        }

        const keyEncoded = new TextEncoder('utf8').encode(input_values[0]);
        // console.log("Encoded?");
        const userInfo = `${newUser.id}/${newUser.name}/${newUser.ip}/${newUser.port}/${newUser.price}`;
        const valueEncoded = new TextEncoder('utf8').encode(userInfo);

        console.log("input value is "+ input_values[0]);

        // const ipfs = await create();

        // // Add content to IPFS and get the CID
        // const content = Buffer.from(input_values[0]);
        // const { cid } = await ipfs.add(content)
        // new CID(input_values[0])
        
        // const hash = await multihashing(keyEncoded, 'sha2-256');

        const hash = await multihashing(keyEncoded, 'sha2-256');
        console.log("pass hashing")
        // const cid = new CID(0, 'dag-pb', hash);
        const cid = CID.create(0, 112, hash);
        console.log('CID:'+ cid.toString())
        console.log("type of cid is " + typeof cid.toString());
        



        // store the key and value in kadDHT
        try {
            console.log("get into try");
            console.log(`node Id checking: ${node.peerId}`);
            console.log(keyEncoded);

            // peerList.forEach(async peer => {
            const exist = await node.contentRouting.get(keyEncoded);
            // })

            

            console.log("The File already exist");
            const existingUserStr = new TextDecoder('utf8').decode(exist);
            const values = existingUserStr.split('/');

            // console.log(value);

            // console.log("PID of peer who has the file: " + values[0]);

            // Same User
            console.log(`value: ${values[0]}`);
            console.log(`node Id: ${node.peerId}`);
            if (values[0] == node.peerId) {
                console.log("Same User try to upload existing file");
                if (values[3] == newUser.price) {
                    console.log("You already uploaded same file with the same price");
                }
                else {
                    // change the price in new User. Need to Update User value.
                }
            }
            
            // Different User
            else {
                const newValue = existingUserStr+"\n"+userInfo;
                const newValueEncoded = new TextEncoder('utf8').encode(newValue);
                await node.contentRouting.put(keyEncoded, newValueEncoded);
                client.registerFile({ user: newUser, fileHash: input_values[0] }, function (err, response){});
            }
        }
        catch (error) {
            console.log("err is " + error);
            console.log("First time to upload the file");
            // node.peerStore.forEach(async (peer) => {
            //     console.log()
            //     await peer.contentRouting.put(keyEncoded, valueEncoded)
            // })
            // await node.contentRouting.provide(new CID(content));
            // await node.contentRouting.provide( CID.parse(input_values[0]));
            CID.
            console.log("before provide");
            console.log(cid.multihash.by);
            await node.contentRouting.provide(cid.toString());
            // await node.contentRouting.provide(keyEncoded);
            console.log("before Put");
            await node.contentRouting.put(keyEncoded, valueEncoded);
            client.registerFile({ user: newUser, fileHash: input_values[0] }, function (err, response){});
        }
       

        const value = await node.contentRouting.get(keyEncoded);
        const message = new TextDecoder('utf8').decode(value);


        //response.callback(newUser);

        
        // console.log(cid.toString());
        // console.log(cid.multihash);
        // console.log(cid.version);


        // console.log("Before Encode3");
        // await node.contentRouting.provide(cid);
        // console.log("Encoded3");

        console.log("Key Encoded: ", keyEncoded);

        console.log("Value you stored: \n" + message);

        // client.registerFile({ user: newUser, fileHash: input_values[0] }, async function (err, response) {
        //     if (err) {
        //         console.log("error: " + err);
        //     }
        //     else {
        //         // Encode the key and value
        //         const keyEncoded = new TextEncoder('utf8').encode(input_values[0]);
        //         // console.log("Encoded?");
        //         const userInfo = `${newUser.id}/${newUser.name}/${newUser.ip}/${newUser.port}/${newUser.price}`;
        //         const valueEncoded = new TextEncoder('utf8').encode(userInfo);
        //         // console.log("Encoded2?");

        //         // const hash = await multihash.encode(keyEncoded, 'sha2-256');

        //         // // const hash = await multihashing(keyEncoded, 'sha2-256');
        //         console.log("input value is "+ input_values[0]);

        //         // cid = cid.toV1();
        //         // cid.multibaseName = 'base32';

        //         // console.log("Hash: ", hash);
        //         // console.log("Hash decoded: ", multihash.decode(hash));
        //         // console.log("Version: ", cid.version);
        //         // console.log("Codec: ", cid.codec);
        //         // console.log("Code: ", cid.code);
        //         // console.log("Multibase name: ", cid.multibaseName);
        //         // console.log("CID string: ", cid.toString());
        //         // console.log("CID-multihash-bytes: ", cid.multihash.bytes);

        //         // await node.contentRouting.provide(cid);

        //         // store the key and value in kadDHT
        //         try {
        //             const exist = await node.contentRouting.get(keyEncoded);

        //             console.log("The File already exist");
        //             const existingUserStr = new TextDecoder('utf8').decode(exist);
        //             const values = existingUserStr.split('/');

        //             // console.log(value);

        //             // console.log("PID of peer who has the file: " + values[0]);

        //             // Same User
        //             if (value[0] == node.Id) {
        //                 console.log("Same User try to upload existing file");
        //                 if (values[3] == newUser.price) {
        //                     console.log("You already uploaded same file with same price");
        //                 }
        //                 else {
        //                     // change the price in new User
        //                 }
        //             }
                    
        //             // Different User
        //             else {
        //                 const newValue = existingUserStr+"\n"+userInfo;
        //                 const newValueEncoded = new TextEncoder('utf8').encode(newValue);
        //                 await node.contentRouting.put(keyEncoded, newValueEncoded);
        //             }
        //         }
        //         catch (error) {
        //             console.log("First time to upload the file");
        //             await node.contentRouting.put(keyEncoded, valueEncoded);
        //         }
                

        //         const value = await node.contentRouting.get(keyEncoded);
        //         const message = new TextDecoder('utf8').decode(value);


        //         //response.callback(newUser);

        //         // const hash = await multihashing(keyEncoded, 'sha2-256');
        //         // const cid = new CID(1, 'dag-pb', hash);
        //         // console.log(cid.toString());
        //         // console.log(cid.multihash);
        //         // console.log(cid.version);


        //         // console.log("Before Encode3");
        //         // await node.contentRouting.provide(cid);
        //         // console.log("Encoded3");

        //         console.log("Key Encoded: ", keyEncoded);

        //         console.log("Value you stored: \n" + message);
        //         console.log("Successfully Registered File");

        //         // for await (const provider of providers) {
        //         //     console.log("Provider: ", provider);
        //         // }

        //         console.log("----------------end register file-------------------");


        //     }
        // });

        options(node, target);
    });
}

function get(node, target) {
    rl.question('Enter CID that you want to get from the network\n', (input) => {
        console.log(`target is ${target}`);
        var client = createGrpcClient(target);
        console.log("get into get function");
        client.checkHolders({ fileHash: input }, function (err, response) {
            if (err) {
                console.log("error: " + err);
            }
            else {
                // console.log(response.holders);



                const keyEncoded = new TextEncoder('utf8').encode(input);
                const peers = node.peerRouting.getClosestPeers(keyEncoded);

                // const value = node.contentRouting.get(keyEncoded);

                // console.log(value);

                //  const providers = node.contentRouting.findProviders(input);

                console.log("Peers: ", peers.return().then(function (result) {
                    console.log(result) // undefined value? 
                }));
                // for (const peer of peers) {
                //     console.log("peer: ", peer);
                // }

                response.holders.forEach(user => {
                    console.log(`Holder of the file is ${user.id}`);
                });
                console.log("----------------end check holders-------------------");

            }
        });

        // const keyEncoded = new TextEncoder().encode(input);

        // const value = await node.contentRouting.get(keyEncoded);
        // console.log(value);
        // const message = new TextDecoder().decode(value);
        // //Print the message after decoding it 
        // console.log("PID of peer who has the file: " + message);

        options(node, target);
    });


}

// Preventing the program from exiting immediately after rl.close()
// setInterval(() => {}, 1000); // This keeps the event loop active