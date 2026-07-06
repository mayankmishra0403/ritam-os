import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: { email: string; phone: string; password: string; name: string; tenantName: string }) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });
    if (existing) throw new ConflictException('User already exists');

    const hash = await bcrypt.hash(dto.password, 12);
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.tenantName,
        subdomain: dto.tenantName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      },
    });
    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: dto.email,
        phone: dto.phone,
        passwordHash: hash,
        name: dto.name,
        role: 'OWNER',
      },
    });
    const token = this.jwtService.sign({ sub: user.id, tenantId: tenant.id, role: user.role });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  async login(dto: { email?: string; phone?: string; password: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({ sub: user.id, tenantId: user.tenantId, role: user.role });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, phone: true, role: true, tenantId: true } });
  }
}
