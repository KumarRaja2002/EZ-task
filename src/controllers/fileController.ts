import { Context } from 'hono';
import { fileService } from '../services/database/fileDataServiceProvider';
import { ResponseHelper } from '../helpers/responseHelper';
import PaginationHelper from '../helpers/paginationHelper';
import { sortHelper } from '../helpers/sortHelper';
import { s3FileService } from '../services/database/s3Service/s3DataServiceProvider';
import validate from '../helpers/validationHelper';
import { GeneratePresignedUrlDataInput, generatePresignedUrlData } from "../validations/s3Validations/generatePresignedUrlData";
import { singleFileData } from '../validations/fileValidaions/uploadFileData';
import { NotFoundException } from '../exceptions/notFounException';
import { FILE_FETCHED, FILE_NOT_FOUND, FILE_UPLOADED, FILES_FETCHED, PRESIGNED_URL_GENERATED, ERROR_FETCHING_FILES } from '../constants/appMessages';
import { mapFileResponse } from '../helpers/fileResponseHelper';

const S3FileService = new s3FileService();

class FileController {

  public async generatePresignedUrl(c: Context) {
    try {
      const reqData = await c.req.json();

      const validatedData: GeneratePresignedUrlDataInput = await validate(generatePresignedUrlData, reqData);

      const { fileName, fileType, fileSize } = validatedData;
      const timestamp = Date.now();
      const updatedFileName = `${timestamp}_${fileName}`;

      const file = await fileService.getFileByFileName(fileName);
      const filePath= file.path;

      const { presignedUrl, path } = await S3FileService.generatePresignedUrl(filePath, fileType);

      return ResponseHelper.sendSuccessResponse(c, 200, PRESIGNED_URL_GENERATED, {
        generate_url: presignedUrl,
        file_name: updatedFileName,
        file_size: fileSize,
        file_type: fileType,
        path,
      });
    } catch (error: any) {
      throw error;
    }
  }

  public async addFile(c: Context) {
    try {
      const fileData = await c.req.json();
      const user = c.get("user");
      console.log(user)
      if (!user) {
        throw new Error('User not authenticated');
      }
      if (user.user_type !== "operation") {
       throw new Error('Only operation users can upload files');
      }

      const validatedData = await validate(singleFileData, fileData);

      const mappedFileData = {
        ...validatedData,
        uploaded_by: user.id,
      };

      const titleExists = await fileService.checkTitleExists(mappedFileData.title);
      if (titleExists) {
        return ResponseHelper.sendErrorResponse(c, 409, `A file with the title '${mappedFileData.title}' already exists.`);
      }

      const result = await fileService.createFile(mappedFileData);
      return ResponseHelper.sendSuccessResponse(c, 200, FILE_UPLOADED, result);

    } catch (error: any) {
      throw error;
    }
  }

  public async getFiles(c: Context) {
    try {
      const query = c.req.query();
      const page: number = parseInt(query.page || '1', 10);
      const limit: number = parseInt(query.limit || '10', 10);
      const skip: number = (page - 1) * limit;

      const sort = sortHelper.dynamicSort(query.sort_by, query.sort_type);

      const [files, totalCount] = await Promise.all([
        fileService.findAll({ offset: skip, limit, sort }),
        fileService.getCount(),
      ]);

      const updatedFiles: any = await Promise.all(
        files.map(async (file) => await mapFileResponse(file))
      );

      const result = await PaginationHelper.getPaginationResponse({
        page,
        count: totalCount,
        limit,
        skip,
        data: updatedFiles,
        message: FILES_FETCHED,
        searchString: query.search_string || ''
      });
      return c.json(result);
    } catch (error: any) {
      console.error(ERROR_FETCHING_FILES, error);
      throw error;
    }
  }

  public async getOne(c: Context) {
    try {
      const fileId = +c.req.param('file_id');

      const fileData = await fileService.findFileById(fileId);

      if (!fileData) {
        throw new NotFoundException(FILE_NOT_FOUND);
      }

      const presignedUrl = await S3FileService.generateDownloadFilePresignedURL(fileData.path);

      const updatedFileData = { ...fileData, downloadUrl: presignedUrl };

      return ResponseHelper.sendSuccessResponse(c, 200, FILE_FETCHED, updatedFileData);
    } catch (error: any) {
      throw error;
    }
  }

  public async generateDownloadPresignedUrl(c: Context) {
    try {
      const { fileId } = await c.req.json();
      const fileIdNumber = Number(fileId);

      if (isNaN(fileIdNumber)) {
        return c.json({ error: 'Invalid file ID' }, 400);
      }

      const file = await fileService.findSingleFile(fileIdNumber);

      if (!file) {
        throw new NotFoundException(FILE_NOT_FOUND);
      }

      const filePath = file.path;
      const downloadPresignedUrl = await S3FileService.generateDownloadFilePresignedURL(filePath);

      return c.json({
        url: downloadPresignedUrl,
        path: filePath,
      });
    } catch (error: any) {
      throw error;
    }
  }
}

export const fileController = new FileController();
