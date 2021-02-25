const sigUtil = require("eth-sig-util")
const ethUtils = require("ethereumjs-util")

const { expect } = require("chai")
const { ethers } = require("hardhat")
const web3Abi = require('web3-eth-abi');

address = "0xdC891544107b8A9e3F7FFe894bB3950D962C58f2"
const privateKey = "954862aab036f42bc2e9da5253e86a5fd5b353628e379bd3331ab63e61dd987f"
const { MockProvider } = require("ethereum-waffle");
const { AbiCoder } = require("ethers/lib/utils");

const domainType = [{
  name: "name",
  type: "string"
},
{
  name: "version",
  type: "string"
},
{
  name: "chainId",
  type: "uint256"
},
{
  name: "verifyingContract",
  type: "address"
}
];

const metaTransactionType = [{
  name: "nonce",
  type: "uint256"
},
{
  name: "from",
  type: "address"
},
{
  name: "functionSignature",
  type: "bytes"
}
];

let safeTransferFromAbi = {
  "inputs": [
    {
      "internalType": "address",
      "name": "from",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "to",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }
  ],
  "name": "safeTransferFrom",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}

let setApprovalForAllAbi = 	{
  "inputs": [
    {
      "internalType": "address",
      "name": "operator",
      "type": "address"
    },
    {
      "internalType": "bool",
      "name": "approved",
      "type": "bool"
    }
  ],
  "name": "setApprovalForAll",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
};

let isApprovedForAllAbi = 	{
  "inputs": [
    {
      "internalType": "address",
      "name": "_owner",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "_operator",
      "type": "address"
    }
  ],
  "name": "isApprovedForAll",
  "outputs": [
    {
      "internalType": "bool",
      "name": "isOperator",
      "type": "bool"
    }
  ],
  "stateMutability": "view",
  "type": "function"
};

const getTransactionData = async (user, nonce, abi, domainData, params) => {

  const functionSignature = web3Abi.encodeFunctionCall(
      abi,
      params
  );

  let message = {};
  message.nonce = parseInt(nonce);
  message.from = await user.getAddress()
  message.functionSignature = functionSignature;

  const dataToSign = {
      types: {
          EIP712Domain: domainType,
          MetaTransaction: metaTransactionType
      },
      domain: domainData,
      primaryType: "MetaTransaction",
      message: message
  };

  const signature = sigUtil.signTypedData(ethUtils.toBuffer(user.privateKey), {
      data: dataToSign
  });

  let r = signature.slice(0, 66);
  let s = "0x".concat(signature.slice(66, 130));
  let v = "0x".concat(signature.slice(130, 132));
  v = parseInt(v);
  if (![27, 28].includes(v)) v += 27;

  return {
      r,
      s,
      v,
      functionSignature
  };
}

describe("ERC721MetaTransactionMaticSample", function() {

  let provider
  let erc721
  let approvedContract

  before(async() => {
    const ERC721MetaTransactionMaticSample = await ethers.getContractFactory("ERC721MetaTransactionMaticSample");
    const erc721MetaTransactionMaticSample = await ERC721MetaTransactionMaticSample.deploy("Sample Token", "ST");

    const ApprovedSpenderContract = await ethers.getContractFactory("ApprovedSpenderContract");
    const approvedSpenderContract = await ApprovedSpenderContract.deploy();

    erc721 = await erc721MetaTransactionMaticSample.deployed();
    approvedContract = await approvedSpenderContract.deployed();

    provider = new MockProvider();
  })

  it("setApprovalForAll MetaTransaction Test", async function() {
    const wallet = new MockProvider().createEmptyWallet();

    let name = await erc721.name();
    let nonce = await erc721.getNonce(wallet.getAddress());
    let version = "1";
    let chainId = await erc721.getChainId();
    let domainData = {
      name: name,
      version: version,
      chainId: parseInt(chainId),
      verifyingContract: erc721.address
    };

    let {
      r,
      s,
      v,
      functionSignature
    } = await getTransactionData(wallet, nonce, setApprovalForAllAbi, domainData, [ approvedContract.address, true ]);

    let user = await wallet.getAddress();

    expect(await erc721.isApprovedForAll(user, approvedContract.address)).to.equal(false);

    const metaTransaction = await erc721.executeMetaTransaction(user, functionSignature, r, s, v);

    expect(await erc721.isApprovedForAll(user, approvedContract.address)).to.equal(true);
  });
});
