import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

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
    try {
      return await this.prisma.userPermission.create({
        data: {
          userId,
          permissionId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('User already has this permission');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('User or permission not found');
        }
      }
      throw error;
    }
  }

  async removePermissionFromUser(userId: string, permissionId: string) {
    try {
      return await this.prisma.userPermission.delete({
        where: {
          userId_permissionId: {
            userId,
            permissionId,
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Permission assignment not found');
        }
      }
      throw error;
    }
  }

  async getUserPermissions(userId: string) {
    return this.prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });
  }
}
