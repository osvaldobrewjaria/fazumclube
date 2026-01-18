import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ======================================================
  // GET PROFILE (logged user)
  // ======================================================
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            address: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ======================================================
  // UPDATE PROFILE
  // ======================================================
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ---------------------------
    // Update user basic info
    // ---------------------------
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name ?? user.name,
        email: dto.email ?? user.email,
      },
    });

    // ---------------------------
    // Update or create CustomerProfile
    // ---------------------------
    const profile = await this.prisma.customerProfile.upsert({
      where: { userId },
      update: {
        phone: dto.phone ?? undefined,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        preferences: dto.preferences ?? undefined,
      },
      create: {
        userId,
        phone: dto.phone ?? null,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        preferences: dto.preferences ?? null,
      },
      include: {
        address: true,
      },
    });

    // ---------------------------
    // Update / create Address
    // ---------------------------
    if (dto.address) {
      let addressId = profile.address?.id || undefined;

      if (addressId) {
        await this.prisma.address.update({
          where: { id: addressId },
          data: {
            street: dto.address.street,
            number: dto.address.number,
            complement: dto.address.complement ?? null,
            district: dto.address.district,
            city: dto.address.city,
            state: dto.address.state,
            zipCode: dto.address.zipCode,
            country: dto.address.country ?? 'BR',
          },
        });
      } else {
        const newAddress = await this.prisma.address.create({
          data: {
            street: dto.address.street,
            number: dto.address.number,
            complement: dto.address.complement ?? null,
            district: dto.address.district,
            city: dto.address.city,
            state: dto.address.state,
            zipCode: dto.address.zipCode,
            country: dto.address.country ?? 'BR',
          },
        });

        await this.prisma.customerProfile.update({
          where: { userId },
          data: { addressId: newAddress.id },
        });
      }
    }

    // Return updated full profile
    return this.getProfile(userId);
  }
}
