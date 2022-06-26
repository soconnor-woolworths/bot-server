import { BlobServiceClient } from '@azure/storage-blob';

export class BlobReader {
  readonly AZURE_STORAGE_CONNECTION_STRING =
    process.env.AZURE_STORAGE_CONNECTION_STRING;
  readonly containerName = 'prerendered-pages';

  constructor() {}

  public async getFromBlobStorage(hashedUrl: string) {
    if (!this.AZURE_STORAGE_CONNECTION_STRING) {
      throw Error('Azure Storage Connection string not found');
    }
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      this.AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient(
      this.containerName
    );

    const blockBlobClient = containerClient.getBlockBlobClient(hashedUrl);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const blobContent = await this.streamToText(
      downloadBlockBlobResponse.readableStreamBody
    );

    console.log('\nDownloaded blob content...');
    //console.log(blobContent);

    return blobContent;
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
