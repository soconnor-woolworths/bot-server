import { BlobServiceClient } from '@azure/storage-blob';
import { hashUrl } from './utils';

export class BlobReader {
  readonly AZURE_STORAGE_CONNECTION_STRING =
    process.env.AZURE_STORAGE_CONNECTION_STRING;
  readonly containerName = 'prerendered-pages';

  constructor() {}

  public async getFromBlobStorage(pageUrl: string) {
    if (!this.AZURE_STORAGE_CONNECTION_STRING) {
      throw Error('Azure Storage Connection string not found');
    }
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      this.AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient(
      this.containerName
    );
    
    const blobName = this.getBlobName(pageUrl);
    // const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const blockBlobClient = containerClient.getBlockBlobClient('hxIqoHc+2QTnnfYUbk1CSNl6Zww=');
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const blobContent = await this.streamToText(downloadBlockBlobResponse.readableStreamBody);
    
    console.log("\nDownloaded blob content...");
    console.log(blobContent);

    return blobContent;
  }

  private getBlobName(pageUrl: string): string {
    return hashUrl(pageUrl);
  }

  // Convert stream to text
  async streamToText(readable: any) {
    readable.setEncoding('utf8');
    let data = '';
    for await (const chunk of readable) {
      data += chunk;
    }
    return data;
  }
}
