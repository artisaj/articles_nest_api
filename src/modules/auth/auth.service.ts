import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    this.logger.info({ email: loginDto.email }, 'Login attempt');

    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      this.logger.warn({ email: loginDto.email }, 'Login failed: user not found');
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.comparePasswords(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn({ email: loginDto.email, userId: user.id }, 'Login failed: invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    const permissions = user.permissions.map((up: any) => up.permission.name);

    const payload = {
      sub: user.id,
      email: user.email,
      permissions,
    };

    this.logger.info({ userId: user.id, email: user.email, permissions }, 'Login successful');

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        permissions,
      },
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findOne(userId);
  }
}
