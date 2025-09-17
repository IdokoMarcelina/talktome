pragma solidity ^0.8.28;

import "./ENSRegistry.sol";

contract ChatDApp {
    ENSRegistry public ensRegistry;

    struct Message {
        address sender;
        address recipient;
        string content;
        uint256 timestamp;
        bool isRead;
    }

    struct ChatRoom {
        address[] participants;
        uint256 messageCount;
        mapping(uint256 => Message) messages;
        bool isActive;
        bool isGroupChat;
        string name;
    }

    mapping(bytes32 => ChatRoom) public chatRooms;
    mapping(address => bytes32[]) public userChatRooms;
    mapping(address => mapping(address => bytes32)) public directMessageRooms;

    bytes32[] public allChatRooms;
    bytes32 public globalChatRoom;

    event MessageSent(
        bytes32 indexed chatRoomId,
        address indexed sender,
        address indexed recipient,
        string content,
        uint256 timestamp
    );

    event ChatRoomCreated(
        bytes32 indexed chatRoomId,
        address indexed creator,
        address indexed participant,
        uint256 timestamp
    );

    event GroupMessageSent(
        bytes32 indexed chatRoomId,
        address indexed sender,
        string content,
        uint256 timestamp
    );

    modifier onlyRegisteredUser() {
        require(ensRegistry.isRegistered(msg.sender), "User must be registered with ENS");
        _;
    }

    modifier validChatRoom(bytes32 _chatRoomId) {
        require(chatRooms[_chatRoomId].isActive, "Chat room does not exist");
        _;
    }

    modifier isParticipant(bytes32 _chatRoomId) {
        bool found = false;
        for (uint i = 0; i < chatRooms[_chatRoomId].participants.length; i++) {
            if (chatRooms[_chatRoomId].participants[i] == msg.sender) {
                found = true;
                break;
            }
        }
        require(found, "Not a participant of this chat room");
        _;
    }

    constructor(address _ensRegistryAddress) {
        ensRegistry = ENSRegistry(_ensRegistryAddress);

        globalChatRoom = keccak256(abi.encodePacked("GLOBAL_CHAT", block.timestamp));
        ChatRoom storage globalRoom = chatRooms[globalChatRoom];
        globalRoom.isActive = true;
        globalRoom.isGroupChat = true;
        globalRoom.name = "Global Chat";
        globalRoom.messageCount = 0;

        allChatRooms.push(globalChatRoom);
    }

    function createDirectMessage(address _participant)
        external
        onlyRegisteredUser
        returns (bytes32)
    {
        require(_participant != msg.sender, "Cannot create DM with yourself");
        require(ensRegistry.isRegistered(_participant), "Participant must be registered with ENS");

        bytes32 existingRoom = directMessageRooms[msg.sender][_participant];
        if (existingRoom != bytes32(0)) {
            return existingRoom;
        }

        existingRoom = directMessageRooms[_participant][msg.sender];
        if (existingRoom != bytes32(0)) {
            return existingRoom;
        }

        bytes32 chatRoomId = keccak256(
            abi.encodePacked(msg.sender, _participant, block.timestamp)
        );

        ChatRoom storage newRoom = chatRooms[chatRoomId];
        newRoom.participants.push(msg.sender);
        newRoom.participants.push(_participant);
        newRoom.messageCount = 0;
        newRoom.isActive = true;
        newRoom.isGroupChat = false;
        newRoom.name = "";

        userChatRooms[msg.sender].push(chatRoomId);
        userChatRooms[_participant].push(chatRoomId);

        directMessageRooms[msg.sender][_participant] = chatRoomId;
        directMessageRooms[_participant][msg.sender] = chatRoomId;

        allChatRooms.push(chatRoomId);

        emit ChatRoomCreated(chatRoomId, msg.sender, _participant, block.timestamp);

        return chatRoomId;
    }

    function sendMessage(bytes32 _chatRoomId, address _recipient, string memory _content)
        external
        onlyRegisteredUser
        validChatRoom(_chatRoomId)
        isParticipant(_chatRoomId)
    {
        require(bytes(_content).length > 0, "Message content cannot be empty");
        require(bytes(_content).length <= 1000, "Message too long");
        require(_recipient != msg.sender, "Cannot send message to yourself");

        bool recipientIsParticipant = false;
        for (uint i = 0; i < chatRooms[_chatRoomId].participants.length; i++) {
            if (chatRooms[_chatRoomId].participants[i] == _recipient) {
                recipientIsParticipant = true;
                break;
            }
        }
        require(recipientIsParticipant, "Recipient is not a participant");

        ChatRoom storage room = chatRooms[_chatRoomId];
        uint256 messageId = room.messageCount;

        room.messages[messageId] = Message({
            sender: msg.sender,
            recipient: _recipient,
            content: _content,
            timestamp: block.timestamp,
            isRead: false
        });

        room.messageCount++;

        emit MessageSent(_chatRoomId, msg.sender, _recipient, _content, block.timestamp);
    }

    function sendMessageByENS(string memory _recipientENS, string memory _content)
        external
        onlyRegisteredUser
        returns (bytes32)
    {
        address recipient = ensRegistry.getAddressByENS(_recipientENS);

        bytes32 chatRoomId = this.createDirectMessage(recipient);
        this.sendMessage(chatRoomId, recipient, _content);

        return chatRoomId;
    }

    function markMessageAsRead(bytes32 _chatRoomId, uint256 _messageId)
        external
        validChatRoom(_chatRoomId)
        isParticipant(_chatRoomId)
    {
        require(_messageId < chatRooms[_chatRoomId].messageCount, "Message does not exist");
        require(
            chatRooms[_chatRoomId].messages[_messageId].recipient == msg.sender,
            "Only recipient can mark message as read"
        );

        chatRooms[_chatRoomId].messages[_messageId].isRead = true;
    }

    function getMessage(bytes32 _chatRoomId, uint256 _messageId)
        external
        view
        validChatRoom(_chatRoomId)
        isParticipant(_chatRoomId)
        returns (Message memory)
    {
        require(_messageId < chatRooms[_chatRoomId].messageCount, "Message does not exist");
        return chatRooms[_chatRoomId].messages[_messageId];
    }

    function getChatRoomMessages(bytes32 _chatRoomId, uint256 _offset, uint256 _limit)
        external
        view
        validChatRoom(_chatRoomId)
        isParticipant(_chatRoomId)
        returns (Message[] memory)
    {
        ChatRoom storage room = chatRooms[_chatRoomId];
        require(_offset < room.messageCount, "Offset out of bounds");

        uint256 end = _offset + _limit;
        if (end > room.messageCount) {
            end = room.messageCount;
        }

        Message[] memory messages = new Message[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            messages[i - _offset] = room.messages[i];
        }

        return messages;
    }

    function getUserChatRooms(address _user) external view returns (bytes32[] memory) {
        return userChatRooms[_user];
    }

    function getChatRoomParticipants(bytes32 _chatRoomId)
        external
        view
        validChatRoom(_chatRoomId)
        returns (address[] memory)
    {
        return chatRooms[_chatRoomId].participants;
    }

    function getChatRoomMessageCount(bytes32 _chatRoomId)
        external
        view
        validChatRoom(_chatRoomId)
        returns (uint256)
    {
        return chatRooms[_chatRoomId].messageCount;
    }

    function getUnreadMessageCount(bytes32 _chatRoomId, address _user)
        external
        view
        validChatRoom(_chatRoomId)
        returns (uint256)
    {
        ChatRoom storage room = chatRooms[_chatRoomId];
        uint256 unreadCount = 0;

        for (uint256 i = 0; i < room.messageCount; i++) {
            if (room.messages[i].recipient == _user && !room.messages[i].isRead) {
                unreadCount++;
            }
        }

        return unreadCount;
    }

    function sendGroupMessage(string memory _content)
        external
        onlyRegisteredUser
    {
        require(bytes(_content).length > 0, "Message content cannot be empty");
        require(bytes(_content).length <= 1000, "Message too long");

        // Auto-join global chat if not already a participant
        _ensureGlobalChatParticipant();

        ChatRoom storage room = chatRooms[globalChatRoom];
        uint256 messageId = room.messageCount;

        room.messages[messageId] = Message({
            sender: msg.sender,
            recipient: address(0),
            content: _content,
            timestamp: block.timestamp,
            isRead: false
        });

        room.messageCount++;

        emit GroupMessageSent(globalChatRoom, msg.sender, _content, block.timestamp);
    }

    function joinGlobalChat() external onlyRegisteredUser {
        _ensureGlobalChatParticipant();
    }

    function _ensureGlobalChatParticipant() internal {
        bool alreadyParticipant = false;
        for (uint i = 0; i < chatRooms[globalChatRoom].participants.length; i++) {
            if (chatRooms[globalChatRoom].participants[i] == msg.sender) {
                alreadyParticipant = true;
                break;
            }
        }

        if (!alreadyParticipant) {
            chatRooms[globalChatRoom].participants.push(msg.sender);
            userChatRooms[msg.sender].push(globalChatRoom);
        }
    }

    function getGlobalChatRoom() external view returns (bytes32) {
        return globalChatRoom;
    }

    function getAllChatRooms() external view returns (bytes32[] memory) {
        return allChatRooms;
    }

    function getAllRegisteredUsers() external view returns (address[] memory) {
        return ensRegistry.getAllRegisteredAddresses();
    }

    function isParticipantOfChatRoom(bytes32 _chatRoomId, address _user)
        external
        view
        validChatRoom(_chatRoomId)
        returns (bool)
    {
        for (uint i = 0; i < chatRooms[_chatRoomId].participants.length; i++) {
            if (chatRooms[_chatRoomId].participants[i] == _user) {
                return true;
            }
        }
        return false;
    }

    function isParticipantOfGlobalChat(address _user) external view returns (bool) {
        return this.isParticipantOfChatRoom(globalChatRoom, _user);
    }
}