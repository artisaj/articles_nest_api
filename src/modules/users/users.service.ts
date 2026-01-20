import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectPinoLogger(UsersService.name)
    private readonly logger: PinoLogger,
    private prisma: PrismaService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.info({ email: createUserDto.email }, 'Creating new user');

    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      this.logger.warn({ email: createUserDto.email }, 'User creation failed: email already exists');
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.info({ userId: user.id, email: user.email }, 'User created successfully');

    return user;
  }

  async findAll() {
    this.logger.debug('Fetching all users');
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    this.logger.debug({ userId: id }, 'Fetching user by ID');

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user) {
      this.logger.warn({ userId: id }, 'User not found');
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    this.logger.info({ userId: id }, 'Updating user');
    await this.findOne(id);

    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        this.logger.warn({ userId: id, email: updateUserDto.email }, 'User update failed: email already exists');
        throw new ConflictException('Email already exists');
      }
    }

    const data: any = {
      name: updateUserDto.name,
      email: updateUserDto.email,
    };

    if (updateUserDto.password) {
      data.password = await this.hashPassword(updateUserDto.password);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.info({ userId: id }, 'User updated successfully');
    return updatedUser;
  }

  async remove(id: string) {
    this.logger.info({ userId: id }, 'Deleting user');
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.info({ userId: id }, 'User deleted successfully');
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
