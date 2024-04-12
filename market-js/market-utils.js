import { createLibp2p } from 'libp2p'
import { bootstrap } from '@libp2p/bootstrap'
import { tcp } from '@libp2p/tcp'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { kadDHT } from '@libp2p/kad-dht'
import { mdns } from '@libp2p/mdns'

const bootstrapPeers = ['/dnsaddr/sg1.bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'];


 /**
   *  Creates a new libp2p node
   *  Params: none
   *  Return: libp2p node
   */
const createNewNode = async () => {

    // function that creates the lib2p2 node with its parameters
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
            kadDHT: kadDHT({
                kBucketSize: 20
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


    // Add peer connect event listener to the node
    nodes.addEventListener('peer:connect', async (event) => {
        const peerInfo = event.detail;
        console.log('A Peer ID ' + peerInfo + ' Connected with us!');
        const peer = await nodes.peerRouting.findPeer(peerInfo);
        nodes.peerStore.save(peerInfo, peer);
    });


    //adds peer discovery event listener
    nodes.addEventListener('peer:discovery', (event) => {
        const peerId = event.detail.id.toString();
        console.log(`Discovered: ${peerId}`);
    });

    // starts the node then returns it
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
        // console.log(addr.toString());
        let addrs = addr.toString();
        let addr_info = addrs.split('/');
        my_ip = addr_info[2];
        my_port = addr_info[4];
    });

    // let target = my_ip + ":"+my_port;
    let target = my_ip + ":50051";
    return target;
}

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