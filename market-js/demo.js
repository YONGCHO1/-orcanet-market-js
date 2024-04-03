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

const bootstrapPeers = [];

const makeNode = async () => {
    const nodes = await createLibp2p({
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/0']
        },
        transports: [tcp()],
        streamMuxers: [mplex()],
        connectionEncryption: [noise()],
        peerDiscovery: [mdns()],
        // peerDiscovery: [bootstrap({
        //     list: bootstrapPeers
        // })],
        services: {
            kadDHT: kadDHT({
                kBucketSize: 20
            }),
        }
    });


    // Add event listener to the node
    nodes.addEventListener('peer:connect', (event) => {
        const peerInfo = event.detail;
        console.log('A Peer ID ' + peerInfo + ' Connected with us!');
    });


    // Event listener for peer discovery
    nodes.addEventListener('peer:discovery', (event) => {
        const peerId = event.detail.id.toString();
        console.log(`Discovered: ${peerId}`);

        // Attempt to connect to the discovered peer
        // nodes.dial(event.detail).then(() => {
        //     console.log(`Connected to ${peerId}`);
        // }).catch((err) => {
        //     console.error(`Failed to connect to ${peerId}: ${err.message}`);
        // });
    });

    await nodes.start();
    return nodes;
}

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

// Creating an interface for reading from the command line
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// This function registers a file and user into the servers HashMap 
async function registerFile(call, callback) {
    let newUser = call.request.user;
    let cid = call.request.fileHash;
    console.log("------------------register file---------------------");
    let multi = [];
    multi.push(newUser);

    console.log(`New User: ${newUser}`);
    console.log(`CID: ${cid}`);

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
    callback(null, {});
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

// CheckHolders should take a fileHash and looks it up in the hashmap and returns the list of users
// function checkHolders(call, callback) {
//     const cid = call.request.fileHash;
//     console.log("------------------check holders----------------------");
//     // const user = userFileMap.get(fileHash);



//     console.log("Users Found");
//     // printHolders(holders);
//     callback(null, {holders: holders});
// }

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

function getTarget(node) {
    let my_ip
    let my_port

    const multiaddresses = node.getMultiaddrs();
    multiaddresses.forEach(addr => {
        // console.log(addr.toString());
        let addrs = addr.toString();
        let addr_info = addrs.split('/');
        my_ip = addr_info[2];
        my_port = addr_info[4];
    });

    let target = my_ip + ":8080";
    return target;
}

greet();


function greet() {

    // Prompting the user for input
    rl.question('Enter "start" to join the network\n', async (input) => {
        // Processing the user input
        if (input == "start") {
            // Create new node and start it
            const node = await makeNode();
            let target = getTarget(node);

            async function checkHolders(call, callback) {
                const cid = call.request.fileHash;
                console.log("------------------check holders---------------------");

                const keyEncoded = new TextEncoder().encode(cid);
                const value = await node.contentRouting.get(keyEncoded);
                const message = new TextDecoder().decode(value);

                const values = message.split('/');

                // console.log("PID of peer who has the file: " + values[0]);

                const foundUser = {
                    id: values[0],
                    name: values[1],
                    ip: values[2],
                    port: values[3],
                    price: values[4],
                };

                const holders = [];
                holders.push(foundUser);

                // console.log("Users Found");
                // printHolders(holders);
                callback(null, { holders: holders });
            }

            const server = new grpc.Server();
            server.addService(market_proto.Market.service, { RegisterFile: registerFile, CheckHolders: checkHolders });
            server.bindAsync(target, grpc.ServerCredentials.createInsecure(), () => {
                // server.start();
            });

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
        } else if (input == "connect") {
            connect(node, target);
        } else if (input == "add") {
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

function printNodeInfo(node) {
    console.log("------------------------------------------------------------------------------------------------------------------------------")
    console.log("My Node Info:")
    console.log('Peer ID:', node.peerId.toString());
    console.log('Connect to me on:');
    const multiaddresses = node.getMultiaddrs();
    multiaddresses.forEach(addr => console.log(addr.toString()));
    console.log("------------------------------------------------------------------------------------------------------------------------------")
}

function connect(node, target) {
    rl.question('Enter address of node you want to connect to\n', async (input) => {
        //TODO: when address is entered dial that address and if it works say it was successful

        // const peers = [];

        bootstrapPeers.push(input);


        // try {
        //     const peer = await node.peerRouting.findPeer(input);
        //     console.log('Found peer:', peer);
        //     console.log('Addresses:', peer.addresses.map(addr => addr.toString()));
        //   } catch (err) {
        //     console.error('Error finding peer:', err);
        //   }

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

function add(node, target) {
    rl.question('Enter file that you want to add to the network\n', async (input) => {
        //TODO: have user input info to add file and use proto and grpc to add the file like we did in centralized i guess?
        var client = new market_proto.Market(target, grpc.credentials.createInsecure());

        // console.log(`input value is ${input}`);

        let input_values = input.split(' ');
        // console.log(input_values[0]);

        let my_ip;
        let my_port;

        const multiaddresses = node.getMultiaddrs();
        multiaddresses.forEach(addr => {
            // console.log(addr.toString());
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

        // console.log(newUser);

        client.registerFile({ user: newUser, fileHash: input_values[0] }, async function (err, response) {
            if (err) {
                console.log("error: " + err);
            }
            else {
                // Encode the key and value
                const keyEncoded = new TextEncoder().encode(input_values[0])
                const userInfo = `${newUser.id}/${newUser.name}/${newUser.ip}/${newUser.port}/${newUser.price}`;
                const valueEncoded = new TextEncoder().encode(userInfo);

                // store the key and value in kadDHT
                await node.contentRouting.put(keyEncoded, valueEncoded);
                const value = await node.contentRouting.get(keyEncoded);
                const message = new TextDecoder().decode(value);
                console.log("Value you stored: \n" + message);
                console.log("Successfully Registered File");
                console.log("----------------end register file-------------------");
            }
        });

        options(node, target);
    });
}

function get(node, target) {
    rl.question('Enter CID that you want to get from the network\n', (input) => {
        var client = new market_proto.Market(target, grpc.credentials.createInsecure());

        client.checkHolders({ fileHash: input }, function (err, response) {
            if (err) {
                console.log("error: " + err);
            }
            else {
                console.log(response.holders);
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