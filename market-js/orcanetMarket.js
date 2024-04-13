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
import { validate } from "multihashes";

const bootstrapPeers = ['/dnsaddr/sg1.bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'];

const Validate = (key, value) => {
    const filehash = new TextDecoder('utf8').decode(key);
    if (typeof filehash != "string") return console.log(`Key ${filehash} should be a string`);

    const message = new TextDecoder('utf8').decode(value);
    const values = message.split('\n');

    values.forEach(user => {
        const userInfo = user.split('/')

        const { id, name, ip, port, price } = userInfo;
        if (typeof id != "string") return console.log('Type of id in value is incorrect');
        else if (typeof name != "string") return console.log('Type of name in value is incorrect');
        else if (typeof ip != "string") return console.log('Type of ip in value is incorrect');
        else if (typeof port != "number") return console.log('Type of port in value is incorrect');
        else if (typeof price != "number") return console.log('Type of price in value is incorrect');
    });

    console.log("Passed all validations");
    return;
}

const Select = (key, records) => {

    var result = 0;
    // const filehash = new TextDecoder('utf8').decode(key);

    // for (let i = 0; i < records.length; i++) {
    //     const recordDecoded = new TextDecoder('utf8').decode(records[i]);

    //     if (filehash === recordDecoded) {
    //         // Comparing Time received or just the last index?
    //         // In here, just getting the last index

    //         result = i;

    //     }
    // }

    return result;
}

