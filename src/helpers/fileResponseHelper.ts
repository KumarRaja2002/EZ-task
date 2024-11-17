import { s3FileService } from '../services/database/s3Service/s3DataServiceProvider';

const S3FileService = new s3FileService();



export const mapFileResponse = async (file: any): Promise<any> => {
    const presignedUrl = await S3FileService.generateDownloadFilePresignedURL(file.path);

    return {
        file_id: file.id,  // changing id to file_id
        title: file.title,
        name: file.name,
        mime_type: file.mime_type,
        size: file.size,
        path: file.path,
        uploaded_at: file.uploaded_at,
        status: file.status,
        type: file.type,
        created_at: file.created_at,
        updated_at: file.updated_at,
        url: presignedUrl // Renaming downloadUrl to url
    };
};

