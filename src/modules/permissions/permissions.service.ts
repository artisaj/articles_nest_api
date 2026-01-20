import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permission.findMany();
  }

  async findByName(name: string) {
    return this.prisma.permission.findUnique({
      where: { name },
    });
  }

  async assignPermissionToUser(userId: string, permissionId: string) {
    return this.prisma.userPermission.create({
      data: {
        userId,
        permissionId,
      },
    });
  }

  async removePermissionFromUser(userId: string, permissionId: string) {
    return this.prisma.userPermission.delete({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
    });
  }

  async getUserPermissions(userId: string) {
    return this.prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });
  }
}
