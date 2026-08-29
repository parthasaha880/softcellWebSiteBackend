import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { v4 as uuidv4 } from "uuid";
import { MediaService } from "./media.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationDto } from "../../common/dto/pagination.dto";

const uploadStorage = diskStorage({
  destination: join(process.cwd(), "uploads"),
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const imageFileFilter = (_req: any, file: any, cb: any) => {
  if (
    file.mimetype.match(
      /\/(jpg|jpeg|png|gif|webp|svg\+xml|svg|bmp|tiff|ico|mp4|webm|mov|avi|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar)$/,
    )
  ) {
    cb(null, true);
  } else {
    cb(new BadRequestException("Unsupported file type"), false);
  }
};

@ApiTags("Media")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("media")
export class MediaController {
  constructor(private svc: MediaService) {}

  @Roles("SUPERADMIN", "ADMIN", "MANAGER", "MARKETER")
  @Get()
  findAll(@Query() q: PaginationDto & { type?: string; folderId?: string }) {
    return this.svc.findAll(q);
  }

  @Roles("SUPERADMIN", "ADMIN", "MANAGER", "MARKETER")
  @Post()
  create(@Body() data: any, @CurrentUser("id") userId: string) {
    return this.svc.create(data, userId);
  }

  @Roles("SUPERADMIN", "ADMIN", "MANAGER", "MARKETER")
  @Post("upload")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: uploadStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser("id") userId: string,
    @Body() body: any,
  ) {
    if (!file) throw new BadRequestException("No file uploaded");
    const mimeType = file.mimetype;
    let type = "DOCUMENT";
    if (mimeType.startsWith("image/")) type = "IMAGE";
    else if (mimeType.startsWith("video/")) type = "VIDEO";

    return this.svc.create(
      {
        filename: file.filename,
        originalName: file.originalname,
        mimeType,
        size: file.size,
        url: `/uploads/${file.filename}`,
        type,
        altText: body?.altText || "",
        caption: body?.caption || "",
      },
      userId,
    );
  }

  @Roles("SUPERADMIN", "ADMIN", "MANAGER", "MARKETER")
  @Put(":id")
  update(@Param("id") id: string, @Body() data: any) {
    return this.svc.update(id, data);
  }

  @Roles("SUPERADMIN", "ADMIN")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.svc.remove(id);
  }

  @Roles("SUPERADMIN", "ADMIN", "MANAGER", "MARKETER")
  @Get("folders")
  findFolders(@Query("parentId") parentId?: string) {
    return this.svc.findFolders(parentId);
  }

  @Roles("SUPERADMIN", "ADMIN", "MANAGER", "MARKETER")
  @Post("folders")
  createFolder(@Body() data: any) {
    return this.svc.createFolder(data);
  }

  @Roles("SUPERADMIN", "ADMIN")
  @Delete("folders/:id")
  deleteFolder(@Param("id") id: string) {
    return this.svc.deleteFolder(id);
  }
}
