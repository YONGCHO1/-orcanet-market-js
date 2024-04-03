# Installation
'npm install' in the market directory

# Getting Start
1. Get into the server directory on terminal.
2. Start first bootstrap node
   ```
   node demo.js
   ```
   ```
   Enter "start" to join the network
   start
   ```
3. Select options
   ```
   "info": displays node information
   "connect": connect to another node in the network
   "add": adds a file to the network
   "exit": exit the network
   ```
4. info
   Users can check their multiaddresses and PID
    ```
    ------------------------------------------------------------------------------------------------------------------------------
    My Node Info:
    Peer ID: 12D3KooWMmQFkHeJX7Lu5dqa8EjbzMfejdENvz7hcJv57hvcwUp8
    Connect to me on:
    /ip4/127.0.0.1/tcp/58275/p2p/12D3KooWMmQFkHeJX7Lu5dqa8EjbzMfejdENvz7hcJv57hvcwUp8
    /ip4/10.1.191.22/tcp/58275/p2p/12D3KooWMmQFkHeJX7Lu5dqa8EjbzMfejdENvz7hcJv57hvcwUp8
    ------------------------------------------------------------------------------------------------------------------------------
    ```
5. connect
    ```
    Enter address of node you want to connect to
    ```
    Connect with other peer's multiaddress
    ```
    [Multiaddress]
    Connected to bootstrap peer: [Peer's PID]
    ```
    ```
    ex) /ip4/10.1.191.22/tcp/58336/p2p/12D3KooWBaBBdT7cCGN2Ys3FBcYqf3CnMA5rgHhFradXNtNP8zFc
    Connected to bootstrap peer: 12D3KooWBaBBdT7cCGN2Ys3FBcYqf3CnMA5rgHhFradXNtNP8zFc
    ```
6. add
    ```
    Enter file that you want to add to the network
    [File hash(CID)] [User Name] [Price per MB]
    ```
7. get
   ```
   Enter CID that you want to get from the network
   [File hash(CID)]
   ```
9. exit
    ```
    Leaving Network
    ```
