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
 

const bootstrapPeers = ['/ip4/192.168.1.166/tcp/52074/p2p/12D3KooWAkjzMKsmU1r4KxPk8ersST2fKcEiRFRFaYxUsnzYJmMa'];

const makeNode = async () => {
    const nodes = await createLibp2p({
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/0']
        },
        transports: [tcp()],
        streamMuxers: [mplex()],
        connectionEncryption: [noise()],
        // peerDiscovery: [mdns()],
        peerDiscovery: [bootstrap({
            list: bootstrapPeers
        })],
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


    nodes.addEventListener('peer:discovery', (evt) => {
        console.log('Discovered %s', evt.detail.id.toString()) // Log discovered peer
    });



    
    await nodes.start();
    return nodes;
}

// var PROTO_PATH = './market.proto';

// var grpc = require('@grpc/grpc-js');
// var protoLoader = require('@grpc/proto-loader');
// var packageDefinition = protoLoader.loadSync(
//     PROTO_PATH,
//     {
//         keepCase: true,
//         longs: String,
//         enums: String,
//         defaults: true,
//         oneofs: true
//     });
// var market_proto = grpc.loadPackageDefinition(packageDefinition).market;

 // Importing the built-in 'readline' module
  const readline = require('readline');

  // Creating an interface for reading from the command line
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });

  // This function registers a file and user into the servers HashMap 
function registerFile(call, callback) {
    let newUser = call.request.user;
    let cid = call.request.fileHash;
    console.log("------------------register file---------------------");
    let multi = [];
    multi.push(newUser);
  
    putOrUpdateKeyValue(node, cid, multi);
    callback(null, {});
}

// Put or update values to corresponding key
function putOrUpdateKeyValue(node, cid, value) {
    node.contentRouting.get(cid, (err, existingValue) => {
        // The key(CID) doesn't exist in DHT node
        if (err) {
            console.log('First time to register the file');
            node.contentRouting.put(cid, value, (err) => {
                if (err) {
                console.error('Error registering value:', err);
                } 
                else {
                console.log('Value uploaded successfully for key', cid);
                }
            })
        } 

        // The key(CID) exists in DHT node
        else {
          // Update existing value with new value (might be needed to change to add with existing value)
          const updatedValue = Array.isArray(existingValue) ? [...existingValue, ...value] : [existingValue, ...value];
          node.contentRouting.put(cid, updatedValue, (err) => {
            if (err) {
              console.error('Error updating value:', err);
            } 
            else {
              console.log('Value updated successfully for key', cid);
            }
          });
        }
    });
}

// CheckHolders should take a fileHash and looks it up in the hashmap and returns the list of users
function checkHolders(call, callback) {
    console.log("------------------check holders----------------------");
    const cid = call.request.fileHash;
    // const user = userFileMap.get(fileHash);

    const holders = checkProvider(node, cid) 
  
    console.log("Users Found");
    // printHolders(holders);
    callback(null, {holders: holders});
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

// const server = new grpc.Server();
// server.addService(market_proto.Market.service, { RegisterFile: registerFile, CheckHolders: checkHolders });
// server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
//     server.start();
// });  

  greet();


  function greet(){

    // Prompting the user for input
    rl.question('Enter "start" to join the network\n', async (input) => {
        // Processing the user input
            if(input == "start"){
            // Create new node and start it
                const node = await makeNode();
                console.log("Joined Network");
                // printNodeInfo(node);
                options(node);
                // rl.close();
            } else{
                console.log("Invalid Input: Try again!");
                greet();
            }
    
        // Closing the interface
        });
}

function options(node){
    rl.question('Available options for user in Network:\n"info": displays node information\n"connect": connect to another node in the network\n"add": adds a file to the network\n"exit": exit the network\n', async (input) => {
        if(input == "info"){
            printNodeInfo(node);
            options();
        } else if(input == "connect"){
            connect(node);
        }else if(input == "add"){
            add(node);
        }else if(input == "exit"){
            console.log("Leaving Network");
            await node.stop();
            rl.close();
        }
        else{
            console.log("Invalid Input: Try again!");
            options(node);
        }
    });
}

function printNodeInfo(node){
    console.log("------------------------------------------------------------------------------------------------------------------------------")
    console.log("My Node Info:")
    console.log('Peer ID:', node.peerId.toString());
    console.log('Connect to me on:');
    const multiaddresses = node.getMultiaddrs();
    multiaddresses.forEach(addr => console.log(addr.toString()));
    console.log("------------------------------------------------------------------------------------------------------------------------------")
}

function connect(node){
    rl.question('Enter address of node you want to connect to\n', async (input) => {
        //TODO: when address is entered dial that address and if it works say it was successful

        const peers = [];
        
        peers.push(input);


        // try {
        //     const peer = await node.peerRouting.findPeer(input);
        //     console.log('Found peer:', peer);
        //     console.log('Addresses:', peer.addresses.map(addr => addr.toString()));
        //   } catch (err) {
        //     console.error('Error finding peer:', err);
        //   }

        const bootstrapAddresses = await Promise.all(peers.map(async (addr) => {
            console.log("get into bootstrap function");
            try {
                console.log("get into try");
                console.log(addr);
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
        options(node);
        });
}

function add(node){
    rl.question('Enter file that you want to add to the network\n', async (input) => {
        //TODO: have user input info to add file and use proto and grpc to add the file like we did in centralized i guess?
        // var client = new market_proto.Market(target, grpc.credentials.createInsecure());

        options(node);
        });
}


// Preventing the program from exiting immediately after rl.close()
// setInterval(() => {}, 1000); // This keeps the event loop active

