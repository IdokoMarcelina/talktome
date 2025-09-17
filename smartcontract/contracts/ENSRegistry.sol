pragma solidity ^0.8.28;

contract ENSRegistry {
    struct ENSRecord {
        address owner;
        string ensName;
        string profileImageIPFS;
        string bio;
        uint256 registrationTime;
        bool isActive;
    }

    mapping(address => ENSRecord) public addressToENS;
    mapping(string => address) public ensToAddress;
    mapping(address => bool) public isRegistered;

    address[] public registeredAddresses;
    string[] public registeredDomains;

    event ENSRegistered(address indexed user, string ensName, string profileImageIPFS, uint256 timestamp);
    event ENSUpdated(address indexed user, string oldENS, string newENS, uint256 timestamp);
    event ProfileUpdated(address indexed user, string profileImageIPFS, string bio, uint256 timestamp);

    modifier onlyUnregistered() {
        require(!isRegistered[msg.sender], "Address already has an ENS name");
        _;
    }

    modifier onlyRegistered() {
        require(isRegistered[msg.sender], "Address not registered");
        _;
    }

    modifier validENSName(string memory _ensName) {
        require(bytes(_ensName).length > 0, "ENS name cannot be empty");
        require(bytes(_ensName).length <= 50, "ENS name too long");
        require(ensToAddress[_ensName] == address(0), "ENS name already taken");
        _;
    }

    function registerENS(string memory _ensName, string memory _profileImageIPFS, string memory _bio)
        external
        onlyUnregistered
        validENSName(_ensName)
    {
        ENSRecord memory newRecord = ENSRecord({
            owner: msg.sender,
            ensName: _ensName,
            profileImageIPFS: _profileImageIPFS,
            bio: _bio,
            registrationTime: block.timestamp,
            isActive: true
        });

        addressToENS[msg.sender] = newRecord;
        ensToAddress[_ensName] = msg.sender;
        isRegistered[msg.sender] = true;

        registeredAddresses.push(msg.sender);
        registeredDomains.push(_ensName);

        emit ENSRegistered(msg.sender, _ensName, _profileImageIPFS, block.timestamp);
    }

    function updateENS(string memory _newENSName)
        external
        onlyRegistered
        validENSName(_newENSName)
    {
        string memory oldENS = addressToENS[msg.sender].ensName;

        delete ensToAddress[oldENS];

        addressToENS[msg.sender].ensName = _newENSName;
        ensToAddress[_newENSName] = msg.sender;

        for (uint i = 0; i < registeredDomains.length; i++) {
            if (keccak256(bytes(registeredDomains[i])) == keccak256(bytes(oldENS))) {
                registeredDomains[i] = _newENSName;
                break;
            }
        }

        emit ENSUpdated(msg.sender, oldENS, _newENSName, block.timestamp);
    }

    function getENSByAddress(address _address) external view returns (string memory) {
        require(isRegistered[_address], "Address not registered");
        return addressToENS[_address].ensName;
    }

    function getAddressByENS(string memory _ensName) external view returns (address) {
        address addr = ensToAddress[_ensName];
        require(addr != address(0), "ENS name not found");
        return addr;
    }

    function getUserRecord(address _address) external view returns (ENSRecord memory) {
        require(isRegistered[_address], "Address not registered");
        return addressToENS[_address];
    }

    function getAllRegisteredAddresses() external view returns (address[] memory) {
        return registeredAddresses;
    }

    function getAllRegisteredDomains() external view returns (string[] memory) {
        return registeredDomains;
    }

    function updateProfile(string memory _profileImageIPFS, string memory _bio)
        external
        onlyRegistered
    {
        addressToENS[msg.sender].profileImageIPFS = _profileImageIPFS;
        addressToENS[msg.sender].bio = _bio;

        emit ProfileUpdated(msg.sender, _profileImageIPFS, _bio, block.timestamp);
    }

    function getProfileByENS(string memory _ensName) external view returns (string memory profileImageIPFS, string memory bio) {
        address addr = ensToAddress[_ensName];
        require(addr != address(0), "ENS name not found");
        ENSRecord memory record = addressToENS[addr];
        return (record.profileImageIPFS, record.bio);
    }

    function getProfileByAddress(address _address) external view returns (string memory profileImageIPFS, string memory bio) {
        require(isRegistered[_address], "Address not registered");
        ENSRecord memory record = addressToENS[_address];
        return (record.profileImageIPFS, record.bio);
    }

    function getTotalRegistrations() external view returns (uint256) {
        return registeredAddresses.length;
    }

    function checkIsRegistered(address _address) external view returns (bool) {
        return isRegistered[_address];
    }
}