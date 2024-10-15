const hre = require("hardhat");

async function main() {
    const MyToken = await hre.ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy();

    // Espera a que el contrato esté desplegado
    await myToken.waitForDeployment();

    console.log("MyToken deployed to:", myToken.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
