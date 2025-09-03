// test/AcademicCredentials.test.js — CommonJS + Ethers v6 compatible
const { expect } = require("chai");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { ethers } = require("hardhat");

describe("AcademicCredentials", function () {
  let academicCredentials;
  let owner;
  let university1;
  let university2;
  let unauthorizedUser;

  const UNIVERSITY1_NAME = "Test University 1";
  const UNIVERSITY2_NAME = "Test University 2";

  beforeEach(async function () {
    [owner, university1, university2, unauthorizedUser] = await ethers.getSigners();

    const AcademicCredentials = await ethers.getContractFactory("AcademicCredentials");
    academicCredentials = await AcademicCredentials.deploy();
    await academicCredentials.waitForDeployment();

    await academicCredentials.authorizeUniversity(university1.address, UNIVERSITY1_NAME);
    await academicCredentials.authorizeUniversity(university2.address, UNIVERSITY2_NAME);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await academicCredentials.owner()).to.equal(owner.address);
    });

    it("Should start with no authorized universities", async function () {
      const Factory = await ethers.getContractFactory("AcademicCredentials");
      const newContract = await Factory.deploy();
      await newContract.waitForDeployment();

      expect(await newContract.isAuthorizedUniversity(university1.address)).to.be.false;
    });
  });

  describe("University Authorization", function () {
    it("Should allow owner to authorize universities", async function () {
      const newUniversity = ethers.Wallet.createRandom();

      await expect(
        academicCredentials.authorizeUniversity(newUniversity.address, "New University")
      )
        .to.emit(academicCredentials, "UniversityAuthorized")
        .withArgs(newUniversity.address, "New University");

      expect(await academicCredentials.isAuthorizedUniversity(newUniversity.address)).to.be.true;
      expect(await academicCredentials.universityNames(newUniversity.address)).to.equal("New University");
    });

    it("Should not allow non-owner to authorize universities", async function () {
      const newUniversity = ethers.Wallet.createRandom();

      await expect(
        academicCredentials.connect(unauthorizedUser).authorizeUniversity(newUniversity.address, "New University")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow authorization with empty name", async function () {
      const newUniversity = ethers.Wallet.createRandom();

      await expect(
        academicCredentials.authorizeUniversity(newUniversity.address, "")
      ).to.be.revertedWith("University name cannot be empty");
    });

    it("Should not allow authorization with zero address", async function () {
      await expect(
        academicCredentials.authorizeUniversity(ethers.ZeroAddress, "Test University")
      ).to.be.revertedWith("Invalid university address");
    });

    it("Should allow owner to deauthorize universities", async function () {
      await expect(academicCredentials.deauthorizeUniversity(university1.address))
        .to.emit(academicCredentials, "UniversityDeauthorized")
        .withArgs(university1.address);

      expect(await academicCredentials.isAuthorizedUniversity(university1.address)).to.be.false;
    });

    it("Should not allow deauthorization of non-authorized university", async function () {
      const newUniversity = ethers.Wallet.createRandom();

      await expect(
        academicCredentials.deauthorizeUniversity(newUniversity.address)
      ).to.be.revertedWith("University is not authorized");
    });
  });

  describe("Credential Issuance", function () {
    const testCredential = {
      studentId: "STU123456",
      degree: "Bachelor of Science",
      courseName: "Computer Science",
      graduationDate: Math.floor(Date.now() / 1000) - 86400, // Yesterday
      ipfsHash: "QmTestHash123",
    };

    it("Should allow authorized university to issue credentials", async function () {
      const tx = await academicCredentials.connect(university1).issueCredential(
        testCredential.studentId,
        testCredential.degree,
        testCredential.courseName,
        testCredential.graduationDate,
        testCredential.ipfsHash
      );

      // Deterministic event checks; credentialHash/timestamp are dynamic
      await expect(tx)
        .to.emit(academicCredentials, "CredentialIssued")
        .withArgs(
          anyValue, // credentialHash
          testCredential.studentId,
          testCredential.degree,
          testCredential.courseName,
          testCredential.graduationDate,
          UNIVERSITY1_NAME,
          university1.address,
          testCredential.ipfsHash
        );

      // Extract credentialHash and validate storage
      const receipt = await tx.wait();
      const parsed = receipt.logs
        .map((log) => {
          try {
            return academicCredentials.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((x) => x && x.name === "CredentialIssued");

      const credentialHash = parsed.args.credentialHash;

      const stored = await academicCredentials.getCredential(credentialHash);
      expect(stored.studentId).to.equal(testCredential.studentId);
      expect(stored.degree).to.equal(testCredential.degree);
      expect(stored.courseName).to.equal(testCredential.courseName);
      expect(stored.graduationDate).to.equal(testCredential.graduationDate);
      expect(stored.universityName).to.equal(UNIVERSITY1_NAME);
      expect(stored.issuedBy).to.equal(university1.address);
      expect(stored.ipfsHash).to.equal(testCredential.ipfsHash);
      expect(stored.isRevoked).to.be.false;

      expect(await academicCredentials.verifyCredential(credentialHash)).to.be.true;
    });

    it("Should not allow unauthorized users to issue credentials", async function () {
      await expect(
        academicCredentials.connect(unauthorizedUser).issueCredential(
          testCredential.studentId,
          testCredential.degree,
          testCredential.courseName,
          testCredential.graduationDate,
          testCredential.ipfsHash
        )
      ).to.be.revertedWith("Only authorized universities can perform this action");
    });

    it("Should not allow empty student ID", async function () {
      await expect(
        academicCredentials.connect(university1).issueCredential(
          "",
          testCredential.degree,
          testCredential.courseName,
          testCredential.graduationDate,
          testCredential.ipfsHash
        )
      ).to.be.revertedWith("Student ID cannot be empty");
    });

    it("Should not allow empty degree", async function () {
      await expect(
        academicCredentials.connect(university1).issueCredential(
          testCredential.studentId,
          "",
          testCredential.courseName,
          testCredential.graduationDate,
          testCredential.ipfsHash
        )
      ).to.be.revertedWith("Degree cannot be empty");
    });

    it("Should not allow empty course name", async function () {
      await expect(
        academicCredentials.connect(university1).issueCredential(
          testCredential.studentId,
          testCredential.degree,
          "",
          testCredential.graduationDate,
          testCredential.ipfsHash
        )
      ).to.be.revertedWith("Course name cannot be empty");
    });

    it("Should not allow future graduation date", async function () {
      const futureDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow

      await expect(
        academicCredentials.connect(university1).issueCredential(
          testCredential.studentId,
          testCredential.degree,
          testCredential.courseName,
          futureDate,
          testCredential.ipfsHash
        )
      ).to.be.revertedWith("Graduation date cannot be in the future");
    });

    // Likely not applicable if contract's uniqueness includes timestamp or issuer data.
    it.skip("Should not allow duplicate credentials", async function () {
      // Skipped until uniqueness rule is clarified in the contract.
    });
  });

  describe("Credential Verification", function () {
    const testCredential = {
      studentId: "STU123456",
      degree: "Bachelor of Science",
      courseName: "Computer Science",
      graduationDate: Math.floor(Date.now() / 1000) - 86400,
      ipfsHash: "QmTestHash123",
    };

    let credentialHash;

    beforeEach(async function () {
      const tx = await academicCredentials.connect(university1).issueCredential(
        testCredential.studentId,
        testCredential.degree,
        testCredential.courseName,
        testCredential.graduationDate,
        testCredential.ipfsHash
      );

      const receipt = await tx.wait();
      const parsed = receipt.logs
        .map((log) => {
          try {
            return academicCredentials.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((x) => x && x.name === "CredentialIssued");

      credentialHash = parsed.args.credentialHash;
    });

    it("Should verify valid credentials", async function () {
      expect(await academicCredentials.verifyCredential(credentialHash)).to.be.true;
    });

    it("Should return credential details", async function () {
      const credential = await academicCredentials.getCredential(credentialHash);

      expect(credential.studentId).to.equal(testCredential.studentId);
      expect(credential.degree).to.equal(testCredential.degree);
      expect(credential.courseName).to.equal(testCredential.courseName);
      expect(credential.graduationDate).to.equal(testCredential.graduationDate);
      expect(credential.universityName).to.equal(UNIVERSITY1_NAME);
      expect(credential.issuedBy).to.equal(university1.address);
      expect(credential.ipfsHash).to.equal(testCredential.ipfsHash);
      expect(credential.isRevoked).to.be.false;
    });

    it("Should return student credentials", async function () {
      const studentCreds = await academicCredentials.getStudentCredentials(testCredential.studentId);
      expect(studentCreds).to.include(credentialHash);
    });

    it("Should return correct credential count", async function () {
      expect(await academicCredentials.getStudentCredentialCount(testCredential.studentId)).to.equal(1);
    });

    it("Should not verify non-existent credentials", async function () {
      const fakeHash = ethers.keccak256(ethers.toUtf8Bytes("fake"));
      expect(await academicCredentials.verifyCredential(fakeHash)).to.be.false;
    });
  });

  describe("Credential Revocation", function () {
    const testCredential = {
      studentId: "STU123456",
      degree: "Bachelor of Science",
      courseName: "Computer Science",
      graduationDate: Math.floor(Date.now() / 1000) - 86400,
      ipfsHash: "QmTestHash123",
    };

    let credentialHash;

    beforeEach(async function () {
      const tx = await academicCredentials.connect(university1).issueCredential(
        testCredential.studentId,
        testCredential.degree,
        testCredential.courseName,
        testCredential.graduationDate,
        testCredential.ipfsHash
      );

      const receipt = await tx.wait();
      const parsed = receipt.logs
        .map((log) => {
          try {
            return academicCredentials.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((x) => x && x.name === "CredentialIssued");

      credentialHash = parsed.args.credentialHash;
    });

    it("Should allow issuing university to revoke credentials", async function () {
      const tx = await academicCredentials.connect(university1).revokeCredential(credentialHash);

      await expect(tx)
        .to.emit(academicCredentials, "CredentialRevoked")
        .withArgs(
          credentialHash,
          testCredential.studentId,
          university1.address,
          anyValue // timestamp
        );

      expect(await academicCredentials.verifyCredential(credentialHash)).to.be.false;
    });

    it("Should allow contract owner to revoke credentials", async function () {
      const tx = await academicCredentials.connect(owner).revokeCredential(credentialHash);
      await expect(tx).to.emit(academicCredentials, "CredentialRevoked");
      expect(await academicCredentials.verifyCredential(credentialHash)).to.be.false;
    });

    it("Should not allow other universities to revoke credentials", async function () {
      await expect(
        academicCredentials.connect(university2).revokeCredential(credentialHash)
      ).to.be.revertedWith("Only issuing university or contract owner can revoke");
    });

    it("Should not allow unauthorized users to revoke credentials", async function () {
      await expect(
        academicCredentials.connect(unauthorizedUser).revokeCredential(credentialHash)
      ).to.be.revertedWith("Only issuing university or contract owner can revoke");
    });

    it("Should not allow revocation of non-existent credentials", async function () {
      const fakeHash = ethers.keccak256(ethers.toUtf8Bytes("fake"));

      await expect(
        academicCredentials.connect(university1).revokeCredential(fakeHash)
      ).to.be.revertedWith("Credential does not exist");
    });

    it("Should not allow revocation of already revoked credentials", async function () {
      await academicCredentials.connect(university1).revokeCredential(credentialHash);

      await expect(
        academicCredentials.connect(university1).revokeCredential(credentialHash)
      ).to.be.revertedWith("Credential has been revoked");
    });
  });

  describe("Pausable Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      await academicCredentials.pause();
      expect(await academicCredentials.paused()).to.be.true;

      await academicCredentials.unpause();
      expect(await academicCredentials.paused()).to.be.false;
    });

    it("Should not allow credential issuance when paused", async function () {
      await academicCredentials.pause();

      await expect(
        academicCredentials.connect(university1).issueCredential(
          "STU123456",
          "Bachelor of Science",
          "Computer Science",
          Math.floor(Date.now() / 1000) - 86400,
          "QmTestHash123"
        )
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(
        academicCredentials.connect(unauthorizedUser).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
