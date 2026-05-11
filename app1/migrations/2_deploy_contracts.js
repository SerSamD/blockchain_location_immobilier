    const RealEstateRegistry = artifacts.require("RealEstateRegistry");
    const RentalAgreement = artifacts.require("RentalAgreement");

    module.exports = function (deployer) {
    deployer.deploy(RealEstateRegistry).then(function() {
        return deployer.deploy(RentalAgreement, RealEstateRegistry.address);
    });
    };
