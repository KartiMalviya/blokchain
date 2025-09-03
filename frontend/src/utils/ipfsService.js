import { create } from 'ipfs-http-client';

// Utility function for decoding Uint8Array -> string
const toString = (content) => new TextDecoder().decode(content);

/**
 * IPFS Service for handling off-chain document storage
 */
class IPFSService {
  constructor() {
    this.ipfs = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      // For production with Infura, enable with your credentials:
      // headers: {
      //   authorization: 'Basic ' + btoa(process.env.REACT_APP_INFURA_PROJECT_ID + ':' + process.env.REACT_APP_INFURA_PROJECT_SECRET)
      // }
    });
  }

  async uploadFile(file) {
    try {
      console.log('Uploading file to IPFS...', file.name || 'buffer');
      const result = await this.ipfs.add(file);
      console.log('File uploaded successfully:', result.path);
      return result.path;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  async uploadJSON(data) {
    try {
      const jsonString = JSON.stringify(data);
      const result = await this.ipfs.add(jsonString);
      console.log('JSON uploaded successfully:', result.path);
      return result.path;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  }

  async uploadTranscript(transcriptData) {
    const transcript = {
      type: 'academic_transcript',
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: transcriptData,
    };
    return await this.uploadJSON(transcript);
  }

  async getFile(hash) {
    try {
      console.log('Retrieving file from IPFS:', hash);
      const chunks = [];
      for await (const chunk of this.ipfs.cat(hash)) {
        chunks.push(chunk);
      }
      const content = new Uint8Array(chunks.reduce((acc, curr) => acc + curr.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        content.set(chunk, offset);
        offset += chunk.length;
      }
      return content;
    } catch (error) {
      console.error('Error retrieving file from IPFS:', error);
      throw new Error('Failed to retrieve file from IPFS');
    }
  }

  async getJSON(hash) {
    try {
      const content = await this.getFile(hash);
      return JSON.parse(toString(content));
    } catch (error) {
      console.error('Error retrieving JSON from IPFS:', error);
      throw new Error('Failed to retrieve JSON from IPFS');
    }
  }

  async getTranscript(hash) {
    const transcript = await this.getJSON(hash);
    if (transcript.type !== 'academic_transcript') {
      throw new Error('Invalid transcript format');
    }
    return transcript.data;
  }

  getGatewayURL(hash) {
    return `https://ipfs.io/ipfs/${hash}`;
  }

  isValidHash(hash) {
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash);
  }

  async uploadMultipleFiles(files) {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return await Promise.all(uploadPromises);
  }

  async createDirectory(directoryStructure) {
    try {
      const files = Object.entries(directoryStructure).map(([path, content]) => ({
        path,
        content: typeof content === 'string' ? content : JSON.stringify(content),
      }));

      const result = this.ipfs.addAll(files, { wrapWithDirectory: true });
      let rootHash = null;
      for await (const file of result) {
        if (file.path === '') {
          rootHash = file.cid.toString(); // ✅ fixed
        }
      }
      return rootHash;
    } catch (error) {
      console.error('Error creating directory in IPFS:', error);
      throw new Error('Failed to create directory in IPFS');
    }
  }
}

// Export singleton instance
const ipfsService = new IPFSService();
export default ipfsService;
