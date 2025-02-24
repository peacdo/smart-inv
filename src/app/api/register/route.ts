import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { registerSchema } from '@/lib/utils/validation';
import { createErrorResponse } from '@/lib/utils/api-error';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const validatedData = await registerSchema.parseAsync(json);

    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use", code: "EMAIL_EXISTS" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(validatedData.password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json(
      { 
        message: "User registered successfully",
        user: newUser
      },
      { status: 201 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
} 