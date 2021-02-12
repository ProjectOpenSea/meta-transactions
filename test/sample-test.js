const { expect } = require("chai");

describe("ERC712MetaTransactionSample", function() {
  it("Basic test", async function() {
  const ERC721MetaTransactionSample = await hre.ethers.getContractFactory("ERC721MetaTransactionSample");
  const erc721MetaTransactionSample = await ERC721MetaTransactionSample.deploy("Sample Token", "ST");

  await erc721MetaTransactionSample.deployed();
  });
});