const makeNode = async () => {
    const nodes = await createLibp2p({
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/0']
        },
        transports: [tcp()],
        streamMuxers: [mplex()],
        connectionEncryption: [noise()],
        peerDiscovery: [mdns(), bootstrap({
            list: bootstrapPeers
        })],
        services: {
            dht: kadDHT({
                kBucketSize: 20,
                validators: {
                    Validate: Validate()
                },
                selectors: {
                    Select: Select()
                }
            }),
        },
        config: {
            kadDHT: {
                enabled: true,
                randomWalk: {
                    enabled: true,
                }

            }
        }
    });


    // Add event listener to the node
    nodes.addEventListener('peer:connect', async (event) => {
        const peerInfo = event.detail;
        console.log('A Peer ID ' + peerInfo + ' Connected with us!');
        const peer = await nodes.peerRouting.findPeer(peerInfo);
        // console.log(peer);
        await nodes.dial(peer.multiaddrs);

        // console.log(peer);
        nodes.peerStore.patch(peerInfo, peer.multiaddrs);
        nodes.peerStore.save(peerInfo, peer.multiaddrs);
    });


    // Event listener for peer discovery
    nodes.addEventListener('peer:discovery', (event) => {
        const peerId = event.detail.id.toString();
        console.log(`Discovered: ${peerId}`);
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

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getTarget(node) {
    let my_ip
    let my_port

    const multiaddresses = node.getMultiaddrs();
    multiaddresses.forEach(addr => {
        let addrs = addr.toString();
        let addr_info = addrs.split('/');
        my_ip = addr_info[2];
        my_port = addr_info[4];
    });

    let target = my_ip + ":" + my_port;
    // let target = my_ip + ":50051";
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

            const server = new grpc.Server();
            server.addService(market_proto.Market.service, { RegisterFile: registerFile, CheckHolders: checkHolders });
            console.log(`target is ${target}`);
            server.bindAsync(target, grpc.ServerCredentials.createInsecure(), (error) => {
                // server.start();
            });

            // ######## Registerfile Function #########
            async function registerFile(call, callback) {
                let newUser = call.request.user;
                let cid = call.request.fileHash;
                console.log("------------------register file---------------------");

                const keyEncoded = new TextEncoder('utf8').encode(cid);
                const userInfo = `${newUser.id}/${newUser.name}/${newUser.ip}/${newUser.port}/${newUser.price}`;
                const valueEncoded = new TextEncoder('utf8').encode(userInfo);

                try {
                    console.log(`node Id checking: ${node.peerId}`);

                    const exist = await node.contentRouting.get(keyEncoded);
                    // const exist = node.services.dht.get(keyEncoded);
                    for await (const queryEvent of exist) {
                        // Handle each query event
                        console.log('Query event:', queryEvent);
                    }
                    console.log("exist value is " + exist);


                    const existingUserStr = new TextDecoder('utf8').decode(exist);
                    const values = existingUserStr.split('/');
                    if (values[0] == '' || values[0] == undefined) {
                        console.log("First time to upload the file from if");
                        await node.contentRouting.put(keyEncoded, valueEncoded);
                        // node.services.dht.put(keyEncoded, valueEncoded);
                    }

                    // Same User
                    else {
                        console.log("The File already exist");
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
                            const newValue = existingUserStr + "\n" + userInfo;
                            const newValueEncoded = new TextEncoder('utf8').encode(newValue);
                            await node.contentRouting.put(keyEncoded, newValueEncoded);
                            // node.services.dht.put(keyEncoded, newValueEncoded);
                        }
                    }

                }
                catch (error) {
                    // console.log("First time to upload the file from err");
                    const hi = await node.contentRouting.put(keyEncoded, valueEncoded);
                    // node.services.dht.put(keyEncoded, valueEncoded);
                }

                // node.services.dht.refreshRoutingTable();


                // const value = node.services.dht.get(keyEncoded);
                // for await (const queryEvent of value) {
                //     // Handle each query event
                //     console.log('Query event:', queryEvent);
                //     console.log("record from query event is ", queryEvent.record);
                // }

                // node.contentRouting.refreshRoutingTable();
                const value = await node.contentRouting.get(keyEncoded);
                console.log(value);
                const message = new TextDecoder('utf8').decode(value);
                console.log("value from node get is \n" + message);

                console.log("----------------end register file-------------------");
                callback(null, {});
            }

            // ######## CheckHolders Function #########
            async function checkHolders(call, callback) {
                const cid = call.request.fileHash;
                console.log("------------------check holders---------------------");

                try {
                    console.log("key in the checkholders is " + cid);

                    const keyEncoded = new TextEncoder('utf8').encode(cid);
                    const value = await node.contentRouting.get(keyEncoded);
                    const message = new TextDecoder('utf8').decode(value);

                    // node.services.dht.refreshRoutingTable();
                    // const value = node.services.dht.get(keyEncoded);

                    // for await (const queryEvent of value) {
                    //     // Handle each query event
                    //     console.log('Query event:', queryEvent);
                    //     const message = new TextDecoder('utf8').decode(queryEvent);

                    //     console.log("Message: ", message);
                    // }

                    console.log("passed node.get()");

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

                    await callback(null, { holders: holders });

                } catch (error) {
                    console.log("Wrong filehash or there is no file you may want");
                    console.error(error);
                }
                console.log("----------------end check holders-------------------");
            }

            console.log("Joined Network");
            options(node, target);
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

function add(node, target) {
    rl.question('Enter file that you want to add to the network\n', async (input) => {
        //TODO: have user input info to add file and use proto and grpc to add the file like we did in centralized i guess?
        console.log(`target is ${target}`);
        var client = new market_proto.Market(target, grpc.credentials.createInsecure());
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

        client.registerFile({ user: newUser, fileHash: input_values[0] }, function (err, response) { });

        options(node, target);
    });
}

function get(node, target) {
    rl.question('Enter CID that you want to get from the network\n', (input) => {
        console.log(`target is ${target}`);
        var client = new market_proto.Market(target, grpc.credentials.createInsecure());
        console.log("get into get function");
        client.checkHolders({ fileHash: input }, function (err, response) {
            if (err) {
                console.log("error: " + err);
            }
            else {
                response.holders.forEach(user => {
                    console.log(`Holder of the file is ${user.id}`);
                });
            }
        });

        options(node, target);
    });


}
