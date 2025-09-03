// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract AcademicCredentials is Ownable, ReentrancyGuard, Pausable {
    struct Credential {
        string studentId;
        string degree;
        string courseName;
        uint256 graduationDate;
        string universityName;
        address issuedBy;
        uint256 issuedAt;
        string ipfsHash;
        bool isRevoked;
        uint256 revokedAt;
    }

    mapping(bytes32 => Credential) public credentials;
    mapping(string => bytes32[]) public studentCredentials;
    mapping(address => bool) public authorizedUniversities;
    mapping(address => string) public universityNames;

    event CredentialIssued(
        bytes32 indexed credentialHash,
        string indexed studentId,
        string degree,
        string courseName,
        uint256 graduationDate,
        string universityName,
        address indexed issuedBy,
        string ipfsHash
    );

    event CredentialRevoked(
        bytes32 indexed credentialHash,
        string indexed studentId,
        address indexed revokedBy,
        uint256 revokedAt
    );

    event UniversityAuthorized(address indexed university, string name);
    event UniversityDeauthorized(address indexed university);

    modifier onlyAuthorizedUniversity() {
        require(
            authorizedUniversities[msg.sender],
            "Only authorized universities can perform this action"
        );
        _;
    }

    modifier credentialExists(bytes32 credentialHash) {
        require(credentials[credentialHash].issuedAt != 0, "Credential does not exist");
        _;
    }

    modifier credentialNotRevoked(bytes32 credentialHash) {
        require(!credentials[credentialHash].isRevoked, "Credential has been revoked");
        _;
    }

    /// ✅ Single constructor
    constructor() Ownable() {
        // Auto-authorize the deployer as a university
        authorizedUniversities[msg.sender] = true;
        universityNames[msg.sender] = "My Test University";

        emit UniversityAuthorized(msg.sender, "My Test University");
    }

    function deauthorizeUniversity(address university) external onlyOwner {
        require(authorizedUniversities[university], "University is not authorized");

        authorizedUniversities[university] = false;
        delete universityNames[university];

        emit UniversityDeauthorized(university);
    }

    function issueCredential(
        string memory studentId,
        string memory degree,
        string memory courseName,
        uint256 graduationDate,
        string memory ipfsHash
    ) external onlyAuthorizedUniversity nonReentrant whenNotPaused {
        require(bytes(studentId).length > 0, "Student ID cannot be empty");
        require(bytes(degree).length > 0, "Degree cannot be empty");
        require(bytes(courseName).length > 0, "Course name cannot be empty");
        require(graduationDate <= block.timestamp, "Graduation date cannot be in the future");

        bytes32 credentialHash = keccak256(
            abi.encodePacked(studentId, degree, courseName, graduationDate, universityNames[msg.sender], block.timestamp)
        );

        require(credentials[credentialHash].issuedAt == 0, "Credential already exists");

        Credential memory newCredential = Credential({
            studentId: studentId,
            degree: degree,
            courseName: courseName,
            graduationDate: graduationDate,
            universityName: universityNames[msg.sender],
            issuedBy: msg.sender,
            issuedAt: block.timestamp,
            ipfsHash: ipfsHash,
            isRevoked: false,
            revokedAt: 0
        });

        credentials[credentialHash] = newCredential;
        studentCredentials[studentId].push(credentialHash);

        emit CredentialIssued(
            credentialHash,
            studentId,
            degree,
            courseName,
            graduationDate,
            universityNames[msg.sender],
            msg.sender,
            ipfsHash
        );
    }

    function revokeCredential(bytes32 credentialHash)
        external
        credentialExists(credentialHash)
        credentialNotRevoked(credentialHash)
        nonReentrant
    {
        Credential storage credential = credentials[credentialHash];

        require(
            msg.sender == credential.issuedBy || msg.sender == owner(),
            "Only issuing university or contract owner can revoke"
        );

        credential.isRevoked = true;
        credential.revokedAt = block.timestamp;

        emit CredentialRevoked(
            credentialHash,
            credential.studentId,
            msg.sender,
            block.timestamp
        );
    }

    function getCredential(bytes32 credentialHash)
        external
        view
        credentialExists(credentialHash)
        returns (Credential memory)
    {
        return credentials[credentialHash];
    }

    function getStudentCredentials(string memory studentId)
        external
        view
        returns (bytes32[] memory)
    {
        return studentCredentials[studentId];
    }

    function verifyCredential(bytes32 credentialHash)
        external
        view
        returns (bool)
    {
        return credentials[credentialHash].issuedAt != 0 && !credentials[credentialHash].isRevoked;
    }

    function getStudentCredentialCount(string memory studentId)
        external
        view
        returns (uint256)
    {
        return studentCredentials[studentId].length;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function isAuthorizedUniversity(address university) external view returns (bool) {
        return authorizedUniversities[university];
    }

    /// ✅ Helper function
    function getUniversity(address uniAddress) external view returns (string memory name, bool isAuthorized) {
        return (universityNames[uniAddress], authorizedUniversities[uniAddress]);
    }
}
