import { createLibp2p } from 'libp2p'
import { bootstrap } from '@libp2p/bootstrap'
import { tcp } from '@libp2p/tcp'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { kadDHT } from '@libp2p/kad-dht'
import { mdns } from '@libp2p/mdns'

const bootstrapPeers = ['/dnsaddr/sg1.bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'];


/**
   *  Validate service function for the KadDht
   *  Params: key, value
   *  Return: void
   */
const Validate = (key, value) => {
    console.log("validate function activate")
    const filehash = new TextDecoder('utf8').decode(key);
    if(typeof filehash != "string") return console.log(`Key ${filehash} should be a string`);

    const message = new TextDecoder('utf8').decode(value);
    const values = message.split('\n');

    values.forEach(user => {
        const userInfo = user.split('/')

        const {id, name, ip, port, price} = userInfo;

        console.log(userInfo);

        if (typeof id != "string") return console.log('Type of id in value is incorrect');
        else if (typeof name != "string") return console.log('Type of name in value is incorrect');
        else if (typeof ip != "string") return console.log('Type of ip in value is incorrect');
        else if (typeof port != "number") return console.log('Type of port in value is incorrect');
        else if (typeof price != "number") return console.log('Type of price in value is incorrect');
    })

    console.log("Passed all validations");
    return;
}

const Select = (key, value) => {
    return;
}


 /**
   *  Creates a new libp2p node
   *  Params: none
   *  Return: libp2p node
   */
 const createNewNode = async () => {
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
                validators: Validate(),
                selectors: Select(),
                // querySelfInterval: 5,
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
    nodes.services.dht.setMode("server");


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


 /**
   *  Returns the target for the grpc server to be set and grpc client to connect with the server.
   *  Params: node(libp2p node)
   *  Return: target(string with format "ip:port")
   */
 function getTargetFromNode(node) {
    let my_ip
    let my_port

    const multiaddresses = node.getMultiaddrs();
    multiaddresses.forEach(addr => {
        let addrs = addr.toString();
        let addr_info = addrs.split('/');
        my_ip = addr_info[2];
        my_port = addr_info[4];
    });

    // let target = my_ip + ":"+my_port;
    // let target = my_ip + ":50051";
    // let target = "127.0.0.1:" + my_port;
    let target = "127.0.0.1:50051"; // right now its just localhost:port
    return target;
}


 /**
   *  Gets a node's ip address and port number
   *  Params: node(libp2p node)
   *  Return: {ip: string, port: string}
   */
function getIpAndPortFromNode(node){
    let my_ip;
    let my_port;

    const multiaddresses = node.getMultiaddrs();
    multiaddresses.forEach(addr => {
        let addrs = addr.toString();
        let addr_info = addrs.split('/');
        my_ip = addr_info[2];
        my_port = addr_info[4];
    });

    return{
        ip: my_ip,
        port: my_port
    }
}


  /**
   *  Prints a node's information into the console
   *  Params: node(libp2p node)
   *  Return: void
   */
function printNodeInfo(node) {
    console.log("------------------------------------------------------------------------------------------------------------------------------")
    console.log("My Node Info:")
    console.log('Peer ID:', node.peerId.toString());
    console.log('Connect to me on:');
    const multiaddresses = node.getMultiaddrs();
    multiaddresses.forEach(addr => console.log(addr.toString()));
    console.log("------------------------------------------------------------------------------------------------------------------------------")
}


// Export the function
export { createNewNode, getTargetFromNode, getIpAndPortFromNode, printNodeInfo };