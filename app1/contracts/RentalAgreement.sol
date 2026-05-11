// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./RealEstateRegistry.sol";

/**
 * @title RentalAgreement
 * @dev Contrat pour gérer les accords de location
 */

contract RentalAgreement {
    
    enum RentalStatus { PENDING, ACTIVE, COMPLETED, CANCELLED, DISPUTED }
    
    // Structure pour un accord de location
    struct Rental {
        uint256 id;
        uint256 propertyId;
        address landlord;
        address tenant;
        uint256 startDate;
        uint256 endDate;
        uint256 monthlyPrice;
        uint256 depositAmount;
        RentalStatus status;
        uint256 createdAt;
        uint256 totalPaid; // Total payé par le locataire
    }
    
    // Structure pour les paiements
    struct Payment {
        uint256 id;
        uint256 rentalId;
        uint256 amount;
        uint256 timestamp;
        bool confirmed;
    }
    
    // Mappings
    mapping(uint256 => Rental) public rentals;
    mapping(uint256 => Payment[]) public rentalPayments;
    mapping(address => uint256[]) public tenantRentals;
    mapping(address => uint256[]) public landlordRentals;
    
    uint256 public rentalCounter = 0;
    uint256 public paymentCounter = 0;
    
    RealEstateRegistry public registryContract;
    
    // Events
    event RentalCreated(uint256 indexed rentalId, uint256 indexed propertyId, address indexed tenant, address landlord);
    event RentalActivated(uint256 indexed rentalId);
    event RentalCompleted(uint256 indexed rentalId);
    event PaymentMade(uint256 indexed rentalId, uint256 amount, uint256 timestamp);
    event PaymentConfirmed(uint256 indexed rentalId, uint256 paymentIndex);
    event RentalCancelled(uint256 indexed rentalId);
    
    // Modifiers
    modifier rentalExists(uint256 _rentalId) {
        require(rentals[_rentalId].landlord != address(0), "Rental does not exist");
        _;
    }
    
    modifier onlyLandlord(uint256 _rentalId) {
        require(rentals[_rentalId].landlord == msg.sender, "Only landlord can call this");
        _;
    }
    
    modifier onlyTenant(uint256 _rentalId) {
        require(rentals[_rentalId].tenant == msg.sender, "Only tenant can call this");
        _;
    }
    
    constructor(address _registryAddress) {
        registryContract = RealEstateRegistry(_registryAddress);
    }
    
    /**
     * @dev Créer un nouvel accord de location
     */
    function createRental(
        uint256 _propertyId,
        address _landlord,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _monthlyPrice,
        uint256 _depositAmount
    ) public {
        require(_startDate < _endDate, "Start date must be before end date");
        require(_monthlyPrice > 0, "Monthly price must be greater than 0");
        require(_depositAmount > 0, "Deposit amount must be greater than 0");
        require(_startDate >= block.timestamp, "Start date must be in the future");
        
        uint256 rentalId = rentalCounter++;
        
        rentals[rentalId] = Rental({
            id: rentalId,
            propertyId: _propertyId,
            landlord: _landlord,
            tenant: msg.sender,
            startDate: _startDate,
            endDate: _endDate,
            monthlyPrice: _monthlyPrice,
            depositAmount: _depositAmount,
            status: RentalStatus.PENDING,
            createdAt: block.timestamp,
            totalPaid: 0
        });
        
        tenantRentals[msg.sender].push(rentalId);
        landlordRentals[_landlord].push(rentalId);
        
        emit RentalCreated(rentalId, _propertyId, msg.sender, _landlord);
    }
    
    /**
     * @dev Accepter un accord de location (par le propriétaire)
     */
    function activateRental(uint256 _rentalId) public onlyLandlord(_rentalId) rentalExists(_rentalId) {
        require(rentals[_rentalId].status == RentalStatus.PENDING, "Rental must be pending");
        rentals[_rentalId].status = RentalStatus.ACTIVE;
        emit RentalActivated(_rentalId);
    }
    
    /**
     * @dev Payer le loyer
     */
    function payRent(uint256 _rentalId) public payable rentalExists(_rentalId) {
        Rental storage rental = rentals[_rentalId];
        require(rental.tenant == msg.sender, "Only tenant can pay rent");
        require(rental.status == RentalStatus.ACTIVE, "Rental must be active");
        require(msg.value == rental.monthlyPrice, "Payment must equal monthly price");
        require(block.timestamp >= rental.startDate, "Rental has not started yet");
        
        uint256 paymentId = paymentCounter++;
        Payment memory newPayment = Payment({
            id: paymentId,
            rentalId: _rentalId,
            amount: msg.value,
            timestamp: block.timestamp,
            confirmed: false
        });
        
        rentalPayments[_rentalId].push(newPayment);
        rental.totalPaid += msg.value;
        
        emit PaymentMade(_rentalId, msg.value, block.timestamp);
    }
    
    /**
     * @dev Confirmer un paiement (par le propriétaire)
     */
    function confirmPayment(uint256 _rentalId, uint256 _paymentIndex) 
        public 
        onlyLandlord(_rentalId) 
        rentalExists(_rentalId) 
    {
        require(_paymentIndex < rentalPayments[_rentalId].length, "Payment index out of range");
        require(!rentalPayments[_rentalId][_paymentIndex].confirmed, "Payment already confirmed");
        
        rentalPayments[_rentalId][_paymentIndex].confirmed = true;
        
        // Envoyer le paiement au propriétaire
        (bool success, ) = payable(rentals[_rentalId].landlord).call{value: rentalPayments[_rentalId][_paymentIndex].amount}("");
        require(success, "Payment transfer failed");
        
        emit PaymentConfirmed(_rentalId, _paymentIndex);
    }
    
    /**
     * @dev Terminer la location
     */
    function completeRental(uint256 _rentalId) public onlyLandlord(_rentalId) rentalExists(_rentalId) {
        Rental storage rental = rentals[_rentalId];
        require(rental.status == RentalStatus.ACTIVE, "Rental must be active");
        require(block.timestamp >= rental.endDate, "Rental has not ended yet");
        
        rental.status = RentalStatus.COMPLETED;
        
        // Restituer la caution au locataire
        (bool success, ) = payable(rental.tenant).call{value: rental.depositAmount}("");
        require(success, "Deposit refund failed");
        
        emit RentalCompleted(_rentalId);
    }
    
    /**
     * @dev Annuler une location (avant son activation)
     */
    function cancelRental(uint256 _rentalId) public rentalExists(_rentalId) {
        Rental storage rental = rentals[_rentalId];
        require(
            msg.sender == rental.tenant || msg.sender == rental.landlord,
            "Only tenant or landlord can cancel"
        );
        require(rental.status == RentalStatus.PENDING, "Can only cancel pending rentals");
        
        rental.status = RentalStatus.CANCELLED;
        emit RentalCancelled(_rentalId);
    }
    
    /**
     * @dev Obtenir les détails d'une location
     */
    function getRental(uint256 _rentalId) public view rentalExists(_rentalId) returns (Rental memory) {
        return rentals[_rentalId];
    }
    
    /**
     * @dev Obtenir les paiements d'une location
     */
    function getRentalPayments(uint256 _rentalId) public view rentalExists(_rentalId) returns (Payment[] memory) {
        return rentalPayments[_rentalId];
    }
    
    /**
     * @dev Obtenir les locations d'un locataire
     */
    function getTenantRentals(address _tenant) public view returns (uint256[] memory) {
        return tenantRentals[_tenant];
    }
    
    /**
     * @dev Obtenir les locations d'un propriétaire
     */
    function getLandlordRentals(address _landlord) public view returns (uint256[] memory) {
        return landlordRentals[_landlord];
    }
    
    /**
     * @dev Vérifier si le loyer est en retard
     */
    function isRentOverdue(uint256 _rentalId) public view rentalExists(_rentalId) returns (bool) {
        Rental memory rental = rentals[_rentalId];
        
        if (rental.status != RentalStatus.ACTIVE) {
            return false;
        }
        
        // Vérifier s'il y a un loyer impayé
        uint256 expectedPayments = (block.timestamp - rental.startDate) / (30 days) + 1;
        uint256 actualPayments = rentalPayments[_rentalId].length;
        
        return actualPayments < expectedPayments;
    }
    
    /**
     * @dev Obtenir le total des locations
     */
    function getTotalRentals() public view returns (uint256) {
        return rentalCounter;
    }
}
