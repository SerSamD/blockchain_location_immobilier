// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title RealEstateRegistry
 * @dev Contrat pour enregistrer et gérer les annonces d'immobiliers
 */

contract RealEstateRegistry {
    
    // Structure pour un immobilier
    struct Property {
        uint256 id;
        address owner;
        string location;
        string description;
        uint256 pricePerMonth;
        string propertyType; // "apartment", "house", "villa"
        bool available;
        uint256 createdAt;
        string[] imageURIs; // URLs des images (IPFS)
        uint256 bedrooms;
        uint256 bathrooms;
    }
    
    // Structure pour les reviews
    struct Review {
        uint256 propertyId;
        address reviewer;
        uint256 rating; // 1-5
        string comment;
        uint256 timestamp;
    }
    
    // Mapping pour stocker les propriétés
    mapping(uint256 => Property) public properties;
    mapping(uint256 => Review[]) public propertyReviews;
    
    uint256 public propertyCounter = 0;
    
    // Events
    event PropertyListed(uint256 indexed propertyId, address indexed owner, string location, uint256 price);
    event PropertyUpdated(uint256 indexed propertyId);
    event PropertyDelisted(uint256 indexed propertyId);
    event ReviewAdded(uint256 indexed propertyId, address indexed reviewer, uint256 rating);
    
    // Modifiers
    modifier onlyOwner(uint256 _propertyId) {
        require(properties[_propertyId].owner == msg.sender, "Only property owner can modify");
        _;
    }
    
    modifier propertyExists(uint256 _propertyId) {
        require(properties[_propertyId].owner != address(0), "Property does not exist");
        _;
    }
    
    /**
     * @dev Lister un nouvel immobilier
     */
    function listProperty(
        string memory _location,
        string memory _description,
        uint256 _pricePerMonth,
        string memory _propertyType,
        uint256 _bedrooms,
        uint256 _bathrooms,
        string[] memory _imageURIs
    ) public {
        require(_pricePerMonth > 0, "Price must be greater than 0");
        require(bytes(_location).length > 0, "Location cannot be empty");
        
        uint256 propertyId = propertyCounter++;
        
        properties[propertyId] = Property({
            id: propertyId,
            owner: msg.sender,
            location: _location,
            description: _description,
            pricePerMonth: _pricePerMonth,
            propertyType: _propertyType,
            available: true,
            createdAt: block.timestamp,
            imageURIs: _imageURIs,
            bedrooms: _bedrooms,
            bathrooms: _bathrooms
        });
        
        emit PropertyListed(propertyId, msg.sender, _location, _pricePerMonth);
    }
    
    /**
     * @dev Modifier les détails d'une propriété
     */
    function updateProperty(
        uint256 _propertyId,
        string memory _description,
        uint256 _pricePerMonth,
        bool _available
    ) public onlyOwner(_propertyId) propertyExists(_propertyId) {
        require(_pricePerMonth > 0, "Price must be greater than 0");
        
        properties[_propertyId].description = _description;
        properties[_propertyId].pricePerMonth = _pricePerMonth;
        properties[_propertyId].available = _available;
        
        emit PropertyUpdated(_propertyId);
    }
    
    /**
     * @dev Supprimer une propriété
     */
    function delistProperty(uint256 _propertyId) public onlyOwner(_propertyId) propertyExists(_propertyId) {
        properties[_propertyId].available = false;
        emit PropertyDelisted(_propertyId);
    }
    
    /**
     * @dev Obtenir les détails d'une propriété
     */
    function getProperty(uint256 _propertyId) public view propertyExists(_propertyId) returns (Property memory) {
        return properties[_propertyId];
    }
    
    /**
     * @dev Obtenir toutes les propriétés disponibles
     */
    function getAvailableProperties() public view returns (uint256[] memory) {
        uint256 availableCount = 0;
        
        // Compter les propriétés disponibles
        for (uint256 i = 0; i < propertyCounter; i++) {
            if (properties[i].available) {
                availableCount++;
            }
        }
        
        // Créer un tableau avec les IDs des propriétés disponibles
        uint256[] memory availableIds = new uint256[](availableCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < propertyCounter; i++) {
            if (properties[i].available) {
                availableIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return availableIds;
    }
    
    /**
     * @dev Obtenir les propriétés d'un propriétaire
     */
    function getPropertiesByOwner(address _owner) public view returns (uint256[] memory) {
        uint256 ownerCount = 0;
        
        // Compter les propriétés du propriétaire
        for (uint256 i = 0; i < propertyCounter; i++) {
            if (properties[i].owner == _owner) {
                ownerCount++;
            }
        }
        
        uint256[] memory ownerIds = new uint256[](ownerCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < propertyCounter; i++) {
            if (properties[i].owner == _owner) {
                ownerIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return ownerIds;
    }
    
    /**
     * @dev Ajouter une review à une propriété
     */
    function addReview(
        uint256 _propertyId,
        uint256 _rating,
        string memory _comment
    ) public propertyExists(_propertyId) {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(bytes(_comment).length > 0, "Comment cannot be empty");
        
        Review memory newReview = Review({
            propertyId: _propertyId,
            reviewer: msg.sender,
            rating: _rating,
            comment: _comment,
            timestamp: block.timestamp
        });
        
        propertyReviews[_propertyId].push(newReview);
        emit ReviewAdded(_propertyId, msg.sender, _rating);
    }
    
    /**
     * @dev Obtenir les reviews d'une propriété
     */
    function getReviews(uint256 _propertyId) public view propertyExists(_propertyId) returns (Review[] memory) {
        return propertyReviews[_propertyId];
    }
    
    /**
     * @dev Obtenir la moyenne des notes d'une propriété
     */
    function getAverageRating(uint256 _propertyId) public view propertyExists(_propertyId) returns (uint256) {
        Review[] memory reviews = propertyReviews[_propertyId];
        
        if (reviews.length == 0) {
            return 0;
        }
        
        uint256 totalRating = 0;
        for (uint256 i = 0; i < reviews.length; i++) {
            totalRating += reviews[i].rating;
        }
        
        return totalRating / reviews.length;
    }
    
    /**
     * @dev Obtenir le nombre total de propriétés
     */
    function getTotalProperties() public view returns (uint256) {
        return propertyCounter;
    }
}
