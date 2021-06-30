 /**
 * @fileOverview CSPR JS SDK demo: ERC20 01 - install contract.
 */

import * as fs from 'fs';
import * as sleep from 'sleep';
import { 
    CasperClient,
    CLValueBuilder,
    DeployUtil,
    Keys,
    RuntimeArgs,
} from 'casper-js-sdk';

// Paths.
const PATH_TO_NCTL = process.env.NCTL;
const PATH_TO_CONTRACT = `${PATH_TO_NCTL}/assets/net-1/bin/eco/erc20.wasm`;
const PATH_TO_KEYS = `${PATH_TO_NCTL}/assets/net-1/faucet`;

// Deploy parameters - assumes NCTL network.
const DEPLOY_CHAIN_NAME="casper-net-1";
const DEPLOY_GAS_PAYMENT=10000000000000;
const DEPLOY_GAS_PRICE=10;
const DEPLOY_NODE_ADDRESS="http://localhost:11101/rpc";
const DEPLOY_TTL_MS=1800000;

// Token parameters.
const TOKEN_NAME = "Acme Token";
const TOKEN_SYMBOL = "ACME";
const TOKEN_DECIMALS = 11;
const TOKEN_SUPPLY = 1e15;

/**
 * Demonstration entry point.
 */
const main = async () => {
    // Step 1: Set casper node client + contract operator key pair.
    const client = new CasperClient(DEPLOY_NODE_ADDRESS);
    const keyPair = Keys.Ed25519.parseKeyFiles(
        `${PATH_TO_KEYS}/public_key.pem`,
        `${PATH_TO_KEYS}/secret_key.pem`
        );    

    // Step 2: Set deploy (unsigned).
    let deploy = DeployUtil.makeDeploy(
        new DeployUtil.DeployParams(
            keyPair.publicKey,
            DEPLOY_CHAIN_NAME,
            DEPLOY_GAS_PRICE,
            DEPLOY_TTL_MS
        ),
        DeployUtil.ExecutableDeployItem.newModuleBytes(
            getBinary(PATH_TO_CONTRACT),
            RuntimeArgs.fromMap({
                token_decimals: CLValueBuilder.u8(TOKEN_DECIMALS),
                token_name: CLValueBuilder.string(TOKEN_NAME),
                token_symbol: CLValueBuilder.string(TOKEN_SYMBOL),
                token_total_supply: CLValueBuilder.u256(TOKEN_SUPPLY),
            })
        ),
        DeployUtil.standardPayment(DEPLOY_GAS_PAYMENT)
    );

    // Step 3: sign deploy.
    deploy = client.signDeploy(deploy, keyPair); 

    // Step 4: Dispatch deploy to node.
    const deployHash = await client.putDeploy(deploy);

    // Step 5: Notify user.
    logDetails(deployHash)
};

/**
 * Returns a binary as u8 array.
 * @param {String} pathToBinary - Path to binary file to be loaded into memory.
 * @return {Uint8Array} Byte array.
 */
const getBinary = (pathToBinary) => {
    return new Uint8Array(fs.readFileSync(pathToBinary, null).buffer);
};

/**
 * Emits to stdout deploy details.
 * @param {String} deployHash - Identifer of dispatched deploy.
 */
const logDetails = (deployHash) => {
    console.log(`
---------------------------------------------------------------------
installed contract -> ERC20
... account = ${PATH_TO_KEYS}
... deploy chain = ${DEPLOY_CHAIN_NAME}
... deploy dispatch node = ${DEPLOY_NODE_ADDRESS}
... deploy gas payment = ${DEPLOY_GAS_PAYMENT}
... deploy gas price = ${DEPLOY_GAS_PRICE}
contract constructor args:"
... token symbol = ${TOKEN_SYMBOL}
... token name = ${TOKEN_NAME}
... token supply = ${TOKEN_SUPPLY}
... token decimals = ${TOKEN_DECIMALS}
contract installation details:"
... path = ${PATH_TO_CONTRACT}
... deploy hash = ${deployHash}
---------------------------------------------------------------------
    `);    
};
  
main();
